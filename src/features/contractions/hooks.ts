import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useMyHousehold } from '@/features/household/hooks';
import { queryKeys } from '@/lib/query/keys';
import {
  createContractionSession,
  deleteContraction,
  endContraction,
  endContractionSession,
  fetchLatestContractionSession,
  startContraction,
  UNIQUE_VIOLATION,
} from './api';
import type { ContractionSession } from './rules';

/**
 * Les appuis s'enchaînent vite (début, fin, début…) : une file unique
 * garantit que chaque écriture part après la précédente — une fin ne part
 * jamais avant que son début soit enregistré.
 */
const CONTRACTIONS_SCOPE = { id: 'contractions' };

/** Identifiants provisoires de l'affichage immédiat, avant la réponse. */
const TEMP_PREFIX = 'temp-';
export const isTempId = (id: string) => id.startsWith(TEMP_PREFIX);

/**
 * Dernier suivi du foyer. Pendant un suivi ouvert, rechargé toutes les 10 s
 * pour suivre ce que l'autre parent chronomètre sur son téléphone.
 */
export function useLatestContractionSession() {
  const { data: household } = useMyHousehold();
  const householdId = household?.id;

  return useQuery({
    queryKey: queryKeys.contractions.latest(householdId ?? ''),
    queryFn: () => fetchLatestContractionSession(householdId as string),
    enabled: Boolean(householdId),
    refetchInterval: (query) =>
      query.state.data && !query.state.data.endedAt ? 10_000 : false,
  });
}

/** Heure courante rafraîchie chaque seconde, pour les chronomètres. */
export function useNow(isRunning: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (!isRunning) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  return now;
}

/**
 * Mutations de l'assistant, avec affichage immédiat (le chronomètre part
 * au toucher, sans attendre le réseau) puis rechargement depuis la base.
 */
export function useContractionActions() {
  const queryClient = useQueryClient();
  const { data: household } = useMyHousehold();
  const householdId = household?.id ?? '';
  const queryKey = queryKeys.contractions.latest(householdId);

  const readCache = () =>
    queryClient.getQueryData<ContractionSession | null>(queryKey) ?? null;

  /** Applique une modification à l'affichage et renvoie l'état d'avant. */
  const patchCache = async (
    update: (current: ContractionSession | null) => ContractionSession | null,
  ) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = readCache();
    queryClient.setQueryData(queryKey, update(previous));
    return { previous };
  };

  const rollback = (
    _error: unknown,
    _variables: unknown,
    context: { previous: ContractionSession | null } | undefined,
  ) => {
    if (context) queryClient.setQueryData(queryKey, context.previous);
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey });

  /** Suivi ouvert réel, en reprenant celui de l'autre parent au besoin. */
  const fetchOpenSession = async () => {
    const latest = await fetchLatestContractionSession(householdId);
    return latest && !latest.endedAt ? latest : null;
  };

  const start = useMutation({
    scope: CONTRACTIONS_SCOPE,
    mutationFn: async ({
      startedAt,
      sessionId,
    }: {
      startedAt: string;
      /** Suivi ouvert affiché, s'il y en a un (jamais un provisoire). */
      sessionId: string | null;
    }) => {
      if (!householdId) throw new Error('No household');
      let id = sessionId;
      if (!id) {
        try {
          id = (await createContractionSession(householdId, startedAt)).id;
        } catch (error) {
          if ((error as { code?: string }).code !== UNIQUE_VIOLATION) {
            throw error;
          }
          id = (await fetchOpenSession())?.id ?? null;
          if (!id) throw error;
        }
      }
      try {
        await startContraction({ id, householdId }, startedAt);
      } catch (error) {
        // L'autre parent a déjà démarré cette contraction : rien à faire,
        // le rechargement l'affichera.
        if ((error as { code?: string }).code !== UNIQUE_VIOLATION) {
          throw error;
        }
      }
    },
    onMutate: ({ startedAt }) =>
      patchCache((current) => {
        const session =
          current && !current.endedAt
            ? current
            : {
                id: `${TEMP_PREFIX}session`,
                startedAt,
                endedAt: null,
                contractions: [],
              };
        return {
          ...session,
          contractions: [
            ...session.contractions,
            { id: `${TEMP_PREFIX}${startedAt}`, startedAt, endedAt: null },
          ],
        };
      }),
    onError: rollback,
    onSettled: refresh,
  });

  const end = useMutation({
    scope: CONTRACTIONS_SCOPE,
    mutationFn: async ({ id, endedAt }: { id: string; endedAt: string }) => {
      // Fin touchée avant que le début soit revenu du serveur : la file a
      // attendu l'enregistrement, on retrouve la contraction ouverte.
      const realId = isTempId(id)
        ? (await fetchOpenSession())?.contractions.find((c) => !c.endedAt)?.id
        : id;
      if (realId) await endContraction(realId, endedAt);
    },
    onMutate: ({ id, endedAt }) =>
      patchCache((current) =>
        current
          ? {
              ...current,
              contractions: current.contractions.map((c) =>
                c.id === id ? { ...c, endedAt } : c,
              ),
            }
          : current,
      ),
    onError: rollback,
    onSettled: refresh,
  });

  const finish = useMutation({
    scope: CONTRACTIONS_SCOPE,
    mutationFn: async ({ endedAt }: { endedAt: string }) => {
      const session = await fetchOpenSession();
      if (!session) return;
      const open = session.contractions.find((c) => !c.endedAt);
      if (open) await endContraction(open.id, endedAt);
      await endContractionSession(session.id, endedAt);
    },
    onMutate: ({ endedAt }) =>
      patchCache((current) =>
        current
          ? {
              ...current,
              endedAt,
              contractions: current.contractions.map((c) =>
                c.endedAt ? c : { ...c, endedAt },
              ),
            }
          : current,
      ),
    onError: rollback,
    onSettled: refresh,
  });

  const remove = useMutation({
    scope: CONTRACTIONS_SCOPE,
    mutationFn: (id: string) => deleteContraction(id),
    onMutate: (id) =>
      patchCache((current) =>
        current
          ? {
              ...current,
              contractions: current.contractions.filter((c) => c.id !== id),
            }
          : current,
      ),
    onError: rollback,
    onSettled: refresh,
  });

  return { start, end, finish, remove };
}

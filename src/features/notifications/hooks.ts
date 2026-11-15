import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { type Href, useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';

import { useAppointments } from '@/features/health/hooks';
import { useMyHousehold } from '@/features/household/hooks';
import { useProcedures } from '@/features/procedures/hooks';
import {
  type NotificationPreferences,
  updateMyNotificationPreferences,
} from '@/features/profile/api';
import { useMyProfile } from '@/features/profile/hooks';
import { useMyWeekCheckins } from '@/features/together/hooks';
import { sessionAtom } from '@/lib/atoms/session';
import { todayIso } from '@/lib/date';
import { queryKeys } from '@/lib/query/keys';

import {
  buildAppointmentReminders,
  buildMoodReminders,
  buildProcedureReminders,
  syncLocalReminders,
} from './reminders';
import {
  areNotificationsSupported,
  configureNotifications,
  ensureNotificationPermission,
  getNotificationPermission,
  registerPushToken,
} from './setup';

function openNotificationUrl(
  router: ReturnType<typeof useRouter>,
  response: Notifications.NotificationResponse | null,
) {
  if (
    !response ||
    response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
  ) {
    return;
  }
  const url = response.notification.request.content.data?.url;
  if (typeof url === 'string' && url.startsWith('/')) {
    router.push(url as Href);
  }
}

/**
 * Notifications (demande explicite), montées une fois dans le layout des
 * onglets :
 *  - autorisation demandée à la première arrivée sur l'app, puis token de
 *    l'appareil enregistré pour les push de l'autre parent (`send-push`) ;
 *  - rappels locaux de rendez-vous et de démarches reprogrammés dès que les
 *    données ou les préférences changent (y compris en direct, via
 *    `useHouseholdRealtime`) ;
 *  - toucher une notification ouvre l'écran concerné.
 */
export function useNotifications() {
  const router = useRouter();
  const userId = useAtomValue(sessionAtom)?.user.id;
  const { data: profile } = useMyProfile();
  const { data: household } = useMyHousehold();
  const appointmentsQuery = useAppointments(household);
  const proceduresQuery = useProcedures(household);
  // Humeur du jour déjà partagée ? (rappel d'humeur, personne enceinte).
  const checkinsQuery = useMyWeekCheckins(household);
  const isPregnant = Boolean(userId && household?.pregnant_user_id === userId);

  // 1. Mise en place, autorisation, token push.
  useEffect(() => {
    if (!areNotificationsSupported || !userId) return;
    let isCancelled = false;
    (async () => {
      await configureNotifications();
      const isGranted = await ensureNotificationPermission();
      if (isGranted && !isCancelled) {
        await registerPushToken().catch(() => {
          // Pas de push possible (Expo Go, Firebase absent…) : les rappels
          // locaux fonctionnent quand même.
        });
      }
    })();

    // Nouvel essai à chaque retour dans l'app : le premier peut échouer
    // (réseau, autorisation donnée plus tard dans les réglages du
    // téléphone…). Sans effet si le token est déjà à jour (upsert).
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') return;
      getNotificationPermission().then((permission) => {
        if (permission === 'granted') registerPushToken().catch(() => {});
      });
    });

    return () => {
      isCancelled = true;
      subscription.remove();
    };
  }, [userId]);

  // 2. Rappels locaux.
  const isDataReady =
    Boolean(profile) &&
    Boolean(household) &&
    appointmentsQuery.isSuccess &&
    proceduresQuery.isSuccess &&
    (!isPregnant || checkinsQuery.isSuccess);

  const reminders = useMemo(() => {
    if (!isDataReady || !profile || !household) return [];
    return [
      ...(profile.notify_appointments
        ? buildAppointmentReminders(appointmentsQuery.data ?? [])
        : []),
      ...(profile.notify_procedures
        ? buildProcedureReminders(proceduresQuery.data ?? [], household)
        : []),
      ...(isPregnant && profile.notify_mood_reminder
        ? buildMoodReminders({
            hasCheckedInToday: Boolean(checkinsQuery.data?.[todayIso()]),
            isSolo: household.accompaniment_type === 'seul',
          })
        : []),
    ];
  }, [
    isDataReady,
    profile,
    household,
    appointmentsQuery.data,
    proceduresQuery.data,
    isPregnant,
    checkinsQuery.data,
  ]);

  const signature = reminders
    .map((r) => `${r.id}|${r.date.getTime()}|${r.title}|${r.body}`)
    .join('\n');

  // biome-ignore lint/correctness/useExhaustiveDependencies: `signature` résume `reminders` ; reprogrammer seulement quand le contenu change.
  useEffect(() => {
    if (!areNotificationsSupported || !isDataReady) return;
    getNotificationPermission().then((permission) => {
      if (permission === 'granted') {
        syncLocalReminders(reminders).catch(() => {});
      }
    });
  }, [signature, isDataReady]);

  // 3. Toucher une notification : app déjà lancée, ou lancée par le toucher.
  useEffect(() => {
    if (!areNotificationsSupported) return;
    Notifications.getLastNotificationResponseAsync().then((response) =>
      openNotificationUrl(router, response),
    );
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => openNotificationUrl(router, response),
    );
    return () => subscription.remove();
  }, [router]);
}

/**
 * Autorisation système, relue au retour dans l'app (l'utilisateur a pu
 * l'activer dans les réglages du téléphone entre-temps).
 */
export function useNotificationPermission() {
  const query = useQuery({
    queryKey: ['notifications', 'permission'],
    queryFn: getNotificationPermission,
    enabled: areNotificationsSupported,
  });
  const { refetch } = query;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') refetch();
    });
    return () => subscription.remove();
  }, [refetch]);

  return query;
}

/** Interrupteurs de Réglages, mis à jour tout de suite à l'écran. */
export function useUpdateNotificationPreferences() {
  const userId = useAtomValue(sessionAtom)?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<NotificationPreferences>) => {
      if (!userId) throw new Error('No authenticated user');
      return updateMyNotificationPreferences(userId, patch);
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.mine });
      const previous = queryClient.getQueryData(queryKeys.profile.mine);
      queryClient.setQueryData(
        queryKeys.profile.mine,
        (current: object | undefined) =>
          current ? { ...current, ...patch } : current,
      );
      return { previous };
    },
    onError: (_error, _patch, context) => {
      queryClient.setQueryData(queryKeys.profile.mine, context?.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
  });
}

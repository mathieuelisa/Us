import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useMyHousehold } from '@/features/household/hooks';
import { queryKeys } from '@/lib/query/keys';
import { supabase } from '@/lib/supabase/client';

/** Tables de l'espace diffusées par Supabase Realtime (migration `realtime_household_tables`). */
type RealtimeTable =
  | 'households'
  | 'profiles'
  | 'mood_checkins'
  | 'symptoms_log'
  | 'appointments'
  | 'contacts'
  | 'household_info_items'
  | 'household_procedures'
  | 'household_checklist_items'
  | 'household_custom_checklist_items'
  | 'baby_entries'
  | 'name_swipes'
  | 'contraction_sessions'
  | 'contractions'
  | 'household_entitlements';

/**
 * Requêtes à recharger quand une table change. `null` : tout recharger
 * (l'espace lui-même — arrivée du partenaire, naissance déclarée — change
 * le contenu de presque tous les écrans).
 */
function keysForTable(
  table: RealtimeTable,
  householdId: string,
): QueryKey[] | null {
  switch (table) {
    case 'households':
      return null;
    // Prénom, photo, pronom : profil affiché et résumé du hub (prénom de
    // l'autre parent).
    case 'profiles':
      return [queryKeys.profile.all, queryKeys.hub.all];
    case 'mood_checkins':
      return [queryKeys.together.all, queryKeys.hub.all];
    case 'symptoms_log':
      return [
        ['health', householdId, 'symptoms'],
        ['health', householdId, 'symptom-dates'],
        queryKeys.hub.all,
      ];
    case 'appointments':
      return [queryKeys.health.appointments(householdId), queryKeys.hub.all];
    case 'contacts':
      return [queryKeys.health.contacts(householdId)];
    case 'household_info_items':
      return [queryKeys.household.infoItems(householdId)];
    case 'household_procedures':
      return [queryKeys.procedures.all, queryKeys.hub.all];
    case 'household_checklist_items':
    case 'household_custom_checklist_items':
      return [queryKeys.organisation.all, queryKeys.hub.all];
    case 'baby_entries':
      return [queryKeys.baby.all];
    case 'name_swipes':
      return [queryKeys.names.all];
    case 'contraction_sessions':
    case 'contractions':
      return [queryKeys.contractions.all];
    // Premium acheté (ou remboursé) par l'autre parent : le droit change, et
    // avec lui les données premium visibles (bébé, prénoms, contractions).
    case 'household_entitlements':
      return [
        queryKeys.premium.all,
        queryKeys.baby.all,
        queryKeys.names.all,
        queryKeys.contractions.all,
      ];
  }
}

const HOUSEHOLD_TABLES: RealtimeTable[] = [
  'mood_checkins',
  'symptoms_log',
  'appointments',
  'contacts',
  'household_info_items',
  'household_procedures',
  'household_checklist_items',
  'household_custom_checklist_items',
  'baby_entries',
  'name_swipes',
  'contraction_sessions',
  'contractions',
  'household_entitlements',
];

/** Regroupe les événements rapprochés (ex. une série d'insertions) en un seul rechargement. */
const FLUSH_DELAY_MS = 300;

/**
 * Mises à jour en direct (demande explicite) : quand l'autre parent note son
 * humeur, un symptôme, un rendez-vous partagé, coche une démarche…, les
 * écrans ouverts se mettent à jour sans geste. Équivalent de Mercure côté
 * Supabase : Realtime (Postgres Changes), qui applique les policies SELECT —
 * un rendez-vous non partagé n'est jamais diffusé à l'autre parent.
 *
 * Chaque événement invalide les requêtes TanStack Query concernées : les
 * écrans affichés rechargent, les autres seront à jour à leur ouverture.
 * Ne fonctionne qu'app ouverte ; au retour au premier plan, le
 * rechargement au focus (`query-client.ts`) rattrape ce qui a été manqué.
 *
 * À monter une seule fois, dans le layout des onglets.
 */
export function useHouseholdRealtime() {
  const queryClient = useQueryClient();
  const { data: household } = useMyHousehold();
  const householdId = household?.id;
  // Profils suivis : les deux parents de l'espace (un seul en « Seul·e »).
  const memberIds = [household?.pregnant_user_id, household?.partner_user_id]
    .filter(Boolean)
    .join(',');

  useEffect(() => {
    if (!householdId) return;

    let pending = new Set<string>();
    let invalidateEverything = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const flush = () => {
      timer = null;
      if (invalidateEverything) {
        queryClient.invalidateQueries();
      } else {
        for (const serialized of pending) {
          queryClient.invalidateQueries({
            queryKey: JSON.parse(serialized) as QueryKey,
          });
        }
      }
      pending = new Set();
      invalidateEverything = false;
    };

    const schedule = (keys: QueryKey[] | null) => {
      if (keys === null) invalidateEverything = true;
      else for (const key of keys) pending.add(JSON.stringify(key));
      if (!timer) timer = setTimeout(flush, FLUSH_DELAY_MS);
    };

    const channel = supabase.channel(`household-db:${householdId}`);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'households',
        filter: `id=eq.${householdId}`,
      },
      () => schedule(keysForTable('households', householdId)),
    );
    if (memberIds) {
      channel.on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=in.(${memberIds})`,
        },
        () => schedule(keysForTable('profiles', householdId)),
      );
    }
    for (const table of HOUSEHOLD_TABLES) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `household_id=eq.${householdId}`,
        },
        () => schedule(keysForTable(table, householdId)),
      );
    }

    // Après une coupure (réseau, mise en veille), la reconnexion ne rejoue
    // pas les événements manqués : on recharge tout une fois reconnecté.
    let hasSubscribedOnce = false;
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        if (hasSubscribedOnce) schedule(null);
        hasSubscribedOnce = true;
      }
    });

    // Suppressions : les Postgres Changes filtrés ne les transmettent pas.
    // Un déclencheur en base (migration `realtime_household_deletes`) publie
    // sur ce canal privé, réservé aux membres de l'espace, le seul nom de la
    // table concernée.
    const deletions = supabase
      .channel(`household:${householdId}`, { config: { private: true } })
      .on('broadcast', { event: 'row_deleted' }, ({ payload }) => {
        const table = (payload as { table?: string } | undefined)?.table;
        schedule(
          table && (HOUSEHOLD_TABLES as string[]).includes(table)
            ? keysForTable(table as RealtimeTable, householdId)
            : null,
        );
      })
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
      supabase.removeChannel(deletions);
    };
  }, [householdId, memberIds, queryClient]);
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import { acceptHouseholdInvite } from '@/features/onboarding/api';
import { currentRoleAtom } from '@/lib/atoms/role';
import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import {
  createInfoItem,
  deleteInfoItem,
  fetchInfoItems,
  fetchMyHousehold,
  type Household,
  type HouseholdInfoItem,
  reorderInfoItems,
  updateInfoItem,
} from './api';

/**
 * Foyer de l'utilisateur courant, et point d'entrée du rattachement du
 * co-parent : si l'utilisateur n'a pas encore de foyer, on regarde s'il a
 * été invité et on l'y rattache avant de conclure qu'il doit faire
 * l'onboarding. C'est ce qui distingue « second parent qui rejoint » de
 * « premier parent qui crée l'espace ».
 *
 * `null` (et non `undefined`) signifie « résolu : pas de foyer » — c'est ce
 * que le routage racine attend pour envoyer vers l'onboarding.
 */
export function useMyHousehold() {
  const session = useAtomValue(sessionAtom);

  return useQuery({
    queryKey: queryKeys.household.mine,
    queryFn: async () => {
      const existing = await fetchMyHousehold();
      if (existing) return existing;

      const joinedHouseholdId = await acceptHouseholdInvite();
      return joinedHouseholdId ? await fetchMyHousehold() : null;
    },
    enabled: Boolean(session?.user.id),
  });
}

/**
 * Alimente `currentRoleAtom` à partir du foyer résolu. Le rôle n'est pas une
 * donnée stockée sur l'utilisateur : il se déduit de sa place dans le foyer
 * (porteur vs co-parent), et c'est lui qui pilotera le thème et les règles
 * de visibilité par rôle (cf. DOCS/04-ARCHITECTURE.md).
 */
export function useSyncCurrentRole(household: Household | null | undefined) {
  const session = useAtomValue(sessionAtom);
  const setCurrentRole = useSetAtom(currentRoleAtom);
  const userId = session?.user.id;

  useEffect(() => {
    if (!household || !userId) {
      setCurrentRole(null);
      return;
    }
    setCurrentRole(
      household.pregnant_user_id === userId ? 'pregnant' : 'partner',
    );
  }, [household, userId, setCurrentRole]);
}

export function useInfoItems(householdId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.household.infoItems(householdId ?? ''),
    queryFn: () => fetchInfoItems(householdId as string),
    enabled: Boolean(householdId),
  });
}

export function useCreateInfoItem(householdId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      label,
      value,
      category,
      sortOrder,
    }: {
      label: string;
      value: string | null;
      category: string | null;
      sortOrder: number;
    }) => {
      if (!householdId) throw new Error('No household');
      return createInfoItem(householdId, { label, value, category }, sortOrder);
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.household.infoItems(householdId),
        });
      }
    },
  });
}

export function useUpdateInfoItem(householdId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<
        Pick<HouseholdInfoItem, 'label' | 'value' | 'category' | 'sort_order'>
      >;
    }) => updateInfoItem(id, patch),
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.household.infoItems(householdId),
        });
      }
    },
  });
}

export function useDeleteInfoItem(householdId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInfoItem(id),
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.household.infoItems(householdId),
        });
      }
    },
  });
}

export function useReorderInfoItems(householdId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      reorderInfoItems(items),
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.household.infoItems(householdId),
        });
      }
    },
  });
}

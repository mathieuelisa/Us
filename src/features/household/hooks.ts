import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import {
  createInfoItem,
  deleteInfoItem,
  fetchInfoItems,
  fetchMyHousehold,
  type HouseholdInfoItem,
  reorderInfoItems,
  updateInfoItem,
} from './api';

export function useMyHousehold() {
  return useQuery({
    queryKey: queryKeys.household.mine,
    queryFn: fetchMyHousehold,
  });
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
      sortOrder,
    }: {
      label: string;
      value: string | null;
      sortOrder: number;
    }) => {
      if (!householdId) throw new Error('No household');
      return createInfoItem(householdId, { label, value }, sortOrder);
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
      patch: Partial<Pick<HouseholdInfoItem, 'label' | 'value' | 'sort_order'>>;
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

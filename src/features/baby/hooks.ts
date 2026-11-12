import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useMyHousehold } from '@/features/household/hooks';
import { queryKeys } from '@/lib/query/keys';
import {
  type BabyEntryInput,
  createBabyEntry,
  deleteBabyEntry,
  fetchBabyEntries,
  updateBabyEntry,
} from './api';
import type { BabyModuleSlug } from './constants';

/** Historique d'un module de suivi bébé, partagé par les deux parents. */
export function useBabyEntries(module: BabyModuleSlug) {
  const { data: household } = useMyHousehold();
  const householdId = household?.id;

  return useQuery({
    queryKey: queryKeys.baby.entries(householdId ?? '', module),
    queryFn: () => fetchBabyEntries(householdId as string, module),
    enabled: Boolean(householdId),
  });
}

/**
 * Ajout (`id` absent) ou correction (`id` présent) d'une entrée. La liste
 * est rechargée ensuite : c'est la base qui la trie.
 */
export function useSaveBabyEntry(module: BabyModuleSlug) {
  const queryClient = useQueryClient();
  const { data: household } = useMyHousehold();
  const householdId = household?.id;

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string | null;
      input: BabyEntryInput;
    }) => {
      if (!householdId) throw new Error('No household');
      return id
        ? updateBabyEntry(id, input)
        : createBabyEntry(householdId, module, input);
    },
    onSuccess: () => {
      if (householdId) {
        return queryClient.invalidateQueries({
          queryKey: queryKeys.baby.entries(householdId, module),
        });
      }
    },
  });
}

/** Suppression définitive d'une entrée, pour les deux parents. */
export function useDeleteBabyEntry(module: BabyModuleSlug) {
  const queryClient = useQueryClient();
  const { data: household } = useMyHousehold();
  const householdId = household?.id;

  return useMutation({
    mutationFn: (id: string) => deleteBabyEntry(id),
    onSuccess: () => {
      if (householdId) {
        return queryClient.invalidateQueries({
          queryKey: queryKeys.baby.entries(householdId, module),
        });
      }
    },
  });
}

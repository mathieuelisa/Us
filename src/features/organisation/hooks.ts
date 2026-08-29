import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Household } from '@/features/household/api';
import { queryKeys } from '@/lib/query/keys';
import {
  createCustomChecklistItem,
  deleteCustomChecklistItem,
  fetchChecklistItems,
  updateChecklistItemChecked,
} from './api';

export function useChecklistItems(household: Household | null | undefined) {
  return useQuery({
    queryKey: queryKeys.organisation.checklistItems(household?.id ?? ''),
    queryFn: () => fetchChecklistItems(household?.id as string),
    enabled: Boolean(household?.id),
  });
}

/**
 * Invalidations communes aux trois mutations de checklist : la liste
 * elle-même, et le résumé du hub qui affiche « X/Y complétés » sur cette
 * section — un ajout change le dénominateur, pas seulement le numérateur.
 */
function useInvalidateChecklists(householdId: string | undefined) {
  const queryClient = useQueryClient();

  return () => {
    if (!householdId) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.organisation.checklistItems(householdId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.hub.summary(householdId),
    });
  };
}

export function useToggleChecklistItem(
  household: Household | null | undefined,
) {
  const invalidate = useInvalidateChecklists(household?.id);

  return useMutation({
    mutationFn: (input: {
      itemId: string;
      checked: boolean;
      isCustom: boolean;
    }) =>
      updateChecklistItemChecked(input.itemId, input.checked, input.isCustom),
    onSuccess: invalidate,
  });
}

export function useAddCustomChecklistItem(
  household: Household | null | undefined,
) {
  const invalidate = useInvalidateChecklists(household?.id);
  const householdId = household?.id;

  return useMutation({
    mutationFn: (input: {
      checklistSlug: string;
      category: string | null;
      label: string;
      sortOrder: number;
    }) =>
      createCustomChecklistItem({
        householdId: householdId as string,
        ...input,
      }),
    onSuccess: invalidate,
  });
}

export function useDeleteCustomChecklistItem(
  household: Household | null | undefined,
) {
  const invalidate = useInvalidateChecklists(household?.id);

  return useMutation({
    mutationFn: (itemId: string) => deleteCustomChecklistItem(itemId),
    onSuccess: invalidate,
  });
}

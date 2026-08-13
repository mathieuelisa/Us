import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Household } from '@/features/household/api';
import { queryKeys } from '@/lib/query/keys';
import { fetchChecklistItems, updateChecklistItemChecked } from './api';

export function useChecklistItems(household: Household | null | undefined) {
  return useQuery({
    queryKey: queryKeys.organisation.checklistItems(household?.id ?? ''),
    queryFn: () => fetchChecklistItems(household?.id as string),
    enabled: Boolean(household?.id),
  });
}

export function useToggleChecklistItem(
  household: Household | null | undefined,
) {
  const queryClient = useQueryClient();
  const householdId = household?.id;

  return useMutation({
    mutationFn: (input: {
      householdChecklistItemId: string;
      checked: boolean;
    }) =>
      updateChecklistItemChecked(input.householdChecklistItemId, input.checked),
    onSuccess: () => {
      if (!householdId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.organisation.checklistItems(householdId),
      });
      // Le hub affiche « X/Y complétés » sur cette section.
      queryClient.invalidateQueries({
        queryKey: queryKeys.hub.summary(householdId),
      });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Household } from '@/features/household/api';
import { queryKeys } from '@/lib/query/keys';
import {
  fetchProcedures,
  updateProcedureReminder,
  updateProcedureStatus,
} from './api';

export function useProcedures(household: Household | null | undefined) {
  return useQuery({
    queryKey: queryKeys.procedures.list(household?.id ?? ''),
    queryFn: () => fetchProcedures(household?.id as string),
    enabled: Boolean(household?.id),
  });
}

function useInvalidateProcedures(householdId: string | undefined) {
  const queryClient = useQueryClient();
  return () => {
    if (!householdId) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.procedures.list(householdId),
    });
    // Le hub affiche « X démarches en attente » sur ce pilier.
    queryClient.invalidateQueries({
      queryKey: queryKeys.hub.summary(householdId),
    });
  };
}

export function useUpdateProcedureStatus(
  household: Household | null | undefined,
) {
  const invalidate = useInvalidateProcedures(household?.id);

  return useMutation({
    mutationFn: (input: {
      householdProcedureId: string;
      status: 'a_faire' | 'en_cours' | 'fait';
    }) => updateProcedureStatus(input.householdProcedureId, input.status),
    onSuccess: invalidate,
  });
}

export function useUpdateProcedureReminder(
  household: Household | null | undefined,
) {
  const invalidate = useInvalidateProcedures(household?.id);

  return useMutation({
    mutationFn: (input: {
      householdProcedureId: string;
      reminderEnabled: boolean;
    }) =>
      updateProcedureReminder(
        input.householdProcedureId,
        input.reminderEnabled,
      ),
    onSuccess: invalidate,
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Household } from '@/features/household/api';
import { queryKeys } from '@/lib/query/keys';
import { declareBirth } from './api';

/**
 * Déclaration de la naissance (écran 7a). Le succès invalide bien plus que
 * le foyer lui-même : l'échéance légale des démarches et le compteur du hub
 * se dérivent tous les deux de `birth_date`, ils afficheraient sinon encore
 * « 5 jours à partir de la naissance » jusqu'au prochain remontage d'écran.
 */
export function useDeclareBirth(household: Household | null | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (birthDate: string) => {
      if (!household?.id) throw new Error('No household');
      return declareBirth(household.id, birthDate);
    },
    onSuccess: (updated) => {
      // La ligne renvoyée par l'`update ... select()` est la vérité : on la
      // pose directement plutôt que d'attendre le refetch, pour que l'écran
      // bascule sur son état « déclarée » sans passer par un état vide.
      queryClient.setQueryData(queryKeys.household.mine, updated);
      queryClient.invalidateQueries({
        queryKey: queryKeys.procedures.list(updated.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hub.summary(updated.id),
      });
    },
  });
}

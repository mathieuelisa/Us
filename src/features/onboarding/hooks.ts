import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import type { OnboardingDraft } from '@/lib/atoms/onboarding';
import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import { completeOnboarding } from './api';

/**
 * Soumission finale de l'onboarding : crée le foyer. Plus d'invitation par
 * email (demande explicite du 2026-11-15) : le ou la partenaire rejoint
 * ensuite l'espace avec un code temporaire, partagé depuis l'accueil
 * (« Ajouter votre partenaire »).
 */
export function useSubmitOnboarding() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ draft }: { draft: OnboardingDraft }) => {
      if (!userId) throw new Error('No authenticated user');
      return completeOnboarding(userId, draft);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.household.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

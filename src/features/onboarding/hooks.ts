import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import type { OnboardingDraft } from '@/lib/atoms/onboarding';
import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import { completeOnboarding, invitePartner } from './api';

/**
 * Soumission finale de l'onboarding : crée le foyer puis, si un email de
 * co-parent a été saisi, envoie l'invitation. L'invitation est volontairement
 * non bloquante — un foyer créé mais un email non parti reste un état
 * rattrapable (l'invitation pourra être renvoyée), alors que perdre tout
 * l'onboarding parce que l'email a échoué ne l'est pas.
 */
export function useSubmitOnboarding() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      draft,
      partnerEmail,
    }: {
      draft: OnboardingDraft;
      partnerEmail: string | null;
    }) => {
      if (!userId) throw new Error('No authenticated user');

      const household = await completeOnboarding(userId, draft);

      if (partnerEmail) {
        try {
          await invitePartner(household.id, partnerEmail);
        } catch (error) {
          console.warn('Household created but partner invite failed', error);
        }
      }

      return household;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.household.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

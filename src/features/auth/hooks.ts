import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { Uniwind } from 'uniwind';

import { DEFAULT_THEME_ID } from '@/features/settings/constants';
import {
  EMPTY_ONBOARDING_DRAFT,
  onboardingDraftAtom,
} from '@/lib/atoms/onboarding';
import { currentRoleAtom } from '@/lib/atoms/role';
import { sessionAtom } from '@/lib/atoms/session';
import { queryClient } from '@/lib/query/query-client';

/**
 * Remet l'app à zéro dès que le compte connecté change — déconnexion, ou
 * connexion d'un autre compte.
 *
 * Indispensable sur un téléphone partagé : les données en cache ne sont pas
 * toutes rangées par compte (`household.mine`, `profile.mine`) et restent
 * « fraîches » 30 s. Sans ce nettoyage, le compte suivant pouvait voir le
 * foyer — données de santé comprises — du compte précédent, ou être envoyé
 * au hub au lieu de l'onboarding.
 *
 * Remis à zéro : tout le cache TanStack Query, le rôle, le brouillon
 * d'onboarding et le thème (personnel à chaque compte). Rien n'est fait au
 * premier rendu, quand la session est simplement restaurée.
 */
export function useResetOnAccountChange() {
  const userId = useAtomValue(sessionAtom)?.user.id ?? null;
  const setCurrentRole = useSetAtom(currentRoleAtom);
  const setOnboardingDraft = useSetAtom(onboardingDraftAtom);
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const previousUserId = previousUserIdRef.current;
    previousUserIdRef.current = userId;
    if (previousUserId === undefined || previousUserId === userId) return;

    queryClient.clear();
    setCurrentRole(null);
    setOnboardingDraft(EMPTY_ONBOARDING_DRAFT);
    Uniwind.setTheme(DEFAULT_THEME_ID);
  }, [userId, setCurrentRole, setOnboardingDraft]);
}

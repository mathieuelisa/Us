import type { Session } from '@supabase/supabase-js';
import { useSetAtom } from 'jotai';
import { useCallback, useRef } from 'react';
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
 * Enregistre une nouvelle session, et remet l'app à zéro **avant** si le
 * compte a changé (déconnexion, ou connexion d'un autre compte).
 *
 * Indispensable sur un téléphone partagé : les données en cache ne sont pas
 * toutes rangées par compte (`household.mine`, `profile.mine`) et restent
 * « fraîches » 30 s. Sans ce nettoyage, le compte suivant pouvait voir le
 * foyer — données de santé comprises — du compte précédent.
 *
 * ⚠️ L'ordre compte : le cache est vidé **avant** que la session ne change.
 * Une première version le vidait dans un effet, après coup — mais à ce
 * moment la requête du foyer du nouveau compte avait déjà démarré, et
 * `queryClient.clear()` l'annulait en silence : elle restait « en attente »
 * pour toujours, et la connexion tournait sans fin jusqu'au rechargement.
 *
 * Rien n'est remis à zéro au premier appel (session restaurée au démarrage),
 * ni quand on passe d'aucun compte à un compte : le cache a déjà été vidé à
 * la déconnexion précédente.
 *
 * Remis à zéro : tout le cache TanStack Query, le rôle, le brouillon
 * d'onboarding et le thème (personnel à chaque compte).
 */
export function useApplySession() {
  const setSession = useSetAtom(sessionAtom);
  const setCurrentRole = useSetAtom(currentRoleAtom);
  const setOnboardingDraft = useSetAtom(onboardingDraftAtom);
  const currentUserIdRef = useRef<string | null | undefined>(undefined);

  return useCallback(
    (session: Session | null) => {
      const previousUserId = currentUserIdRef.current;
      const nextUserId = session?.user.id ?? null;
      currentUserIdRef.current = nextUserId;

      if (
        previousUserId !== undefined &&
        previousUserId !== null &&
        previousUserId !== nextUserId
      ) {
        queryClient.clear();
        setCurrentRole(null);
        setOnboardingDraft(EMPTY_ONBOARDING_DRAFT);
        Uniwind.setTheme(DEFAULT_THEME_ID);
      }

      setSession(session);
    },
    [setSession, setCurrentRole, setOnboardingDraft],
  );
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import type { AppLanguage } from '@/i18n/languages';
import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import {
  fetchMyProfile,
  markMyHomeTourSeen,
  type Profile,
  type ProfilePronoun,
  updateMyAvatar,
  updateMyIsPartner,
  updateMyLanguage,
  updateMyPartnerIntro,
  updateMyProfile,
  updateMyTheme,
} from './api';

export function useMyProfile() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;

  return useQuery({
    queryKey: queryKeys.profile.mine,
    queryFn: () => fetchMyProfile(userId as string),
    enabled: Boolean(userId),
  });
}

export function useUpdateMyProfile() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (firstName: string) => {
      if (!userId) throw new Error('No authenticated user');
      return updateMyProfile(userId, { first_name: firstName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

/**
 * Pas de `Button.isDisabled`/état de chargement affiché : le thème
 * s'applique déjà instantanément côté client (`Uniwind.setTheme`) avant
 * même que cette mutation ne parte — l'écriture Supabase n'est là que pour
 * que le choix survive à une reconnexion, pas pour le feedback visuel.
 */
export function useUpdateMyTheme() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (theme: string) => {
      if (!userId) throw new Error('No authenticated user');
      return updateMyTheme(userId, theme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

/**
 * Enregistre la langue choisie dans Réglages. Comme le thème, elle
 * s'applique d'abord côté client (`setAppLanguage`) : l'écriture ne sert
 * qu'à la retrouver sur un autre téléphone ou après réinstallation.
 */
export function useUpdateMyLanguage() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (language: AppLanguage | null) => {
      if (!userId) throw new Error('No authenticated user');
      return updateMyLanguage(userId, language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

/**
 * Marque la visite guidée de l'accueil comme vue. Optimiste : le cache du
 * profil passe tout de suite à `true`, pour qu'elle ne se relance pas
 * pendant que la requête part. Un échec n'est pas signalé : au pire, elle
 * repassera une fois.
 */
export function useMarkHomeTourSeen() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('No authenticated user');
      return markMyHomeTourSeen(userId);
    },
    onMutate: () => {
      queryClient.setQueryData<Profile | null>(
        queryKeys.profile.mine,
        (current) =>
          current ? { ...current, has_seen_home_tour: true } : current,
      );
    },
  });
}

/** Choix de l'avatar dans la modale de la page Profil. */
export function useUpdateMyAvatar() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatar: string | null) => {
      if (!userId) throw new Error('No authenticated user');
      return updateMyAvatar(userId, avatar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

/** « Je crée mon espace » depuis l'écran Rejoindre : n'est plus partenaire. */
export function useUpdateMyIsPartner() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isPartner: boolean) => {
      if (!userId) throw new Error('No authenticated user');
      return updateMyIsPartner(userId, isPartner);
    },
    // Cache mis à jour tout de suite : l'écran suivant lit `is_partner` pour
    // aiguiller, il ne doit pas voir l'ancienne valeur le temps du
    // rechargement.
    onSuccess: (_data, isPartner) => {
      queryClient.setQueryData<Profile>(queryKeys.profile.mine, (current) =>
        current ? { ...current, is_partner: isPartner } : current,
      );
      return queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

/** Prénom et pronom du partenaire, avant de rejoindre l'espace. */
export function useSavePartnerIntro() {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (intro: { firstName: string; pronoun: ProfilePronoun }) => {
      if (!userId) throw new Error('No authenticated user');
      return updateMyPartnerIntro(userId, intro);
    },
    onSuccess: (_data, intro) => {
      queryClient.setQueryData<Profile>(queryKeys.profile.mine, (current) =>
        current
          ? {
              ...current,
              first_name: intro.firstName,
              pronoun: intro.pronoun,
              is_partner: true,
            }
          : current,
      );
      return queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
  });
}

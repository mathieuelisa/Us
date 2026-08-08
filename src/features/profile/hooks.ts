import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import { fetchMyProfile, updateMyProfile, updateMyTheme } from './api';

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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { useMyHousehold } from '@/features/household/hooks';
import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import {
  addNameFavorite,
  fetchMyNameFavorites,
  fetchNameSwipes,
  type NameFavorite,
  type NameSwipe,
  recordNameSwipe,
  removeNameFavorite,
} from './api';
import type { NameGender } from './catalog';

/** Clé d'un prénom dans les ensembles : le genre compte (« Alba » fille). */
export function nameKey(gender: NameGender, name: string): string {
  return `${gender}:${name}`;
}

function useHouseholdAndUser() {
  const { data: household } = useMyHousehold();
  const session = useAtomValue(sessionAtom);
  return { householdId: household?.id, userId: session?.user.id };
}

/** Choix des deux parents du foyer. */
export function useNameSwipes() {
  const { householdId } = useHouseholdAndUser();
  return useQuery({
    queryKey: queryKeys.names.swipes(householdId ?? ''),
    queryFn: () => fetchNameSwipes(householdId as string),
    enabled: Boolean(householdId),
  });
}

/** Prénoms déjà swipés par soi, pour ne plus les reproposer. */
export function useMyDecidedNames(gender: NameGender): Set<string> {
  const { userId } = useHouseholdAndUser();
  const { data: swipes = [] } = useNameSwipes();
  return new Set(
    swipes
      .filter((swipe) => swipe.user_id === userId && swipe.gender === gender)
      .map((swipe) => swipe.name),
  );
}

export type NameMatch = { gender: NameGender; name: string };

/**
 * « Vos matchs » : les prénoms gardés (swipe à droite) par soi **et** par
 * l'autre parent. Vide tant que le partenaire n'a pas rejoint ni swipé.
 */
export function useNameMatches(): {
  matches: NameMatch[];
  isLoading: boolean;
} {
  const { userId } = useHouseholdAndUser();
  const { data: swipes = [], isLoading } = useNameSwipes();
  return { matches: computeMatches(swipes, userId), isLoading };
}

function computeMatches(
  swipes: NameSwipe[],
  userId: string | undefined,
): NameMatch[] {
  if (!userId) return [];
  const likedByPartner = new Set(
    swipes
      .filter((swipe) => swipe.liked && swipe.user_id !== userId)
      .map((swipe) => nameKey(swipe.gender as NameGender, swipe.name)),
  );
  return swipes
    .filter(
      (swipe) =>
        swipe.liked &&
        swipe.user_id === userId &&
        likedByPartner.has(nameKey(swipe.gender as NameGender, swipe.name)),
    )
    .map((swipe) => ({
      gender: swipe.gender as NameGender,
      name: swipe.name,
    }));
}

export function useRecordNameSwipe() {
  const queryClient = useQueryClient();
  const { householdId, userId } = useHouseholdAndUser();

  return useMutation({
    mutationFn: (input: {
      gender: NameGender;
      name: string;
      liked: boolean;
    }) => {
      if (!householdId || !userId) throw new Error('No household or user');
      return recordNameSwipe({ householdId, userId, ...input });
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.names.swipes(householdId),
        });
      }
    },
  });
}

/** Ses favoris (personnels). */
export function useNameFavorites() {
  const { householdId } = useHouseholdAndUser();
  return useQuery({
    queryKey: queryKeys.names.favorites(householdId ?? ''),
    queryFn: () => fetchMyNameFavorites(householdId as string),
    enabled: Boolean(householdId),
  });
}

/**
 * Ajoute ou retire un favori. Mise à jour optimiste : le cœur de la carte
 * réagit tout de suite, la requête suit.
 */
export function useToggleNameFavorite() {
  const queryClient = useQueryClient();
  const { householdId, userId } = useHouseholdAndUser();
  const key = queryKeys.names.favorites(householdId ?? '');

  return useMutation({
    mutationFn: (input: {
      gender: NameGender;
      name: string;
      favorite: boolean;
    }) => {
      if (!householdId || !userId) throw new Error('No household or user');
      const target = {
        householdId,
        userId,
        gender: input.gender,
        name: input.name,
      };
      return input.favorite
        ? addNameFavorite(target)
        : removeNameFavorite(target);
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NameFavorite[]>(key);
      queryClient.setQueryData<NameFavorite[]>(key, (current = []) =>
        input.favorite
          ? [
              {
                id: `optimistic-${input.name}`,
                household_id: householdId ?? '',
                user_id: userId ?? '',
                gender: input.gender,
                name: input.name,
                created_at: new Date().toISOString(),
              },
              ...current,
            ]
          : current.filter(
              (favorite) =>
                !(
                  favorite.gender === input.gender &&
                  favorite.name === input.name
                ),
            ),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

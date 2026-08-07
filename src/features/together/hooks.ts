import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import type { Household } from '@/features/household/api';
import type { MoodValue } from '@/features/hub/api';
import type { HouseholdRole } from '@/lib/atoms/role';
import { sessionAtom } from '@/lib/atoms/session';
import { todayIso } from '@/lib/date';
import { queryKeys } from '@/lib/query/keys';
import {
  fetchGestureSuggestions,
  fetchMyWeekCheckins,
  getCurrentWeekIsoDates,
  pickGestureOfTheDay,
  upsertMoodCheckin,
} from './api';

export function useMyWeekCheckins(household: Household | null | undefined) {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const weekDates = getCurrentWeekIsoDates();

  return useQuery({
    queryKey: queryKeys.together.weekCheckins(
      household?.id ?? '',
      userId ?? '',
      weekDates[0],
    ),
    queryFn: () =>
      fetchMyWeekCheckins(household?.id as string, userId as string, weekDates),
    enabled: Boolean(household?.id && userId),
  });
}

export function useGestureOfTheDay(role: HouseholdRole) {
  return useQuery({
    queryKey: queryKeys.together.gesture(role),
    queryFn: async () =>
      pickGestureOfTheDay(await fetchGestureSuggestions(role)),
  });
}

export function useUpsertMoodCheckin(household: Household | null | undefined) {
  const session = useAtomValue(sessionAtom);
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const weekStart = getCurrentWeekIsoDates()[0];

  return useMutation({
    mutationFn: ({
      mood,
      needNote,
    }: {
      mood: MoodValue;
      needNote?: string | null;
    }) => {
      if (!household || !userId) throw new Error('No household or user');
      return upsertMoodCheckin({
        householdId: household.id,
        userId,
        date: todayIso(),
        mood,
        needNote,
      });
    },
    onSuccess: () => {
      if (!household || !userId) return;
      queryClient.invalidateQueries({
        queryKey: queryKeys.together.weekCheckins(
          household.id,
          userId,
          weekStart,
        ),
      });
      // Le hub lit hasCheckedInToday : sans cette invalidation, le pilier
      // Ensemble resterait sur « Check-in du jour » après un check-in.
      queryClient.invalidateQueries({
        queryKey: queryKeys.hub.summary(household.id),
      });
    },
  });
}

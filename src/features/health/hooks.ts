import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import type { Household } from '@/features/household/api';
import { sessionAtom } from '@/lib/atoms/session';
import { queryKeys } from '@/lib/query/keys';
import {
  createAppointment,
  createContact,
  deleteAppointment,
  deleteContact,
  fetchAppointments,
  fetchBabySize,
  fetchContacts,
  fetchExercises,
  fetchSymptomDates,
  fetchSymptomsForDate,
  reorderContacts,
  saveSymptoms,
} from './api';

function useIds(household: Household | null | undefined) {
  const session = useAtomValue(sessionAtom);
  return { householdId: household?.id, userId: session?.user.id };
}

/**
 * Les invalidations sont volontairement ciblées plutôt que portées sur tout
 * le domaine `health` : `exercises` et `baby_size_by_week` sont des
 * référentiels statiques et partagés, les recharger à chaque symptôme
 * enregistré serait du gaspillage pur.
 */
function useInvalidate(householdId: string | undefined) {
  const queryClient = useQueryClient();

  return (keys: readonly (readonly unknown[])[]) => {
    if (!householdId) return;
    for (const queryKey of keys) {
      queryClient.invalidateQueries({ queryKey });
    }
  };
}

// ---------------------------------------------------------------- Journal

export function useSymptomsForDate(
  household: Household | null | undefined,
  logDate: string,
) {
  const { householdId, userId } = useIds(household);

  return useQuery({
    queryKey: queryKeys.health.symptoms(householdId ?? '', logDate),
    queryFn: () =>
      fetchSymptomsForDate(householdId as string, userId as string, logDate),
    enabled: Boolean(householdId && userId),
  });
}

export function useSymptomDates(
  household: Household | null | undefined,
  dates: string[],
) {
  const { householdId, userId } = useIds(household);

  return useQuery({
    queryKey: queryKeys.health.symptomDates(householdId ?? '', dates[0] ?? ''),
    queryFn: () =>
      fetchSymptomDates(householdId as string, userId as string, dates),
    enabled: Boolean(householdId && userId && dates.length > 0),
  });
}

export function useSaveSymptoms(household: Household | null | undefined) {
  const { householdId, userId } = useIds(household);
  const invalidate = useInvalidate(householdId);

  return useMutation({
    mutationFn: ({
      logDate,
      symptoms,
    }: {
      logDate: string;
      symptoms: string[];
    }) => {
      if (!householdId || !userId) throw new Error('No household or user');
      return saveSymptoms({ householdId, userId, logDate, symptoms });
    },
    onSuccess: (_data, variables) => {
      invalidate([
        queryKeys.health.symptoms(householdId as string, variables.logDate),
        // Préfixe sans la semaine : la pastille du calendrier doit se
        // rafraîchir quelle que soit la semaine affichée.
        ['health', householdId as string, 'symptom-dates'],
      ]);
    },
  });
}

// ----------------------------------------------------------- Rendez-vous

export function useAppointments(household: Household | null | undefined) {
  const { householdId } = useIds(household);

  return useQuery({
    queryKey: queryKeys.health.appointments(householdId ?? ''),
    queryFn: () => fetchAppointments(householdId as string),
    enabled: Boolean(householdId),
  });
}

export function useCreateAppointment(household: Household | null | undefined) {
  const { householdId, userId } = useIds(household);
  const invalidate = useInvalidate(householdId);

  return useMutation({
    mutationFn: (input: {
      title: string;
      appointmentDate: string;
      appointmentTime: string | null;
      address: string | null;
      isShared: boolean;
    }) => {
      if (!householdId || !userId) throw new Error('No household or user');
      return createAppointment({ householdId, userId, ...input });
    },
    onSuccess: () => {
      invalidate([
        queryKeys.health.appointments(householdId as string),
        // Le hub affiche le prochain rendez-vous dans le pilier Suivi santé.
        queryKeys.hub.summary(householdId as string),
      ]);
    },
  });
}

export function useDeleteAppointment(household: Household | null | undefined) {
  const { householdId } = useIds(household);
  const invalidate = useInvalidate(householdId);

  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      invalidate([
        queryKeys.health.appointments(householdId as string),
        queryKeys.hub.summary(householdId as string),
      ]);
    },
  });
}

// -------------------------------------------------------------- Contacts

export function useContacts(household: Household | null | undefined) {
  const { householdId } = useIds(household);

  return useQuery({
    queryKey: queryKeys.health.contacts(householdId ?? ''),
    queryFn: () => fetchContacts(householdId as string),
    enabled: Boolean(householdId),
  });
}

export function useCreateContact(household: Household | null | undefined) {
  const { householdId } = useIds(household);
  const invalidate = useInvalidate(householdId);

  return useMutation({
    mutationFn: (input: {
      name: string;
      roleLabel: string | null;
      address: string | null;
      phone: string | null;
      isEmergency: boolean;
      sortOrder: number;
    }) => {
      if (!householdId) throw new Error('No household');
      return createContact({ householdId, ...input });
    },
    onSuccess: () => {
      invalidate([queryKeys.health.contacts(householdId as string)]);
    },
  });
}

export function useDeleteContact(household: Household | null | undefined) {
  const { householdId } = useIds(household);
  const invalidate = useInvalidate(householdId);

  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      invalidate([queryKeys.health.contacts(householdId as string)]);
    },
  });
}

export function useReorderContacts(household: Household | null | undefined) {
  const { householdId } = useIds(household);
  const invalidate = useInvalidate(householdId);

  return useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      reorderContacts(items),
    onSuccess: () => {
      invalidate([queryKeys.health.contacts(householdId as string)]);
    },
  });
}

// ------------------------------------------------------ Contenu statique

export function useExercises() {
  return useQuery({
    queryKey: queryKeys.health.exercises,
    queryFn: fetchExercises,
  });
}

export function useBabySize(weekOfAmenorrhea: number | null) {
  return useQuery({
    queryKey: queryKeys.health.babySize(weekOfAmenorrhea ?? 0),
    queryFn: () => fetchBabySize(weekOfAmenorrhea as number),
    enabled: weekOfAmenorrhea !== null,
  });
}

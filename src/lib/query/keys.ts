/**
 * Convention: one const per domain, each key is an array starting with the
 * domain name so `queryClient.invalidateQueries({ queryKey: queryKeys.household.all })`
 * invalidates every query under that domain. Add a new domain here as each
 * feature lands (see DOCS/02-ACTION-PLAN.md) instead of inlining query keys
 * in components.
 */
export const queryKeys = {
  profile: {
    all: ['profile'] as const,
    mine: ['profile', 'mine'] as const,
  },
  household: {
    all: ['household'] as const,
    mine: ['household', 'mine'] as const,
    infoItems: (householdId: string) =>
      ['household', householdId, 'info-items'] as const,
  },
  hub: {
    all: ['hub'] as const,
    summary: (householdId: string) => ['hub', householdId, 'summary'] as const,
  },
  together: {
    all: ['together'] as const,
    weekCheckins: (householdId: string, userId: string, weekStart: string) =>
      ['together', householdId, userId, 'week', weekStart] as const,
    gesture: (role: string) => ['together', 'gesture', role] as const,
  },
  health: {
    all: ['health'] as const,
    symptoms: (householdId: string, date: string) =>
      ['health', householdId, 'symptoms', date] as const,
    symptomDates: (householdId: string, weekStart: string) =>
      ['health', householdId, 'symptom-dates', weekStart] as const,
    appointments: (householdId: string) =>
      ['health', householdId, 'appointments'] as const,
    contacts: (householdId: string) =>
      ['health', householdId, 'contacts'] as const,
    exercises: ['health', 'exercises'] as const,
    babySize: (week: number) => ['health', 'baby-size', week] as const,
  },
} as const;

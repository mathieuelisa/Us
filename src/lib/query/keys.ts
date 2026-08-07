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
} as const;

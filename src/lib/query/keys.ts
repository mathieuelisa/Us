/**
 * Convention: one const per domain, each key is an array starting with the
 * domain name so `queryClient.invalidateQueries({ queryKey: queryKeys.household.all })`
 * invalidates every query under that domain. Add a new domain here as each
 * feature lands (see DOCS/02-ACTION-PLAN.md) instead of inlining query keys
 * in components.
 *
 * Example once the household domain exists:
 *   household: {
 *     all: ['household'] as const,
 *     detail: (householdId: string) => ['household', householdId] as const,
 *   },
 */
export const queryKeys = {} as const;

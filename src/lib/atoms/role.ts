import { atom } from 'jotai';

/**
 * Role of the current user within their household. Drives the per-role
 * theming and content differences described in DOCS/01-DESIGN-OVERVIEW.md
 * and the visibility rules in DOCS/CONCEPT.md (Journal, Rendez-vous, etc.).
 */
export type HouseholdRole = 'pregnant' | 'partner';

export const currentRoleAtom = atom<HouseholdRole | null>(null);

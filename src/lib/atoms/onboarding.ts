import { atom } from 'jotai';

import type {
  AccompanimentType,
  ReminderFrequency,
} from '@/features/onboarding/constants';

/**
 * Brouillon de l'onboarding multi-étapes. Vit en mémoire (Jotai) et n'est
 * écrit en base qu'à la toute fin du parcours — cf. DOCS/02-ACTION-PLAN.md
 * §1.2 « persistance finale en Supabase ». Conséquence assumée : quitter
 * l'app en cours d'onboarding fait repartir de zéro.
 */
export type OnboardingDraft = {
  accompanimentType: AccompanimentType | null;
  partnerUsesApp: boolean;
  firstName: string;
  partnerFirstName: string;
  dueDate: string | null;
  isFirstChild: boolean | null;
  professionalStatus: string | null;
  priorities: string[];
  reminderFrequency: ReminderFrequency | null;
  /** Email d'invitation du co-parent, vide si l'étape a été passée. */
  partnerEmail: string;
};

export const EMPTY_ONBOARDING_DRAFT: OnboardingDraft = {
  accompanimentType: null,
  partnerUsesApp: true,
  firstName: '',
  partnerFirstName: '',
  dueDate: null,
  isFirstChild: true,
  professionalStatus: null,
  priorities: [],
  reminderFrequency: null,
  partnerEmail: '',
};

export const onboardingDraftAtom = atom<OnboardingDraft>(
  EMPTY_ONBOARDING_DRAFT,
);

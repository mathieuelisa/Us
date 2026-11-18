import type { TFunction } from 'i18next';

import { daysBetween, todayIso } from '@/lib/date';

/**
 * Écart maximal accepté entre aujourd'hui et la date saisie sur l'écran 7a.
 * Le futur est refusé net (on ne déclare pas une naissance qui n'a pas eu
 * lieu) ; le passé est borné à un an, la molette proposant des années
 * antérieures qu'un faux mouvement rendrait sélectionnables.
 */
const MAX_DAYS_IN_PAST = 365;

export type BirthDateIssue = 'future' | 'too-old' | null;

export function getBirthDateIssue(birthDate: string | null): BirthDateIssue {
  if (!birthDate) return null;
  const daysFromToday = daysBetween(todayIso(), birthDate);
  if (daysFromToday > 0) return 'future';
  if (daysFromToday < -MAX_DAYS_IN_PAST) return 'too-old';
  return null;
}

export const BIRTH_DATE_ISSUE_MESSAGE = {
  future: 'birth.issues.future',
  'too-old': 'birth.issues.tooOld',
} as const satisfies Record<Exclude<BirthDateIssue, null>, string>;

/** « mardi 8 septembre 2026 » — le rappel complet avant de confirmer. */
export function formatBirthDateLong(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** « 8 septembre » — forme courte des cartes récapitulatives. */
export function formatBirthDateShort(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Ancienneté de la naissance, formulée sans jamais genrer le bébé : l'app
 * ne connaît pas son sexe et ne le demande nulle part — « né il y a… »
 * trancherait à sa place.
 */
export function formatSinceBirth(birthDate: string, t: TFunction): string {
  const days = -daysBetween(todayIso(), birthDate);

  if (days <= 0) return t('birth.since.today');
  if (days === 1) return t('birth.since.yesterday');
  if (days < 14) return t('birth.since.days', { count: days });

  const weeks = Math.floor(days / 7);
  if (weeks < 9) return t('birth.since.weeks', { count: weeks });

  const months = Math.floor(days / 30);
  return t('birth.since.months', { count: months });
}

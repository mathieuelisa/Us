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

export const BIRTH_DATE_ISSUE_MESSAGE: Record<
  Exclude<BirthDateIssue, null>,
  string
> = {
  future:
    'Cette date est dans le futur — la naissance se déclare une fois le bébé arrivé.',
  'too-old': 'Cette date remonte à plus d’un an, vérifiez l’année choisie.',
};

/** « mardi 8 septembre 2026 » — le rappel complet avant de confirmer. */
export function formatBirthDateLong(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** « 8 septembre » — forme courte des cartes récapitulatives. */
export function formatBirthDateShort(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Ancienneté de la naissance, formulée sans jamais genrer le bébé : l'app
 * ne connaît pas son sexe et ne le demande nulle part — « né il y a… »
 * trancherait à sa place.
 */
export function formatSinceBirth(birthDate: string): string {
  const days = -daysBetween(todayIso(), birthDate);

  if (days <= 0) return 'Depuis aujourd’hui';
  if (days === 1) return 'Depuis hier';
  if (days < 14) return `Il y a ${days} jours`;

  const weeks = Math.floor(days / 7);
  if (weeks < 9) return `Il y a ${weeks} semaines`;

  const months = Math.floor(days / 30);
  return months === 1 ? 'Il y a 1 mois' : `Il y a ${months} mois`;
}

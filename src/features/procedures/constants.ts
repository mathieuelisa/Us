import { daysBetween, shiftIsoDate, todayIso } from '@/lib/date';

export const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'a_faire', label: 'À faire' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'fait', label: 'Fait' },
];

export function getStatusLabel(status: string): string {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
  );
}

function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Une seule démarche a une échéance légale précise : la déclaration de
 * naissance (5 jours). Les 7 autres n'ont pas de `deadline_days_after_birth`
 * en base — demande explicite d'afficher quand même un repère sous le titre
 * pour elles, avec un texte fixe plutôt qu'un délai inventé.
 *
 * `null` pour `birthDate` **restera le cas de tout le monde tant que la
 * Phase 2 n'est pas construite** : "J'ai accouché" ne renseigne pas encore
 * `households.birth_date`. Le calcul de date précise ci-dessous n'a donc
 * jamais tourné en conditions réelles.
 */
export function formatDeadlineLabel(
  deadlineDaysAfterBirth: number | null,
  birthDate: string | null,
): string {
  if (deadlineDaysAfterBirth === null) return 'Le plus rapidement possible';

  if (!birthDate) {
    return `${deadlineDaysAfterBirth} jours à partir de la naissance`;
  }

  const dueDate = shiftIsoDate(birthDate, deadlineDaysAfterBirth);
  const daysLeft = daysBetween(todayIso(), dueDate);

  if (daysLeft < 0) return 'Échéance dépassée';
  if (daysLeft === 0) return 'Échéance aujourd’hui';
  return `Jusqu’au ${formatLongDate(dueDate)}`;
}

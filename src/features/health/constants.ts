import { daysBetween, todayIso } from '@/lib/date';

/**
 * Catalogue des symptômes proposés (écran 4a). Stocké en slugs dans
 * `symptoms_log.symptoms`, jamais le libellé : le texte affiché doit pouvoir
 * évoluer sans réécrire des données de santé déjà enregistrées.
 *
 * Pas de table dédiée en base, contrairement à `exercises` ou
 * `gesture_suggestions` : cette liste est fermée et fait partie de
 * l'interface (des cases à cocher), pas d'un contenu éditorial appelé à
 * s'enrichir. À déplacer en base le jour où elle devient configurable.
 */
export const SYMPTOM_OPTIONS: { value: string; label: string }[] = [
  { value: 'vomissements', label: 'Vomissements' },
  { value: 'vertiges', label: 'Vertiges' },
  { value: 'mal_de_dos', label: 'Mal de dos' },
  { value: 'fatigue', label: 'Fatigue' },
];

export function getSymptomLabel(value: string): string {
  return (
    SYMPTOM_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

/** Durée de référence d'une grossesse, comptée depuis les dernières règles. */
const PREGNANCY_DAYS = 280;

/**
 * Semaine d'aménorrhée (SA) courante, déduite de la date de terme — la seule
 * date que l'onboarding collecte. `null` si le terme est inconnu : mieux vaut
 * ne rien afficher qu'un chiffre faux sur un sujet de santé.
 */
export function getWeeksOfAmenorrhea(
  dueDate: string | null,
  today: string = todayIso(),
): number | null {
  if (!dueDate) return null;

  const gestationalDays = PREGNANCY_DAYS - daysBetween(today, dueDate);
  if (gestationalDays < 0) return null;

  return Math.floor(gestationalDays / 7);
}

/**
 * Découpage français : 1er trimestre jusqu'à 15 SA, 2e jusqu'à 28 SA, 3e
 * au-delà.
 */
export function getTrimester(weeksOfAmenorrhea: number): 1 | 2 | 3 {
  if (weeksOfAmenorrhea <= 15) return 1;
  if (weeksOfAmenorrhea <= 28) return 2;
  return 3;
}

export const TRIMESTER_LABELS: Record<1 | 2 | 3, string> = {
  1: '1er trimestre',
  2: '2ème trimestre',
  3: '3ème trimestre',
};

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export function formatMonthTitle(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatAppointmentSummary(
  isoDate: string,
  time: string | null,
): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const datePart = new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
  if (!time) return datePart;

  const [hours, minutes] = time.split(':');
  return `${datePart} · ${hours}h${minutes}`;
}

/**
 * Accepte « 10:30 », « 10h30 » ou « 1030 » et renvoie le format `time` de
 * Postgres. `null` si la saisie est vide ou inexploitable — le champ est
 * facultatif, une heure fausse serait pire que pas d'heure.
 */
export function parseTimeInput(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length < 3 || digits.length > 4) return null;

  const hours = Number(digits.slice(0, digits.length - 2));
  const minutes = Number(digits.slice(-2));
  if (hours > 23 || minutes > 59) return null;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

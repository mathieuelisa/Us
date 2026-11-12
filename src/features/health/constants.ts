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
  { value: 'reflux_gastrique', label: 'Reflux gastrique' },
  { value: 'bouffees_de_chaleur', label: 'Bouffées de chaleur' },
  { value: 'insomnies', label: 'Insomnies' },
  { value: 'nausees', label: 'Nausées' },
];

/**
 * « Pas de symptômes » (demande explicite) : valeur spéciale stockée dans
 * `symptoms_log.symptoms` pour dire qu'une journée a bien été renseignée
 * sans symptôme — sinon une journée vide et une journée oubliée seraient
 * indiscernables. Exclusive : la choisir retire les symptômes, cocher un
 * symptôme la retire. Jamais comptée comme un symptôme (`withoutNoSymptom`).
 */
export const NO_SYMPTOM = 'aucun';
export const NO_SYMPTOM_LABEL = 'Pas de symptômes';

/** Les symptômes réels d'une liste, sans la valeur « Pas de symptômes ». */
export function withoutNoSymptom(symptoms: string[]): string[] {
  return symptoms.filter((symptom) => symptom !== NO_SYMPTOM);
}

/**
 * Pictogramme et teinte de fond de chaque symptôme : ils rendent la liste
 * lisible d'un coup d'œil. Purement visuel — la valeur stockée reste celle
 * de `SYMPTOM_OPTIONS`. Repli neutre pour un symptôme ajouté sans entrée ici.
 */
export const SYMPTOM_VISUALS: Record<string, { emoji: string; tint: string }> =
  {
    vomissements: { emoji: '🤮', tint: '#e3f3e4' },
    vertiges: { emoji: '😵‍💫', tint: '#ece6f7' },
    mal_de_dos: { emoji: '🦴', tint: '#fbe5d6' },
    fatigue: { emoji: '😴', tint: '#e3ecf8' },
    reflux_gastrique: { emoji: '🔥', tint: '#fde6d8' },
    bouffees_de_chaleur: { emoji: '🌡️', tint: '#fbe0e4' },
    insomnies: { emoji: '🛌', tint: '#e6e7f8' },
    nausees: { emoji: '🤢', tint: '#e0f2ec' },
    [NO_SYMPTOM]: { emoji: '😊', tint: '#e5f4e7' },
  };
const FALLBACK_SYMPTOM_VISUAL = { emoji: '•', tint: '#f0f0f3' };

export function getSymptomVisual(value: string): {
  emoji: string;
  tint: string;
} {
  return SYMPTOM_VISUALS[value] ?? FALLBACK_SYMPTOM_VISUAL;
}

export function getSymptomLabel(value: string): string {
  if (value === NO_SYMPTOM) return NO_SYMPTOM_LABEL;
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
 * Mois de grossesse en cours (1 à 9), déduit de la date de terme.
 *
 * Compté depuis la conception (SA − 2) par tranches de 4,345 semaines —
 * un mois moyen —, comme le font les calendriers de grossesse français :
 * 14 SA → 3e mois, 29 SA → 7e, 39 SA → 9e. Borné à 1–9 (un terme dépassé
 * reste au 9e mois). `null` si le terme est inconnu.
 */
export function getPregnancyMonth(
  dueDate: string | null,
  today: string = todayIso(),
): number | null {
  const weeks = getWeeksOfAmenorrhea(dueDate, today);
  if (weeks === null) return null;
  const month = Math.floor(Math.max(weeks - 2, 0) / 4.345) + 1;
  return Math.min(Math.max(month, 1), 9);
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

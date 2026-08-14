import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { daysBetween, shiftIsoDate, todayIso } from '@/lib/date';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Icône et couleur pastel par démarche (`procedure_templates.slug`) —
 * demande explicite pour distinguer visuellement les 8 démarches dans la
 * liste. `bg` sert à la fois au fond du logo et à celui du tag « À faire »
 * assorti ; `color` à l'icône et au texte du tag, pour que les deux
 * partagent visiblement la même couleur.
 */
export const PROCEDURE_ICON_STYLE: Record<
  string,
  { icon: IoniconName; bg: string; color: string }
> = {
  'declaration-naissance': {
    icon: 'footsteps-outline',
    bg: '#FBE1E8',
    color: '#D9647F',
  },
  caf: { icon: 'business-outline', bg: '#DCEAFB', color: '#4E7FC4' },
  'securite-sociale': {
    icon: 'shield-checkmark-outline',
    bg: '#DEF3E6',
    color: '#3FA66E',
  },
  mutuelle: { icon: 'heart-outline', bg: '#EAE1F8', color: '#8A63C9' },
  'conge-employeur': {
    icon: 'briefcase-outline',
    bg: '#FBE4D8',
    color: '#DD8355',
  },
  'mode-de-garde': {
    icon: 'school-outline',
    bg: '#FCF0C9',
    color: '#C99A2E',
  },
  'assurance-habitation': {
    icon: 'home-outline',
    bg: '#D9F2EE',
    color: '#2E9C93',
  },
  'administration-fiscale': {
    icon: 'receipt-outline',
    bg: '#F3E4D3',
    color: '#B87A45',
  },
};

const DEFAULT_PROCEDURE_ICON_STYLE: {
  icon: IoniconName;
  bg: string;
  color: string;
} = { icon: 'document-text-outline', bg: '#EDEDED', color: '#8A8A8A' };

export function getProcedureIconStyle(slug: string) {
  return PROCEDURE_ICON_STYLE[slug] ?? DEFAULT_PROCEDURE_ICON_STYLE;
}

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

/**
 * Mois de grossesse (1 à 9) auquel rattacher chaque démarche pour le
 * listing par mois sous "X sur 8 complétées" (demande explicite). Seuls
 * quatre mois sont ancrés par la demande — déclaration de naissance / congé
 * employeur / CAF / mutuelle au 9e mois, assurance habitation au 5e — le
 * reste (sécurité sociale, mode de garde, administration fiscale) est
 * réparti à ma discrétion, l'utilisateur a dit ajuster l'ordre plus tard.
 */
export const PROCEDURE_PREGNANCY_MONTH: Record<string, number> = {
  'mode-de-garde': 3,
  'assurance-habitation': 5,
  'securite-sociale': 6,
  'administration-fiscale': 7,
  'declaration-naissance': 9,
  'conge-employeur': 9,
  caf: 9,
  mutuelle: 9,
};

export const PREGNANCY_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function getPregnancyMonthLabel(month: number): string {
  return month === 1 ? '1er mois de grossesse' : `${month}e mois de grossesse`;
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

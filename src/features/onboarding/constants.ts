/**
 * Contenu des 6 étapes d'onboarding (écrans 1d, 1z, 1b, 1c, 1e, 1f du
 * Hi-Fi). Les libellés sont repris tels quels des maquettes ; les valeurs
 * stockées sont des slugs stables, jamais le libellé affiché, pour que le
 * texte puisse évoluer sans migration.
 */

export const ONBOARDING_STEP_COUNT = 6;

export type AccompanimentType = 'couple' | 'coparentalite' | 'seul' | 'autre';

export const ACCOMPANIMENT_OPTIONS: {
  value: AccompanimentType;
  label: string;
}[] = [
  { value: 'couple', label: 'En couple' },
  { value: 'coparentalite', label: 'Coparentalité sans vivre ensemble' },
  { value: 'seul', label: 'Seul·e' },
  { value: 'autre', label: 'Autre' },
];

export const PROFESSIONAL_STATUS_OPTIONS: {
  value: string;
  label: string;
}[] = [
  { value: 'salarie_prive', label: 'Salarié·e secteur privé' },
  { value: 'fonctionnaire', label: 'Fonctionnaire' },
  { value: 'independant', label: 'Indépendant·e' },
  { value: 'sans_emploi', label: 'Sans emploi actuellement' },
];

export const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'demarches', label: 'Démarches administratives' },
  { value: 'sante', label: 'Suivi santé' },
  { value: 'partage', label: 'Partage avec le co-parent' },
  { value: 'rendez_vous', label: 'Dates et rendez-vous importants' },
];

export type ReminderFrequency = 'realtime' | 'weekly';

export const REMINDER_OPTIONS: {
  value: ReminderFrequency;
  label: string;
  description: string;
}[] = [
  {
    value: 'realtime',
    label: 'Au fil de l’eau',
    description: 'Une notification à chaque étape',
  },
  {
    value: 'weekly',
    label: 'Résumé hebdomadaire',
    description: 'Un récap chaque semaine',
  },
];

/**
 * Le co-parent n'est invité que si le mode d'accompagnement implique
 * quelqu'un d'autre ET que ce quelqu'un compte utiliser l'app (question
 * posée à l'étape 1). Sinon l'étape d'invitation est sautée — déduit de
 * CONCEPT.md, non spécifié explicitement par les maquettes.
 */
export function shouldInvitePartner(
  accompanimentType: AccompanimentType | null,
  partnerUsesApp: boolean,
): boolean {
  if (!partnerUsesApp) return false;
  return (
    accompanimentType === 'couple' || accompanimentType === 'coparentalite'
  );
}

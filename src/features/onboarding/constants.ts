import type { TranslationKey } from '@/i18n/types';

/**
 * Contenu des 6 étapes d'onboarding (écrans 1d, 1z, 1b, 1c, 1e, 1f du
 * Hi-Fi). Les libellés (clés de traduction, `onboarding.*`) reprennent les
 * maquettes ; les valeurs
 * stockées sont des slugs stables, jamais le libellé affiché, pour que le
 * texte puisse évoluer sans migration.
 */

export const ONBOARDING_STEP_COUNT = 6;

/**
 * `autre` n'est plus proposé à l'onboarding (demande explicite), mais reste
 * dans le type : des espaces déjà créés peuvent l'avoir, et la contrainte
 * `households.accompaniment_type` l'accepte toujours.
 */
export type AccompanimentType = 'couple' | 'coparentalite' | 'seul' | 'autre';

export const ACCOMPANIMENT_OPTIONS: {
  value: AccompanimentType;
  label: TranslationKey;
}[] = [
  { value: 'couple', label: 'onboarding.accompaniment.options.couple' },
  {
    value: 'coparentalite',
    label: 'onboarding.accompaniment.options.coparentalite',
  },
  { value: 'seul', label: 'onboarding.accompaniment.options.seul' },
];

export const PROFESSIONAL_STATUS_OPTIONS: {
  value: string;
  label: TranslationKey;
}[] = [
  { value: 'salarie_prive', label: 'onboarding.status.options.salarie_prive' },
  { value: 'fonctionnaire', label: 'onboarding.status.options.fonctionnaire' },
  { value: 'independant', label: 'onboarding.status.options.independant' },
  { value: 'sans_emploi', label: 'onboarding.status.options.sans_emploi' },
];

export const PRIORITY_OPTIONS: { value: string; label: TranslationKey }[] = [
  { value: 'demarches', label: 'onboarding.priorities.options.demarches' },
  { value: 'sante', label: 'onboarding.priorities.options.sante' },
  { value: 'partage', label: 'onboarding.priorities.options.partage' },
  { value: 'rendez_vous', label: 'onboarding.priorities.options.rendez_vous' },
];

export type ReminderFrequency = 'realtime' | 'weekly';

export const REMINDER_OPTIONS: {
  value: ReminderFrequency;
  label: TranslationKey;
  description: TranslationKey;
}[] = [
  {
    value: 'realtime',
    label: 'onboarding.reminders.options.realtime.label',
    description: 'onboarding.reminders.options.realtime.description',
  },
  {
    value: 'weekly',
    label: 'onboarding.reminders.options.weekly.label',
    description: 'onboarding.reminders.options.weekly.description',
  },
];

/**
 * Y a-t-il un co-parent à qui demander un prénom (étape 2) et à qui envoyer
 * une invitation (écran 2d) ?
 *
 * Deux conditions, dans cet ordre :
 *  - « Seul·e » exclut par définition un co-parent, quelle que soit la
 *    réponse à la question suivante ;
 *  - sinon, c'est la réponse à « Le co-parent utilisera-t-il aussi l'app ? »
 *    qui décide.
 *
 * « Autre » (plus proposé, mais présent sur d'anciens espaces) est donc
 * traité comme les modes avec co-parent : c'est la réponse Oui/Non qui
 * tranche.
 *
 * Déduit de CONCEPT.md, non spécifié explicitement par les maquettes.
 */
export function shouldInvitePartner(
  accompanimentType: AccompanimentType | null,
  partnerUsesApp: boolean,
): boolean {
  if (accompanimentType === null || accompanimentType === 'seul') return false;
  return partnerUsesApp;
}

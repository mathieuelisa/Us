/**
 * Contenu des 6 étapes d'onboarding (écrans 1d, 1z, 1b, 1c, 1e, 1f du
 * Hi-Fi). Les libellés sont repris tels quels des maquettes ; les valeurs
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
  label: string;
}[] = [
  { value: 'couple', label: 'En couple' },
  { value: 'coparentalite', label: 'Coparentalité sans vivre ensemble' },
  { value: 'seul', label: 'Seul·e' },
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
  { value: 'partage', label: 'Partage avec votre partenaire' },
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

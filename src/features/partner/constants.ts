import type { HouseholdRole } from '@/lib/atoms/role';
import { pickForToday } from '@/lib/date';

/**
 * Palette rose propre à « Mon partenaire » : exception voulue au thème
 * personnel (demande explicite) — la page reste rose quel que soit le
 * thème choisi en Réglages, là où tous les autres écrans suivent
 * `useThemeBackground`/`useThemeAccent`. `AppTabBar` reprend `background`
 * sous la barre quand cette route est active, pour éviter une bande d'une
 * autre teinte en bas d'écran.
 */
export const PARTNER_PINK = {
  background: '#fdf0f6',
  blob: '#f9d9e8',
  accent: '#d6457f',
  soft: '#fbe1ec',
  tag: '#fcdbe9',
  tagText: '#c2306b',
  line: '#f1d3e1',
  heading: '#5b5470',
} as const;

/**
 * Astuces du jour, une par rôle. Volontairement en constante côté client et
 * non en base, contrairement à `gesture_suggestions` : il s'agit d'un
 * contenu court et figé, et une table de plus n'apporterait rien tant que
 * personne ne l'édite. À basculer en base le jour où ce contenu s'enrichit
 * ou doit être modifiable sans redéploiement.
 *
 * Distinct du « geste du jour » du pilier Ensemble : celui-ci suggère une
 * action envers l'autre, celles-ci parlent de la grossesse elle-même.
 */
const TIPS_BY_ROLE: Record<HouseholdRole, string[]> = {
  pregnant: [
    'Buvez régulièrement dans la journée, même sans soif.',
    'Une sieste de 20 minutes vaut mieux qu’un long réveil difficile.',
    'Notez vos questions au fil de l’eau pour le prochain rendez-vous.',
    'Bougez un peu chaque jour, à votre rythme — rien d’intense.',
  ],
  partner: [
    'Proposez de préparer le sac de maternité ensemble.',
    'Accompagnez-la au prochain rendez-vous si vous le pouvez.',
    'Prenez en charge une tâche du quotidien sans qu’elle ait à demander.',
    'Demandez-lui comment elle se sent, vraiment — puis écoutez.',
  ],
};

/**
 * Astuce du jour du hub (« ASTUCE DU JOUR » de la carte santé) : inchangée
 * — la personne enceinte y lit un conseil pour elle, le co-parent un
 * conseil tourné vers elle.
 */
export function getTipOfTheDay(role: HouseholdRole): string | null {
  return pickForToday(TIPS_BY_ROLE[role]);
}

/**
 * Écran « Mon partenaire », section Astuces du jour (demande explicite) :
 * deux cartes qui s'adressent toutes deux à la personne connectée.
 *
 * - « Pour vous » : un conseil pour soi. Personne enceinte : ses astuces
 *   habituelles ; co-parent : prendre soin de lui-même (ses astuces
 *   habituelles étant déjà tournées vers elle).
 * - Seconde carte : un conseil **pour soi, au sujet de l'autre** — ou du
 *   couple. Le libellé suit le conseil du jour et alterne donc d'un jour à
 *   l'autre entre « Pour votre compagnon / compagne » et « Pour votre
 *   couple » (demande explicite).
 *
 * Avant, la seconde carte montrait l'astuce destinée à l'autre parent :
 * lue par la mère, « Accompagnez-la au prochain rendez-vous » n'avait pas
 * de sens. Le co-parent est un homme par défaut (choix produit), d'où
 * « compagnon » côté mère.
 */
const SELF_TIPS_BY_ROLE: Record<HouseholdRole, string[]> = {
  pregnant: TIPS_BY_ROLE.pregnant,
  partner: [
    'Prenez aussi du temps pour vous reposer : vous comptez aussi.',
    'Parlez de ce que vous ressentez à un proche de confiance.',
    'Renseignez-vous sur votre congé paternité pour l’anticiper sereinement.',
    'Informez-vous sur le déroulé de l’accouchement pour vous sentir prêt.',
  ],
};

export type RelationTip = { kind: 'partner' | 'couple'; text: string };

/** Conseils pour le couple, communs aux deux parents. */
const COUPLE_TIPS: RelationTip[] = [
  {
    kind: 'couple',
    text: 'Gardez un moment à deux cette semaine, sans parler de bébé.',
  },
  {
    kind: 'couple',
    text: 'Partagez chacun une inquiétude et une envie pour l’arrivée de bébé.',
  },
  {
    kind: 'couple',
    text: 'Faites une petite balade ensemble, téléphones rangés.',
  },
];

const RELATION_TIPS_BY_ROLE: Record<HouseholdRole, RelationTip[]> = {
  pregnant: [
    {
      kind: 'partner',
      text: 'N’hésitez pas à demander à votre compagnon s’il se sent bien considéré.',
    },
    {
      kind: 'partner',
      text: 'Dites-lui ce qu’il fait qui vous aide vraiment au quotidien.',
    },
    {
      kind: 'partner',
      text: 'Proposez-lui de vous accompagner au prochain rendez-vous.',
    },
    {
      kind: 'partner',
      text: 'Laissez-lui une place dans les choix pour bébé, même les petits.',
    },
    ...COUPLE_TIPS,
  ],
  partner: [
    ...TIPS_BY_ROLE.partner.map(
      (text): RelationTip => ({ kind: 'partner', text }),
    ),
    ...COUPLE_TIPS,
  ],
};

/** Libellé de la seconde carte, selon le conseil du jour et le rôle. */
export function relationTipLabel(
  tip: RelationTip,
  role: HouseholdRole,
): string {
  if (tip.kind === 'couple') return 'Pour votre couple';
  return role === 'pregnant' ? 'Pour votre compagnon' : 'Pour votre compagne';
}

export function getSelfTipOfTheDay(role: HouseholdRole): string | null {
  return pickForToday(SELF_TIPS_BY_ROLE[role]);
}

export function getRelationTipOfTheDay(
  role: HouseholdRole,
): RelationTip | null {
  return pickForToday(RELATION_TIPS_BY_ROLE[role]);
}

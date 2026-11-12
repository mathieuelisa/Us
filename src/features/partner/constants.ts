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
 * Astuces du jour. Volontairement en constantes côté client et non en
 * base, contrairement à `gesture_suggestions` : contenu court et figé,
 * une table de plus n'apporterait rien tant que personne ne l'édite. À
 * basculer en base le jour où il doit être modifiable sans redéploiement.
 *
 * Textes fournis par l'utilisateur (demande explicite, 2026-11-12), en
 * cinq listes : pour soi et au sujet de l'autre, pour chaque parent, plus
 * une liste commune au couple. Le co-parent est un homme par défaut (choix
 * produit), d'où « compagnon » côté mère et les accords au masculin.
 *
 * Distinct du « geste du jour » du pilier Ensemble.
 */

/** Pour soi : carte « Pour vous ». */
const SELF_TIPS_BY_ROLE: Record<HouseholdRole, string[]> = {
  pregnant: [
    'Bougez un peu chaque jour, à votre rythme.',
    'Écoutez votre fatigue : une sieste n’est pas du temps perdu.',
    'Notez vos questions au fil de la semaine pour ne rien oublier au prochain rendez-vous.',
    'Buvez régulièrement, gardez une bouteille d’eau à portée de main.',
    'Acceptez l’aide qu’on vous propose, sans vous justifier.',
    'Accordez-vous un petit plaisir rien que pour vous cette semaine.',
    'Vos émotions peuvent varier d’un jour à l’autre, et c’est normal.',
    'Parlez à un professionnel de santé si quelque chose vous inquiète, même si ça vous semble minime.',
    'Limitez les comparaisons : chaque grossesse et chaque bébé suivent leur propre chemin.',
    'Après la naissance, reposez-vous dès que bébé dort, les tâches peuvent attendre.',
    'Gardez le contact avec vos proches, même par un simple message.',
  ],
  partner: [
    'Prenez aussi du temps pour vous reposer : vous comptez aussi.',
    'Vous avez le droit d’avoir des doutes ou des peurs : parlez-en à quelqu’un de confiance.',
    'Renseignez-vous sur les étapes de la grossesse pour mieux comprendre ce qui se passe.',
    'Gardez une activité qui vous fait du bien, même courte.',
    'Échangez avec d’autres jeunes pères, l’expérience des autres rassure.',
    'Préparez-vous au congé de paternité : organisez votre travail à l’avance.',
    'Ne cherchez pas à tout savoir ni à tout réussir du premier coup.',
    'Le lien avec bébé se construit avec le temps, ne vous inquiétez pas s’il n’est pas immédiat.',
    'Faites du peau à peau avec bébé, c’est bon pour lui comme pour vous.',
    'Si vous vous sentez dépassé ou triste durablement, parlez-en à un professionnel : ça arrive aussi aux pères.',
  ],
};

/** Au sujet de l'autre : « Pour votre compagnon » / « Pour votre compagne ». */
const ABOUT_PARTNER_TIPS_BY_ROLE: Record<HouseholdRole, string[]> = {
  pregnant: [
    'N’hésitez pas à demander à votre compagnon s’il se sent bien considéré.',
    'Partagez-lui ce que vous ressentez physiquement : il ne peut pas le deviner.',
    'Proposez-lui de sentir bébé bouger quand l’occasion se présente.',
    'Dites-lui concrètement de quoi vous avez besoin, il sera souvent soulagé de savoir comment aider.',
    'Laissez-lui de la place pour s’occuper de bébé à sa façon, même si elle diffère de la vôtre.',
    'Remerciez-le pour un petit geste qu’il a fait cette semaine.',
    'Demandez-lui comment il imagine son rôle de père.',
    'Invitez-le à préparer avec vous la chambre ou la valise de maternité.',
    'Lui aussi peut avoir des inquiétudes : proposez-lui d’en parler.',
    'Après la naissance, confiez-lui un moment rien qu’à lui avec bébé (bain, peau à peau, promenade).',
    'Encouragez-le à prendre son congé de paternité s’il le peut.',
  ],
  partner: [
    'Accompagnez-la au prochain rendez-vous si vous le pouvez.',
    'Demandez-lui comment elle se sent aujourd’hui, et prenez le temps d’écouter la réponse.',
    'Prenez en charge une tâche du quotidien sans qu’elle ait à vous le demander.',
    'Proposez-lui un massage des pieds ou du dos en fin de journée.',
    'Rassurez-la sur les changements de son corps.',
    'Faites le relais auprès de la famille et des visiteurs pour la préserver si elle a besoin de calme.',
    'Pendant l’accouchement, soyez sa voix : faites respecter ses souhaits.',
    'La nuit, prenez le relais pour un change ou pour rendormir bébé.',
    'Apportez-lui à boire ou une collation pendant qu’elle allaite ou donne le biberon.',
    'Félicitez-la : elle accomplit quelque chose d’immense.',
    'Soyez attentif à son moral après la naissance : si elle semble triste plus de deux semaines, encouragez-la à consulter.',
  ],
};

/** Commun aux deux parents : « Pour votre couple ». */
const COUPLE_TIPS: string[] = [
  'Gardez un moment à deux cette semaine, sans parler de bébé.',
  'Choisissez ensemble le prénom en prenant le temps d’en discuter, sans pression.',
  'Répartissez les tâches à l’avance pour éviter les tensions plus tard.',
  'Préparez ensemble votre projet de naissance.',
  'Prenez une photo de vous deux chaque mois pour garder un souvenir de cette période.',
  'Discutez de vos valeurs éducatives : comment chacun a été élevé, ce que vous voulez garder ou changer.',
  'Fixez un petit rituel quotidien à deux : un café, une promenade, un message.',
  'Après une dispute, prenez le temps de vous reparler à tête reposée : la fatigue amplifie tout.',
  'Dites-vous merci, souvent, même pour les petites choses.',
  'Assistez ensemble à une séance de préparation à la naissance.',
  'Organisez-vous pour que chacun puisse dormir une vraie nuit de temps en temps.',
];

/**
 * Astuce du jour du hub (« ASTUCE DU JOUR » de la carte santé) : la
 * personne enceinte y lit un conseil pour elle, le co-parent un conseil
 * tourné vers elle — comme avant la refonte de « Mon partenaire ».
 */
export function getTipOfTheDay(role: HouseholdRole): string | null {
  return pickForToday(
    role === 'pregnant'
      ? SELF_TIPS_BY_ROLE.pregnant
      : ABOUT_PARTNER_TIPS_BY_ROLE.partner,
  );
}

/**
 * Écran « Mon partenaire », section Astuces du jour (demande explicite) :
 * deux cartes qui s'adressent toutes deux à la personne connectée —
 * « Pour vous », puis un conseil au sujet de l'autre ou du couple, dont le
 * libellé suit le conseil du jour et alterne donc d'un jour à l'autre.
 *
 * Avant, la seconde carte montrait l'astuce destinée à l'autre parent :
 * lue par la mère, « Accompagnez-la au prochain rendez-vous » n'avait pas
 * de sens.
 */
export type RelationTip = { kind: 'partner' | 'couple'; text: string };

const RELATION_TIPS_BY_ROLE: Record<HouseholdRole, RelationTip[]> = {
  pregnant: [
    ...ABOUT_PARTNER_TIPS_BY_ROLE.pregnant.map(
      (text): RelationTip => ({ kind: 'partner', text }),
    ),
    ...COUPLE_TIPS.map((text): RelationTip => ({ kind: 'couple', text })),
  ],
  partner: [
    ...ABOUT_PARTNER_TIPS_BY_ROLE.partner.map(
      (text): RelationTip => ({ kind: 'partner', text }),
    ),
    ...COUPLE_TIPS.map((text): RelationTip => ({ kind: 'couple', text })),
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

import type { ImageSourcePropType } from 'react-native';
import type { TranslationKey } from '@/i18n/types';
import type { MoodValue } from './api';

/**
 * Rendu **qualitatif** de l'humeur : un emoji et une phrase, jamais un
 * score ni un historique jour par jour (CONCEPT.md — la tendance se lit,
 * elle ne se mesure pas). C'est aussi ce qui corrige le graphique à barres
 * des maquettes, à ne pas reproduire tel quel.
 */
export const MOOD_PRESENTATION: Record<
  MoodValue,
  {
    emoji: string;
    phraseKey: TranslationKey;
    labelKey: TranslationKey;
  }
> = {
  great: {
    emoji: '😄',
    phraseKey: 'mood.phrases.great',
    labelKey: 'mood.labels.great',
  },
  good: {
    emoji: '🙂',
    phraseKey: 'mood.phrases.good',
    labelKey: 'mood.labels.good',
  },
  neutral: {
    emoji: '😐',
    phraseKey: 'mood.phrases.neutral',
    labelKey: 'mood.labels.neutral',
  },
  bad: {
    emoji: '😩',
    phraseKey: 'mood.phrases.bad',
    labelKey: 'mood.labels.bad',
  },
  terrible: {
    emoji: '😢',
    phraseKey: 'mood.phrases.terrible',
    labelKey: 'mood.labels.terrible',
  },
};

/** Ourse des humeurs, pour qui a choisi « elle » (et la personne enceinte). */
const MOOD_IMAGES_ELLE: Record<MoodValue, ImageSourcePropType> = {
  great: require('@/assets/images/Mother_happy.png'),
  good: require('@/assets/images/Mother_smile.png'),
  neutral: require('@/assets/images/Mother_neutral.png'),
  bad: require('@/assets/images/Mother_sad.png'),
  terrible: require('@/assets/images/Mother_cry.png'),
};

/** Ours des humeurs, pour « il » et « avec mon prénom seulement ». */
const MOOD_IMAGES_IL: Record<MoodValue, ImageSourcePropType> = {
  great: require('@/assets/images/Father_great.png'),
  good: require('@/assets/images/Father_good.png'),
  neutral: require('@/assets/images/Father_neutral.png'),
  bad: require('@/assets/images/Father_bad.png'),
  terrible: require('@/assets/images/Father_terrible.png'),
};

/**
 * Illustration d'une humeur selon la façon dont **la personne qui l'a
 * donnée** veut qu'on parle d'elle (`profiles.pronoun`, choisi dans
 * « Faisons connaissance » — demande explicite du 2026-11-20) : « il » et
 * « avec mon prénom seulement » → ours ; « elle » → ourse. Sans pronom
 * (la personne enceinte, qui ne passe pas par cet écran), l'ourse reste
 * le rendu par défaut, comme avant.
 */
export function getMoodImage(
  mood: MoodValue,
  pronoun: string | null | undefined,
): ImageSourcePropType {
  return pronoun === 'il' || pronoun === 'neutre'
    ? MOOD_IMAGES_IL[mood]
    : MOOD_IMAGES_ELLE[mood];
}

/** Les 5 niveaux d'humeur (la colonne en base est un simple `text`). */
export type MoodLevel = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

/** Ordre d'affichage des 5 humeurs (écrans 3a/3g) — great en tête. */
export const MOOD_ORDER: MoodValue[] = [
  'great',
  'good',
  'neutral',
  'bad',
  'terrible',
];

/**
 * Ombre légère partagée par les cartes du hub (piliers, invitation, "Votre
 * bébé", "Mon partenaire") — demande explicite de les mettre "légèrement"
 * en valeur. Volontairement discrète : `shadowOpacity`/`elevation` bas,
 * pour ne pas rompre l'égalité de poids visuel des 3 piliers (CONCEPT.md).
 */
export const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
} as const;

/**
 * Accent premium (or) sur fond clair — plus soutenu que le `#e8c874` posé
 * sur fond sombre (badge de `PremiumTeaserCard`, CTA de `premium.tsx`), qui
 * manque de contraste ici. Même teinte que `PREMIUM_GOLD` de `tab-bar.tsx`
 * et `PREMIUM_GOLD_ON_LIGHT` de `premium.tsx`, dupliquée volontairement
 * plutôt que partagée entre des fichiers qui n'ont pas vocation à
 * s'importer entre eux.
 */
export const PREMIUM_GOLD_ON_LIGHT = '#b8860b';

export function formatAppointmentDate(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Jour de la semaine abrégé (« mer. »), jour et mois séparés, pour le pavé
 * date des cartes de rendez-vous.
 */
export function formatAppointmentDayMonth(
  isoDate: string,
  locale: string,
): {
  weekday: string;
  day: string;
  month: string;
} {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return {
    weekday: date.toLocaleDateString(locale, { weekday: 'short' }),
    day: String(date.getDate()),
    month: date.toLocaleDateString(locale, { month: 'short' }),
  };
}

/**
 * "10:30" → "10h30" en français, "10:30" ailleurs ; `null` si l'heure
 * n'est pas renseignée.
 */
export function formatAppointmentTime(
  time: string | null,
  locale: string,
): string | null {
  if (!time) return null;
  const [hours, minutes] = time.split(':');
  return locale.startsWith('fr')
    ? `${hours}h${minutes}`
    : `${hours}:${minutes}`;
}

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
    imgUrl: ImageSourcePropType;
  }
> = {
  great: {
    emoji: '😄',
    imgUrl: require('@/assets/images/Mother_happy.png'),
    phraseKey: 'mood.phrases.great',
    labelKey: 'mood.labels.great',
  },
  good: {
    emoji: '🙂',
    imgUrl: require('@/assets/images/Mother_smile.png'),
    phraseKey: 'mood.phrases.good',
    labelKey: 'mood.labels.good',
  },
  neutral: {
    emoji: '😐',
    imgUrl: require('@/assets/images/Mother_neutral.png'),
    phraseKey: 'mood.phrases.neutral',
    labelKey: 'mood.labels.neutral',
  },
  bad: {
    emoji: '😩',
    imgUrl: require('@/assets/images/Mother_sad.png'),
    phraseKey: 'mood.phrases.bad',
    labelKey: 'mood.labels.bad',
  },
  terrible: {
    emoji: '😢',
    imgUrl: require('@/assets/images/Mother_cry.png'),
    phraseKey: 'mood.phrases.terrible',
    labelKey: 'mood.labels.terrible',
  },
};

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

import type { MoodValue } from './api';

/**
 * Rendu **qualitatif** de l'humeur : un emoji et une phrase, jamais un
 * score ni un historique jour par jour (CONCEPT.md — la tendance se lit,
 * elle ne se mesure pas). C'est aussi ce qui corrige le graphique à barres
 * des maquettes, à ne pas reproduire tel quel.
 */
export const MOOD_PRESENTATION: Record<
  MoodValue,
  { emoji: string; phrase: string }
> = {
  great: { emoji: '😄', phrase: 'semble au top' },
  good: { emoji: '🙂', phrase: 'semble se sentir bien' },
  neutral: { emoji: '😐', phrase: 'passe une journée ordinaire' },
  bad: { emoji: '😩', phrase: 'traverse une journée difficile' },
  terrible: { emoji: '😢', phrase: 'traverse une journée très difficile' },
};

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

export function formatAppointmentDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });
}

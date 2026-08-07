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
  bad: { emoji: '😕', phrase: 'traverse une journée difficile' },
  terrible: { emoji: '😩', phrase: 'traverse une journée très difficile' },
};

/** Fond dérivé du rôle, pas de l'écran (cf. DOCS/04-ARCHITECTURE.md). */
export const ROLE_BACKGROUND = {
  pregnant: '#EAF5F0',
  partner: '#FDF6E3',
} as const;

export function formatAppointmentDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
  });
}

/** Tags rapides de l'overlay "besoin de…" (écran 3b), plus texte libre. */
export const NEED_TAGS: { value: string; label: string }[] = [
  { value: 'sommeil', label: 'Sommeil' },
  { value: 'calin', label: 'Câlin' },
  { value: 'parler', label: 'Juste parler' },
  { value: 'massage', label: 'Massage' },
  { value: 'coup_de_main', label: 'Coup de main pratique' },
  { value: 'calme', label: 'Un peu de calme' },
  { value: 'rassurée', label: 'Être rassurée' },
  { value: 'attention', label: 'Un peu d’attention' },
  { value: 'moment_a_deux', label: 'Un moment à deux' },
];

const DEFAULT_GESTURE_EMOJI = '✨';

/**
 * Émoji du geste du jour, porté par la base depuis le 2026-11-11
 * (`gesture_suggestions.emoji`) — il était auparavant retrouvé par
 * correspondance exacte du texte, ce qu'une reformulation cassait sans bruit.
 * Repli sur ✨ pour un geste ajouté sans émoji.
 */
export function getGestureEmoji(gesture: { emoji: string | null }): string {
  return gesture.emoji ?? DEFAULT_GESTURE_EMOJI;
}

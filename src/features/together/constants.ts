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

/**
 * ⚠️ Association fragile : `gesture_suggestions` n'a pas de colonne emoji
 * (contenu seedé par migration, pas éditable par l'utilisateur), donc le
 * choix a été de matcher côté client sur le texte exact plutôt que
 * d'ajouter une migration pour un champ purement décoratif. Une
 * reformulation du texte en base ferait silencieusement retomber sur
 * `DEFAULT_GESTURE_EMOJI` — pas une erreur, juste moins illustratif.
 */
const GESTURE_EMOJI_BY_BODY: Record<string, string> = {
  "N'hésite pas à lui dire qu'elle est belle": '💛',
  'Propose-lui de dormir 1h de plus': '🌙',
  'Fais-lui couler un bain ce soir': '🛁',
  'Propose-lui un massage des pieds': '💆',
  'Prépare le dîner pour la surprendre': '🍽️',
  "N'hésite pas à lui dire qu'il est important aux rendez-vous": '💬',
  "Partage avec lui ce que tu ressens aujourd'hui": '💭',
  'Invite-le à poser sa main sur ton ventre ce soir': '🤰',
};

const DEFAULT_GESTURE_EMOJI = '✨';

export function getGestureEmoji(body: string): string {
  return GESTURE_EMOJI_BY_BODY[body] ?? DEFAULT_GESTURE_EMOJI;
}

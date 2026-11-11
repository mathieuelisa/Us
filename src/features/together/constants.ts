import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

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

/** Pictogramme de chaque besoin rapide — purement visuel. */
export const NEED_ICONS: Record<
  string,
  ComponentProps<typeof Ionicons>['name']
> = {
  sommeil: 'moon-outline',
  calin: 'heart-outline',
  parler: 'chatbubble-ellipses-outline',
  massage: 'hand-left-outline',
  coup_de_main: 'construct-outline',
  calme: 'leaf-outline',
  rassurée: 'happy-outline',
  attention: 'notifications-outline',
  moment_a_deux: 'people-outline',
};

/**
 * Relit `mood_checkins.need_note` pour l'afficher à l'autre parent. La
 * note est stockée en texte : soit les libellés des besoins rapides joints
 * par « , » (« Sommeil, Câlin »), soit un texte libre. Si chaque morceau est
 * un besoin connu, on renvoie les besoins (affichés en pastilles à
 * pictogramme) ; sinon le texte libre, tel quel — mieux vaut le montrer
 * entier que d'en deviner une partie.
 */
export function parseNeedNote(note: string | null | undefined): {
  needs: { value: string; label: string }[];
  freeText: string | null;
} {
  const trimmed = note?.trim();
  if (!trimmed) return { needs: [], freeText: null };

  const parts = trimmed.split(',').map((part) => part.trim());
  const needs = parts.map((part) =>
    NEED_TAGS.find((tag) => tag.label === part),
  );
  if (needs.every((need) => need !== undefined)) {
    return {
      needs: needs as { value: string; label: string }[],
      freeText: null,
    };
  }
  return { needs: [], freeText: trimmed };
}

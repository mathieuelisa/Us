import type { ImageSourcePropType } from 'react-native';
import { useUniwind } from 'uniwind';

import {
  resolveThemeId,
  THEME_BABY_WALLPAPER,
  THEME_OPTIONS,
  THEME_PASTEL_BACKGROUND,
} from './constants';

/**
 * Fond pastel dérivé du thème personnel actif (Phase 1.7), utilisé sur tous
 * les écrans principaux (hub, Suivi santé, Démarches, Ensemble, Mon
 * partenaire) — a remplacé le fond fixe par rôle qu'ils utilisaient avant.
 */
export function useThemeBackground(): string {
  const { theme } = useUniwind();
  return THEME_PASTEL_BACKGROUND[resolveThemeId(theme)];
}

/**
 * Papier peint de l'écran « Votre bébé » accordé au thème actif — pendant de
 * `useThemeBackground` pour le seul écran dont le fond est une image.
 */
export function useThemeBabyWallpaper(): ImageSourcePropType {
  const { theme } = useUniwind();
  return THEME_BABY_WALLPAPER[resolveThemeId(theme)];
}

/**
 * Hex de la couleur d'accent active, pour les rares cas qui ne peuvent pas
 * passer par les classes Tailwind `bg-accent`/`text-accent` (ex. la prop
 * `color` d'une icône vectorielle, qui attend une couleur littérale).
 */
export function useThemeAccent(): string {
  const { theme } = useUniwind();
  const id = resolveThemeId(theme);
  return THEME_OPTIONS.find((option) => option.id === id)?.accent as string;
}

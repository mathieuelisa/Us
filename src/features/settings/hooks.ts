import { useUniwind } from 'uniwind';

import { resolveThemeId, THEME_PASTEL_BACKGROUND } from './constants';

/**
 * Fond pastel dérivé du thème personnel actif (Phase 1.7), utilisé sur tous
 * les écrans principaux (hub, Suivi santé, Démarches, Ensemble, Mon
 * partenaire) — a remplacé le fond fixe par rôle qu'ils utilisaient avant.
 */
export function useThemeBackground(): string {
  const { theme } = useUniwind();
  return THEME_PASTEL_BACKGROUND[resolveThemeId(theme)];
}

import type { ImageSourcePropType } from 'react-native';

/**
 * Les 4 thèmes visuels prédéfinis (CONCEPT.md §Réglages, plan d'action
 * §1.7). Chaque id correspond à un variant Uniwind défini dans
 * `src/global.css`, activé via `Uniwind.setTheme(id)`.
 *
 * ⚠️ Distinct de la maquette 10a (« Thème sombre » + « Couleur d'accent »
 * en swatches libres) : ce mécanisme-là est explicitement hors MVP
 * (DOCS/versions/MVP.md — « Thème sombre et couleur d'accent hors MVP »).
 * Ici, un choix fermé de 4 palettes nommées, pas un sélecteur de couleur
 * libre ni un bouton clair/sombre.
 */
export const THEME_OPTIONS = [
  { id: 'sauge', label: 'Sauge', accent: '#2D5E5A' },
  { id: 'corail', label: 'Corail', accent: '#B85C38' },
  { id: 'lavande', label: 'Lavande', accent: '#6B5CA5' },
  { id: 'ocre', label: 'Ocre', accent: '#96701C' },
] as const;

export type ThemeId = (typeof THEME_OPTIONS)[number]['id'];

export const DEFAULT_THEME_ID: ThemeId = 'sauge';

/**
 * `profiles.theme` vaut `'default'` tant que l'utilisateur n'a rien choisi
 * (valeur par défaut de la colonne) — pas un des 4 id valides. Toute autre
 * valeur inconnue retombe sur le même défaut plutôt que de planter.
 */
export function resolveThemeId(value: string | null | undefined): ThemeId {
  return THEME_OPTIONS.some((option) => option.id === value)
    ? (value as ThemeId)
    : DEFAULT_THEME_ID;
}

/**
 * Fond pastel du hub, dérivé du thème choisi en Réglages (pas du rôle —
 * voir `src/app/(tabs)/index.tsx`). `sauge` reprend le vert pastel déjà
 * utilisé (`#EAF5F0`) ; les trois autres sont des teintes inventées, dans
 * la même logique que les couleurs d'accent (`THEME_OPTIONS`) : pas de
 * référence maquette, choisies pour rester très claires et laisser les
 * cartes blanches se détacher par-dessus.
 */
export const THEME_PASTEL_BACKGROUND: Record<ThemeId, string> = {
  sauge: '#EAF5F0',
  corail: '#FBEAE2',
  lavande: '#EEEAF8',
  ocre: '#FBF2DC',
};

/**
 * Papier peint (motif biberons/hochets) de l'écran « Votre bébé », décliné
 * dans les quatre teintes de `THEME_PASTEL_BACKGROUND` — le fond y est une
 * image et non une couleur, donc changer de thème demande de changer d'asset
 * plutôt que de couleur.
 *
 * `require` statique par entrée : le bundler Metro résout ces chemins à la
 * compilation, un chemin construit à l'exécution ne fonctionnerait pas.
 */
export const THEME_BABY_WALLPAPER: Record<ThemeId, ImageSourcePropType> = {
  sauge: require('@/assets/images/Wallpaper_baby_sauge.png'),
  corail: require('@/assets/images/Wallpaper_baby_corail.png'),
  lavande: require('@/assets/images/Wallpaper_baby_lavande.png'),
  ocre: require('@/assets/images/Wallpaper_baby_ocre.png'),
};

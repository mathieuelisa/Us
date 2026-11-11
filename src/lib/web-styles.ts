import { Platform, type TextStyle } from 'react-native';

/**
 * Retire l'anneau de focus que le navigateur dessine autour d'un champ
 * (orange sous Chrome) — web uniquement. `outlineWidth: 0` ne suffit pas : le
 * navigateur utilise le style `auto`, qui ignore l'épaisseur ; il faut
 * `outline-style: none`, valeur absente des types React Native (d'où le
 * transtypage). À n'utiliser que sur un champ qui montre déjà son état
 * actif autrement (contour d'accent, fond teinté), pour rester accessible.
 */
export const NO_WEB_FOCUS_OUTLINE: TextStyle =
  Platform.OS === 'web'
    ? ({ outlineStyle: 'none' } as unknown as TextStyle)
    : {};

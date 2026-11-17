import type { ViewStyle } from 'react-native';

/**
 * Fonds des modales à champs, posés sur un `KeyboardAvoidingView`
 * (`react-native-keyboard-controller`, `behavior="padding"`) : quand le
 * clavier s'ouvre, le fond se rembourre de sa hauteur et la feuille remonte
 * au-dessus au lieu d'être recouverte (signalé sur Samsung S26 — Android
 * bord à bord ne redimensionne plus la fenêtre). En style plutôt qu'en
 * `className` : le composant vient d'une bibliothèque, pas de React Native.
 */
export const SHEET_BACKDROP: ViewStyle = {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
};

/** Variante centrée (pop-up au milieu de l'écran). */
export const CENTERED_BACKDROP: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  paddingHorizontal: 16,
  paddingVertical: 24,
};

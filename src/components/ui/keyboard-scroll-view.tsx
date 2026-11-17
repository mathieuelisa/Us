import type { ComponentProps } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { withUniwind } from 'uniwind';

const UniwindKeyboardAwareScrollView = withUniwind(KeyboardAwareScrollView);

/** Espace gardé entre le champ actif et le haut du clavier. */
const KEYBOARD_BOTTOM_OFFSET = 24;

/**
 * `ScrollView` des écrans à champs (signalé sur Samsung S26 : le clavier
 * cachait tout). Android bord à bord ne redimensionne plus la fenêtre quand
 * le clavier s'ouvre ; `KeyboardAwareScrollView`
 * (`react-native-keyboard-controller`) fait défiler le champ touché
 * au-dessus du clavier et ajoute la place qu'il faut en bas de la liste.
 *
 * Mêmes props qu'une `ScrollView`, `className` et `contentContainerClassName`
 * compris (`withUniwind`). Les touchers passent même clavier ouvert
 * (`keyboardShouldPersistTaps="handled"`), comme ailleurs dans l'app.
 */
export function KeyboardScrollView(
  props: ComponentProps<typeof UniwindKeyboardAwareScrollView>,
) {
  return (
    <UniwindKeyboardAwareScrollView
      bottomOffset={KEYBOARD_BOTTOM_OFFSET}
      keyboardShouldPersistTaps="handled"
      {...props}
    />
  );
}

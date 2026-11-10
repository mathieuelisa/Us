import { View } from 'react-native';

/**
 * Deux ronds blancs translucides posés en fond d'écran — même langage que
 * les formes rondes de « Mon partenaire »/« Votre bébé » (demande
 * explicite), généralisé à la plupart des écrans de l'app. Blanc
 * translucide plutôt qu'une teinte fixe : reste « légèrement plus clair »
 * quel que soit le thème pastel actif (`useThemeBackground`).
 *
 * Les ronds sont rognés par leur propre cadre (plein écran, `overflow-hidden`)
 * plutôt que par le seul parent : en web, un parent `overflow-hidden` reste
 * défilable par programme, et le navigateur le décalait latéralement dès
 * qu'un champ prenait le focus (formulaire de contacts) pour « montrer » le
 * rond qui dépassait à droite.
 */
export function ScreenCornerShapes() {
  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <View
        pointerEvents="none"
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/45"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-white/60"
      />
    </View>
  );
}

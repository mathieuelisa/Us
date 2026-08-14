import { View } from 'react-native';

/**
 * Deux ronds blancs translucides posés en fond d'écran — même langage que
 * les formes rondes de « Mon partenaire »/« Votre bébé » (demande
 * explicite), généralisé à la plupart des écrans de l'app. Blanc
 * translucide plutôt qu'une teinte fixe : reste « légèrement plus clair »
 * quel que soit le thème pastel actif (`useThemeBackground`).
 *
 * Le parent direct (le `SafeAreaView` de chaque écran) doit porter
 * `overflow-hidden` pour clipper ces ronds aux bords de l'écran plutôt que
 * de créer un débordement scrollable.
 */
export function ScreenCornerShapes() {
  return (
    <>
      <View
        pointerEvents="none"
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/45"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-white/60"
      />
    </>
  );
}

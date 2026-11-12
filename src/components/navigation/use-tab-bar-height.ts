import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BAR_BOTTOM_GAP,
  BAR_PILL_HEIGHT,
  BUBBLE_OVERFLOW,
} from '@/components/navigation/tab-bar';

/** Air entre la dernière carte et le haut de la bulle active. */
const BREATHING_ROOM = 16;

/**
 * Hauteur occupée par la barre du bas, mesurée depuis le bas de l'écran :
 * pilule, bulle active qui la dépasse, espace et zone sûre en dessous.
 *
 * La barre flotte en `position: absolute` au-dessus des écrans (voir
 * `AppTabBar`) : chaque écran qui défile ajoute cette valeur en
 * `paddingBottom` de son contenu, pour que sa dernière carte puisse
 * remonter entièrement au-dessus de la pilule. Sert aussi à placer les
 * boutons flottants juste au-dessus de la barre.
 */
export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return BAR_PILL_HEIGHT + BUBBLE_OVERFLOW + insets.bottom + BAR_BOTTOM_GAP;
}

/** `paddingBottom` à donner au contenu défilant d'un écran à onglets. */
export function useTabBarContentInset(): number {
  return useTabBarHeight() + BREATHING_ROOM;
}

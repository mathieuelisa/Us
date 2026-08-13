import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SLIDE_DISTANCE = 28;
const DURATION = 650;

/**
 * Fait apparaître son contenu en glissant depuis la gauche ou la droite,
 * avec un fondu — demande explicite pour le titre/sous-titre de
 * l'onboarding (titre depuis la gauche, description depuis la droite).
 *
 * `resetKey` relance l'animation quand il change, pour les écrans qui
 * réutilisent la même instance entre plusieurs slides (ex. le carrousel de
 * bienvenue) plutôt que de remonter un nouveau composant à chaque étape.
 */
export function SlideInText({
  direction,
  resetKey,
  children,
  style,
}: {
  direction: 'left' | 'right';
  resetKey?: string | number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useSharedValue(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetKey ne sert qu'à relancer l'animation, il n'est pas lu dans le corps de l'effet ; progress (shared value) est une référence stable.
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [resetKey]);

  const animatedStyle = useAnimatedStyle(() => {
    const offset = direction === 'left' ? -SLIDE_DISTANCE : SLIDE_DISTANCE;
    return {
      opacity: progress.value,
      transform: [{ translateX: (1 - progress.value) * offset }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
  );
}

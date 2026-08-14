import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

/**
 * Barre de progression continue — `progress` entre 0 et 1. Largeur animée
 * (`withTiming`, même pattern que la pastille de `AppTabBar`) plutôt qu'un
 * simple style calculé : demande explicite d'un remplissage smooth quand un
 * item est coché, pas un saut instantané.
 */
export function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${clamped * 100}%`, { duration: 350 }),
  }));

  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
      <Animated.View className="h-2 rounded-full bg-accent" style={fillStyle} />
    </View>
  );
}

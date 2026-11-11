import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useThemeAccent } from '@/features/settings/hooks';

/**
 * Action principale de l'écran 7a. Volontairement traitée à part des autres
 * boutons de l'app (`Button` Hero UI, `OutlineButton`) : c'est le seul
 * geste irréversible du MVP — il fait basculer tout le foyer de « avant » à
 * « après » et recalcule les échéances légales. Il doit donc se distinguer
 * au premier coup d'œil des « Suivant » et « Ajouter » du reste du parcours.
 *
 * Deux écarts assumés avec le bouton standard :
 * - une **ombre teintée** de l'accent plutôt que le gris de `CARD_SHADOW` ;
 * - un **retour tactile** à l'appui, parce que la confirmation qui suit
 *   demande un geste délibéré.
 *
 * Le halo d'accent qui respirait derrière la pastille a été retiré (demande
 * explicite : l'effet ne plaisait pas).
 */
export function DeclareBirthButton({
  label,
  onPress,
  isDisabled = false,
  isLoading = false,
}: {
  label: string;
  onPress: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}) {
  const accent = useThemeAccent();
  const isInactive = isDisabled || isLoading;

  const press = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.97]) }],
  }));

  return (
    <View className="justify-center">
      {/* L'échelle d'appui est portée par une `Animated.View` enveloppante
          plutôt que par le `Pressable` lui-même : `className` (Uniwind) et
          `createAnimatedComponent` ne font pas bon ménage. */}
      <Animated.View style={pressStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isInactive, busy: isLoading }}
          disabled={isInactive}
          onPress={onPress}
          onPressIn={() => {
            press.value = withTiming(1, { duration: 90 });
          }}
          onPressOut={() => {
            press.value = withTiming(0, { duration: 140 });
          }}
          style={{
            shadowColor: accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 14,
            elevation: 6,
          }}
          className={`flex-row items-center justify-center gap-2 rounded-full bg-accent px-5 py-4 ${
            isDisabled ? 'opacity-40' : ''
          }`}
        >
          <Ionicons name="checkmark-circle" size={21} color="#ffffff" />
          <Text className="text-[17px] font-bold text-accent-foreground">
            {isLoading ? 'Enregistrement…' : label}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

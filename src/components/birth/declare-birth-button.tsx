import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useThemeAccent } from '@/features/settings/hooks';

const PULSE_DURATION = 1900;
/** Débordement du halo autour de la pastille, en points. */
const HALO_SPREAD = 8;

/**
 * Action principale de l'écran 7a. Volontairement traitée à part des autres
 * boutons de l'app (`Button` Hero UI, `OutlineButton`) : c'est le seul
 * geste irréversible du MVP — il fait basculer tout le foyer de « avant » à
 * « après » et recalcule les échéances légales. Il doit donc se distinguer
 * au premier coup d'œil des « Suivant » et « Ajouter » du reste du parcours.
 *
 * Trois écarts assumés avec le bouton standard :
 * - un **halo** de la couleur d'accent qui respire lentement derrière la
 *   pastille, pour attirer l'œil sans clignoter ;
 * - une **ombre teintée** de l'accent plutôt que le gris de `CARD_SHADOW` ;
 * - un **retour tactile** à l'appui, parce que la confirmation qui suit
 *   demande un geste délibéré.
 *
 * Le halo s'arrête dès que le bouton est inactif : un appel à l'action qui
 * respire alors qu'il ne répond pas serait trompeur.
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

  const pulse = useSharedValue(0);
  const press = useSharedValue(0);

  useEffect(() => {
    if (isInactive) {
      pulse.value = withTiming(0, { duration: 200 });
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, {
        duration: PULSE_DURATION,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true,
    );
  }, [isInactive, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.28, 0]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.98, 1.05]) }],
  }));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.97]) }],
  }));

  return (
    <View className="justify-center">
      {/* Derrière la pastille et transparent aux gestes : le halo déborde de
          la zone tactile, il ne doit ni la capter ni l'agrandir. */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: -HALO_SPREAD,
            bottom: -HALO_SPREAD,
            left: -HALO_SPREAD,
            right: -HALO_SPREAD,
            borderRadius: 999,
            backgroundColor: accent,
          },
          haloStyle,
        ]}
      />

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
          <Ionicons name="heart" size={17} color="#ffffff" />
          <Text className="text-[16px] font-semibold text-accent-foreground">
            {isLoading ? 'Enregistrement…' : label}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

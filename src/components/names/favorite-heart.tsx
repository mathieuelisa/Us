import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const HEART_RED = '#e5384f';
const RESTING_GREY = '#b8b4c4';
const SIZE = 44;

/**
 * Petits cœurs qui jaillissent autour du grand : angle (degrés, 0 = droite),
 * distance parcourue, taille et couleur — rouge, rose et or, pour un éclat
 * « confetti » plutôt qu'un simple flash.
 */
const PARTICLES = [
  { angle: -90, distance: 30, size: 10, color: HEART_RED },
  { angle: -30, distance: 28, size: 8, color: '#f6a5c0' },
  { angle: 30, distance: 30, size: 9, color: '#f2b84b' },
  { angle: 90, distance: 26, size: 8, color: HEART_RED },
  { angle: 150, distance: 30, size: 9, color: '#f6a5c0' },
  { angle: 210, distance: 28, size: 8, color: '#f2b84b' },
];

/**
 * Cœur de favori de la carte du match des prénoms (demande explicite :
 * « une petite animation mignonne, originale et design pour le rendre
 * rouge »).
 *
 * À l'ajout : le cœur se tasse puis éclot en rouge avec un rebond, une onde
 * rouge s'élargit et s'efface, et six petits cœurs (rouge, rose, or)
 * jaillissent en couronne. Au retrait : le cœur se rétracte doucement et
 * redevient gris, sans éclat.
 *
 * Joué seulement quand l'état **change** : une carte qui arrive déjà en
 * favori (ou la carte suivante, en retrait) reste immobile.
 */
export function FavoriteHeart({ isFavorite }: { isFavorite: boolean }) {
  const scale = useSharedValue(1);
  const burst = useSharedValue(0);
  const wasFavorite = useRef(isFavorite);

  useEffect(() => {
    if (wasFavorite.current === isFavorite) return;
    wasFavorite.current = isFavorite;

    if (isFavorite) {
      scale.value = withSequence(
        withTiming(0.6, { duration: 90, easing: Easing.out(Easing.quad) }),
        withSpring(1.3, { damping: 5, stiffness: 320 }),
        withSpring(1, { damping: 9, stiffness: 220 }),
      );
      burst.value = 0;
      burst.value = withTiming(1, {
        duration: 650,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      scale.value = withSequence(
        withTiming(0.75, { duration: 110 }),
        withSpring(1, { damping: 12, stiffness: 200 }),
      );
    }
  }, [isFavorite, scale, burst]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity:
      burst.value === 0 ? 0 : interpolate(burst.value, [0, 1], [0.55, 0]),
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.5, 1.9]) }],
  }));

  return (
    <View
      pointerEvents="none"
      style={{
        width: SIZE,
        height: SIZE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Onde rouge qui s'élargit derrière le cœur. */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            borderWidth: 2.5,
            borderColor: HEART_RED,
          },
          ringStyle,
        ]}
      />

      {/* Pastille blanche, teintée de rouge une fois en favori. */}
      <View
        style={{
          position: 'absolute',
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          backgroundColor: isFavorite
            ? 'rgba(255, 236, 239, 0.95)'
            : 'rgba(255, 255, 255, 0.9)',
        }}
      />

      {PARTICLES.map((particle) => (
        <Particle key={particle.angle} burst={burst} {...particle} />
      ))}

      <Animated.View style={heartStyle}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? HEART_RED : RESTING_GREY}
        />
      </Animated.View>
    </View>
  );
}

function Particle({
  burst,
  angle,
  distance,
  size,
  color,
}: {
  burst: SharedValue<number>;
  angle: number;
  distance: number;
  size: number;
  color: string;
}) {
  const radians = (angle * Math.PI) / 180;

  const style = useAnimatedStyle(() => {
    const progress = burst.value;
    // Les petits cœurs partent vite puis ralentissent, grossissent à
    // mi-course et s'effacent à la fin.
    return {
      opacity:
        progress === 0 || progress === 1
          ? 0
          : interpolate(progress, [0, 0.15, 0.7, 1], [0, 1, 1, 0]),
      transform: [
        { translateX: Math.cos(radians) * distance * progress },
        { translateY: Math.sin(radians) * distance * progress },
        { scale: interpolate(progress, [0, 0.4, 1], [0.3, 1.1, 0.6]) },
        { rotate: `${angle + 90}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[{ position: 'absolute' }, style]}>
      <Ionicons name="heart" size={size} color={color} />
    </Animated.View>
  );
}

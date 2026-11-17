import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { hexToRgba, lightenHex } from '@/lib/color';

/** Durée de la pluie de confettis (ms). */
const CONFETTI_DURATION = 2400;
const CONFETTI_COUNT = 44;
/** Gravité, en pt/s² : les confettis montent, ralentissent, retombent. */
const GRAVITY = 950;

const HEART_RED = '#e5384f';
const GOLD = '#f2b84b';
const PINK = '#f6a5c0';

type ConfettiShape = 'strip' | 'dot' | 'heart';

type ConfettiPiece = {
  id: number;
  shape: ConfettiShape;
  color: string;
  size: number;
  /** Vitesses initiales (pt/s), vers le haut pour `vy` négatif. */
  vx: number;
  vy: number;
  /** Tours sur eux-mêmes pendant la chute. */
  spin: number;
  delay: number;
};

/**
 * Célébration d'un match au jeu des prénoms (demande explicite) : quand un
 * parent garde un prénom que l'autre avait déjà gardé, une pluie de
 * confettis jaillit du centre de l'écran (bandelettes, pastilles et petits
 * cœurs, aux couleurs du thème, du genre et de l'or), puis une carte
 * « C'est un match ! » donne le prénom en grand. Vibration de succès sur
 * téléphone (`expo-haptics`, sans effet sur le web).
 *
 * Confettis faits maison avec Reanimated, comme l'éclat de cœurs du favori
 * (`FavoriteHeart`) : pas de dépendance, rendu identique sur le web.
 * Chaque pièce suit une parabole (vitesse initiale + gravité) pilotée par
 * une seule valeur partagée.
 *
 * Seul le parent qui swipe en second voit la fête : c'est son geste qui
 * crée le match ; l'autre le retrouve dans « Vos matchs ».
 */
export function NameMatchCelebration({
  name,
  genderColor,
  accent,
  onContinue,
  onSeeMatches,
}: {
  /** Prénom du match ; `null` ferme la célébration. */
  name: string | null;
  genderColor: string;
  accent: string;
  onContinue: () => void;
  onSeeMatches: () => void;
}) {
  if (!name) return null;

  return (
    <Modal
      statusBarTranslucent
      navigationBarTranslucent
      visible
      transparent
      animationType="none"
      onRequestClose={onContinue}
    >
      <CelebrationContent
        name={name}
        genderColor={genderColor}
        accent={accent}
        onContinue={onContinue}
        onSeeMatches={onSeeMatches}
      />
    </Modal>
  );
}

function CelebrationContent({
  name,
  genderColor,
  accent,
  onContinue,
  onSeeMatches,
}: {
  name: string;
  genderColor: string;
  accent: string;
  onContinue: () => void;
  onSeeMatches: () => void;
}) {
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);
  // Tirées une fois par célébration : chaque match a sa propre gerbe.
  const [pieces] = useState(() =>
    createConfetti([accent, lightenHex(accent, 0.25), genderColor, GOLD, PINK]),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: lancé une seule fois à l'ouverture ; progress (shared value) est une référence stable.
  useEffect(() => {
    progress.value = withTiming(1, {
      duration: CONFETTI_DURATION,
      easing: Easing.linear,
    });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
  }, []);

  const origin = { x: width / 2, y: height * 0.4 };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="flex-1 items-center justify-center bg-black/50 px-6"
    >
      <View pointerEvents="none" className="absolute inset-0">
        {pieces.map((piece) => (
          <Confetti
            key={piece.id}
            piece={piece}
            origin={origin}
            progress={progress}
          />
        ))}
      </View>

      <Animated.View
        entering={ZoomIn.springify().damping(14).stiffness(160)}
        className="w-full max-w-[380px] items-center overflow-hidden rounded-[34px] bg-white px-6 pb-6 pt-7"
        style={{
          shadowColor: genderColor,
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.25,
          shadowRadius: 30,
          elevation: 12,
        }}
      >
        {/* Taches douces à la couleur du genre, en haut. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -90,
            left: -70,
            width: 240,
            height: 210,
            borderRadius: 120,
            backgroundColor: hexToRgba(genderColor, 0.1),
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -60,
            right: -80,
            width: 200,
            height: 170,
            borderRadius: 100,
            backgroundColor: hexToRgba(GOLD, 0.12),
          }}
        />

        <HeartsBadge color={genderColor} />

        <Text
          className="mt-4 text-[13px] font-bold uppercase tracking-[2px]"
          style={{ color: genderColor }}
        >
          C’est un match !
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="mt-1 text-center text-[44px] font-extrabold leading-[52px]"
          style={{ color: GLASS_TITLE_COLOR, letterSpacing: -1 }}
        >
          {name}
        </Text>
        <Text
          className="mt-1 text-center text-[14.5px] leading-5"
          style={{ color: GLASS_BODY_COLOR }}
        >
          Vous l’avez choisi tous les deux.
        </Text>

        <View className="mt-6 w-full gap-2">
          <PillButton
            label="Continuer à jouer"
            icon="play-outline"
            onPress={onContinue}
          />
          <Pressable
            accessibilityRole="button"
            onPress={onSeeMatches}
            className="flex-row items-center justify-center gap-1.5 py-2"
          >
            <Ionicons name="heart" size={15} color={genderColor} />
            <Text
              className="text-[14.5px] font-semibold"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              Voir nos matchs
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Deux cœurs entrelacés qui battent une fois, sur une pastille teintée.
 */
function HeartsBadge({ color }: { color: string }) {
  const beat = useSharedValue(0.6);

  // biome-ignore lint/correctness/useExhaustiveDependencies: lancé une seule fois ; beat (shared value) est une référence stable.
  useEffect(() => {
    beat.value = withDelay(
      150,
      withSpring(1, { damping: 6, stiffness: 180, mass: 0.7 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: beat.value }],
  }));

  return (
    <View>
      <Animated.View
        className="h-[84px] w-[84px] items-center justify-center rounded-full"
        style={[{ backgroundColor: hexToRgba(color, 0.12) }, style]}
      >
        <Ionicons
          name="heart"
          size={40}
          color={color}
          style={{ position: 'absolute', left: 14, top: 22 }}
        />
        <Ionicons
          name="heart"
          size={34}
          color={HEART_RED}
          style={{ position: 'absolute', right: 13, top: 17 }}
        />
      </Animated.View>
      <SparkLines color={GOLD} style={{ right: -14, top: -8 }} />
    </View>
  );
}

/** Une pièce de confetti, en parabole depuis `origin`. */
function Confetti({
  piece,
  origin,
  progress,
}: {
  piece: ConfettiPiece;
  origin: { x: number; y: number };
  progress: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const elapsed =
      Math.max(0, progress.value * CONFETTI_DURATION - piece.delay) / 1000;
    const x = piece.vx * elapsed;
    const y = piece.vy * elapsed + 0.5 * GRAVITY * elapsed * elapsed;
    // Apparition franche, effacement sur le dernier tiers.
    const opacity =
      elapsed === 0 ? 0 : progress.value < 0.66 ? 1 : (1 - progress.value) * 3;
    return {
      opacity,
      transform: [
        { translateX: origin.x + x },
        { translateY: origin.y + y },
        { rotate: `${piece.spin * 360 * progress.value}deg` },
      ],
    };
  });

  if (piece.shape === 'heart') {
    return (
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0 }, style]}>
        <Ionicons name="heart" size={piece.size} color={piece.color} />
      </Animated.View>
    );
  }

  const isStrip = piece.shape === 'strip';
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: isStrip ? piece.size * 0.55 : piece.size,
          height: piece.size,
          borderRadius: isStrip ? 2 : piece.size / 2,
          backgroundColor: piece.color,
        },
        style,
      ]}
    />
  );
}

/** Gerbe aléatoire : surtout des bandelettes, des pastilles, quelques cœurs. */
function createConfetti(colors: string[]): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, id) => {
    const roll = Math.random();
    const shape: ConfettiShape =
      roll < 0.15 ? 'heart' : roll < 0.6 ? 'strip' : 'dot';
    return {
      id,
      shape,
      color:
        shape === 'heart'
          ? Math.random() < 0.5
            ? HEART_RED
            : PINK
          : colors[Math.floor(Math.random() * colors.length)],
      size: shape === 'heart' ? 12 + Math.random() * 8 : 7 + Math.random() * 6,
      vx: (Math.random() * 2 - 1) * 300,
      vy: -(380 + Math.random() * 420),
      spin: (Math.random() < 0.5 ? -1 : 1) * (1 + Math.random() * 2.5),
      // Deux salves rapprochées, pour une gerbe plus vivante.
      delay: id % 2 === 0 ? 0 : 140,
    };
  });
}

import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const RING_SIZE = 156;
const STROKE = 9;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Écran de chargement de l'app (pendant la résolution du foyer), d'après une
 * capture de référence (demande explicite d'un rendu « design et moderne »,
 * sans les trois points) : un anneau dont l'arc d'accent tourne autour
 * d'une tuile à pousse de feuilles qui respire doucement, de petits traits,
 * puis « Chargement… » et une ligne d'attente. Fond et formes d'angle du
 * thème, comme les autres écrans. Mouvement réduit : Reanimated suit le
 * réglage du système.
 */
export function LoadingScreen() {
  const accent = useThemeAccent();
  const backgroundColor = useThemeBackground();
  const rotation = useSharedValue(0);
  const breath = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.linear }),
      -1,
      false,
    );
    breath.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(rotation);
      cancelAnimation(breath);
    };
  }, [rotation, breath]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 360}deg` }],
  }));
  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.96 + 0.04 * breath.value }],
  }));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Chargement en cours"
      className="flex-1 items-center justify-center overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <Animated.View
        entering={FadeIn.duration(300)}
        className="items-center gap-7 px-8"
      >
        <View
          style={{ width: RING_SIZE, height: RING_SIZE }}
          className="items-center justify-center"
        >
          {/* Piste claire, puis arc d'accent qui s'estompe vers sa queue. */}
          <Svg
            width={RING_SIZE}
            height={RING_SIZE}
            style={{ position: 'absolute' }}
          >
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={hexToRgba(accent, 0.12)}
              strokeWidth={STROKE}
              fill="none"
            />
          </Svg>
          <Animated.View
            style={[
              { position: 'absolute', width: RING_SIZE, height: RING_SIZE },
              ringStyle,
            ]}
          >
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Defs>
                <LinearGradient id="loading-arc" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={accent} stopOpacity={1} />
                  <Stop offset="1" stopColor={accent} stopOpacity={0.15} />
                </LinearGradient>
              </Defs>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="url(#loading-arc)"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE * 0.42} ${CIRCUMFERENCE}`}
                fill="none"
              />
            </Svg>
          </Animated.View>

          <Animated.View
            className="h-[84px] w-[84px] items-center justify-center rounded-[26px]"
            style={[
              {
                backgroundColor: hexToRgba(accent, 0.14),
                shadowColor: accent,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.18,
                shadowRadius: 18,
                elevation: 4,
              },
              tileStyle,
            ]}
          >
            <Ionicons name="leaf" size={38} color={accent} />
          </Animated.View>

          <SparkLines
            color={hexToRgba(accent, 0.75)}
            style={{ top: -10, right: -6, transform: [{ scale: 1.25 }] }}
          />
        </View>

        <View className="items-center gap-2">
          <Text
            className="text-[30px] font-extrabold"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
          >
            Chargement…
          </Text>
          <Text
            className="text-center text-[15px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            Veuillez patienter quelques instants
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

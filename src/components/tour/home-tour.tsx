import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { measureTourTarget, type TourRect } from '@/features/tour/targets';
import { hexToRgba } from '@/lib/color';

export type TourStep = {
  /** Identifiant de l'élément (`useTourTarget`). */
  targetId: string;
  title: string;
  body: string;
  /** Lignes illustrées sous le texte (ex. les 4 sections). */
  items?: { image: ImageSourcePropType; label: string; text: string }[];
  /** Petite étiquette à côté du compteur (ex. « Premium »). */
  badge?: string;
  /** Rayon de la découpe autour de l'élément. */
  radius?: number;
  /** `false` : l'élément est fixe (barre d'onglets), pas de défilement. */
  scroll?: boolean;
};

/** Marge entre l'élément et le bord de la découpe. */
const HOLE_PADDING = 8;
/** Écart entre la découpe et la bulle. */
const BUBBLE_GAP = 14;
const SCREEN_MARGIN = 16;
const MAX_BUBBLE_WIDTH = 380;
const BACKDROP = 'rgba(15, 18, 28, 0.66)';
const MOVE_MS = 320;
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;
const PREMIUM_GOLD = '#d39b2a';

/**
 * Visite guidée de l'accueil (demande explicite) : un voile sombre percé
 * d'une découpe arrondie autour de l'élément présenté, cerclée de blanc, et
 * une bulle d'explication posée dessous (ou dessus, selon la place) avec une
 * petite flèche vers lui. « Suivant », ou glisser vers la gauche ; glisser
 * vers la droite (ou ‹) revient en arrière ; « Passer » ferme.
 *
 * La découpe est une vue à bordure très épaisse (la bordure fait le voile,
 * l'intérieur reste transparent) : elle s'anime d'un élément à l'autre et
 * rend pareil sur téléphone et sur le web, sans masque SVG.
 *
 * Avant chaque étape, `onEnsureVisible` fait défiler l'accueil jusqu'à
 * l'élément ; il est mesuré ensuite. Un élément absent de l'écran est sauté.
 */
export function HomeTour({
  steps,
  accent,
  onEnsureVisible,
  onClose,
}: {
  steps: TourStep[];
  accent: string;
  onEnsureVisible: (targetId: string) => Promise<void>;
  onClose: () => void;
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<TourRect | null>(null);
  const [isMoving, setIsMoving] = useState(true);
  const [bubbleHeight, setBubbleHeight] = useState(0);
  const directionRef = useRef<1 | -1>(1);

  const step = steps[index];
  const isLast = index === steps.length - 1;

  // Découpe animée : position et taille.
  const holeX = useSharedValue(screenWidth / 2);
  const holeY = useSharedValue(screenHeight / 2);
  const holeW = useSharedValue(0);
  const holeH = useSharedValue(0);
  const hasHoleRef = useRef(false);

  const goTo = (next: number) => {
    if (next < 0) return;
    if (next >= steps.length) {
      onClose();
      return;
    }
    directionRef.current = next > index ? 1 : -1;
    setIndex(next);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: relancé à chaque étape seulement ; les valeurs partagées sont des références stables.
  useEffect(() => {
    let isCancelled = false;
    setIsMoving(true);
    setBubbleHeight(0);

    (async () => {
      if (step.scroll !== false) await onEnsureVisible(step.targetId);
      const measured = await measureWhenSettled(step.targetId);
      if (isCancelled) return;
      if (!measured) {
        // Élément absent (masqué pour ce rôle, pas encore affiché) : on
        // passe, dans le sens du parcours.
        goTo(index + directionRef.current);
        return;
      }
      const x = measured.x - HOLE_PADDING;
      const y = measured.y - HOLE_PADDING;
      const w = measured.width + HOLE_PADDING * 2;
      const h = measured.height + HOLE_PADDING * 2;
      // Première découpe posée d'un coup, les suivantes glissent.
      const moveMs = hasHoleRef.current ? MOVE_MS : 0;
      const timing = {
        duration: moveMs,
        easing: Easing.inOut(Easing.cubic),
      };
      holeX.value = withTiming(x, timing);
      holeY.value = withTiming(y, timing);
      holeW.value = withTiming(w, timing);
      holeH.value = withTiming(h, timing);
      hasHoleRef.current = true;
      setRect({ x, y, width: w, height: h });
      setTimeout(() => {
        if (!isCancelled) setIsMoving(false);
      }, moveMs);
    })();

    return () => {
      isCancelled = true;
    };
  }, [index]);

  // Bordure assez épaisse pour couvrir tout l'écran depuis la découpe.
  const border = Math.max(screenWidth, screenHeight) * 1.5;
  const radius = step.radius ?? 22;

  const holeStyle = useAnimatedStyle(() => ({
    left: holeX.value - border,
    top: holeY.value - border,
    width: holeW.value + border * 2,
    height: holeH.value + border * 2,
  }));
  const ringStyle = useAnimatedStyle(() => ({
    left: holeX.value,
    top: holeY.value,
    width: holeW.value,
    height: holeH.value,
  }));

  // Halo qui respire doucement autour de la découpe.
  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [glow]);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + glow.value * 0.5,
    transform: [{ scale: 1 + glow.value * 0.015 }],
  }));

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-18, 18])
    .failOffsetY([-20, 20])
    .onEnd((event) => {
      if (
        event.translationX < -SWIPE_DISTANCE ||
        event.velocityX < -SWIPE_VELOCITY
      ) {
        goTo(index + 1);
      } else if (
        event.translationX > SWIPE_DISTANCE ||
        event.velocityX > SWIPE_VELOCITY
      ) {
        goTo(index - 1);
      }
    });

  // Placement de la bulle : dessous si elle y tient, sinon dessus, sinon
  // en bas de l'écran (élément très haut, comme les 4 sections).
  const bubbleWidth = Math.min(
    screenWidth - SCREEN_MARGIN * 2,
    MAX_BUBBLE_WIDTH,
  );
  let bubbleTop = screenHeight - insets.bottom - SCREEN_MARGIN - bubbleHeight;
  let arrow: 'up' | 'down' | null = null;
  let bubbleLeft = (screenWidth - bubbleWidth) / 2;
  let arrowLeft = bubbleWidth / 2 - 9;
  if (rect) {
    const spaceBelow =
      screenHeight -
      insets.bottom -
      SCREEN_MARGIN -
      (rect.y + rect.height + BUBBLE_GAP);
    const spaceAbove = rect.y - BUBBLE_GAP - insets.top - SCREEN_MARGIN;
    if (bubbleHeight <= spaceBelow) {
      bubbleTop = rect.y + rect.height + BUBBLE_GAP;
      arrow = 'up';
    } else if (bubbleHeight <= spaceAbove) {
      bubbleTop = rect.y - BUBBLE_GAP - bubbleHeight;
      arrow = 'down';
    }
    const centerX = rect.x + rect.width / 2;
    bubbleLeft = Math.min(
      Math.max(centerX - bubbleWidth / 2, SCREEN_MARGIN),
      screenWidth - SCREEN_MARGIN - bubbleWidth,
    );
    arrowLeft = Math.min(
      Math.max(centerX - bubbleLeft - 9, 24),
      bubbleWidth - 42,
    );
  }
  const isBubbleVisible = Boolean(rect) && !isMoving && bubbleHeight > 0;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GestureDetector gesture={swipe}>
          <Animated.View
            entering={FadeIn.duration(250)}
            style={{ flex: 1, overflow: 'hidden' }}
          >
            {/* Voile complet tant que la première découpe n'est pas prête. */}
            {rect ? null : (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: BACKDROP,
                }}
              />
            )}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  borderWidth: border,
                  borderColor: BACKDROP,
                  borderRadius: radius + border,
                  opacity: rect ? 1 : 0,
                },
                holeStyle,
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  borderRadius: radius,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  opacity: rect ? 1 : 0,
                },
                ringStyle,
              ]}
            >
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    inset: -6,
                    borderRadius: radius + 6,
                    borderWidth: 3,
                    borderColor: hexToRgba('#ffffff', 0.55),
                  },
                  glowStyle,
                ]}
              />
            </Animated.View>

            <View
              key={`bubble-${index}`}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setBubbleHeight((current) =>
                  Math.abs(current - height) < 1 ? current : height,
                );
              }}
              style={{
                position: 'absolute',
                top: bubbleTop,
                left: bubbleLeft,
                width: bubbleWidth,
                opacity: isBubbleVisible ? 1 : 0,
              }}
            >
              {isBubbleVisible ? (
                <Animated.View entering={FadeIn.duration(200)}>
                  <Bubble
                    step={step}
                    index={index}
                    count={steps.length}
                    accent={accent}
                    arrow={arrow}
                    arrowLeft={arrowLeft}
                    isLast={isLast}
                    onNext={() => goTo(index + 1)}
                    onPrevious={() => goTo(index - 1)}
                    onSkip={onClose}
                  />
                </Animated.View>
              ) : (
                <Bubble
                  step={step}
                  index={index}
                  count={steps.length}
                  accent={accent}
                  arrow={null}
                  arrowLeft={0}
                  isLast={isLast}
                  onNext={() => {}}
                  onPrevious={() => {}}
                  onSkip={() => {}}
                />
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

/**
 * Mesure l'élément une fois immobile : un défilement animé peut durer plus
 * longtemps que prévu (surtout sur le web), et une mesure prise en route
 * placerait la découpe à côté. On remesure jusqu'à deux positions égales.
 */
async function measureWhenSettled(targetId: string): Promise<TourRect | null> {
  let previous = await measureTourTarget(targetId);
  for (let attempt = 0; attempt < 15 && previous; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 90));
    const current = await measureTourTarget(targetId);
    if (!current) return null;
    if (
      Math.abs(current.y - previous.y) < 1 &&
      Math.abs(current.x - previous.x) < 1 &&
      Math.abs(current.height - previous.height) < 1
    ) {
      return current;
    }
    previous = current;
  }
  return previous;
}

/** Bulle d'explication : compteur, titre, texte, lignes, navigation. */
function Bubble({
  step,
  index,
  count,
  accent,
  arrow,
  arrowLeft,
  isLast,
  onNext,
  onPrevious,
  onSkip,
}: {
  step: TourStep;
  index: number;
  count: number;
  accent: string;
  arrow: 'up' | 'down' | null;
  arrowLeft: number;
  isLast: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}) {
  return (
    <View>
      {arrow ? (
        <View
          style={{
            position: 'absolute',
            left: arrowLeft,
            [arrow === 'up' ? 'top' : 'bottom']: -8,
            width: 18,
            height: 18,
            borderRadius: 3,
            backgroundColor: '#ffffff',
            transform: [{ rotate: '45deg' }],
          }}
        />
      ) : null}
      <View
        className="gap-3 overflow-hidden rounded-[26px] bg-white px-4 pb-4 pt-3.5"
        style={{
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.22,
          shadowRadius: 26,
          elevation: 12,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -60,
            right: -50,
            width: 170,
            height: 140,
            borderRadius: 85,
            backgroundColor: hexToRgba(accent, 0.08),
          }}
        />

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1">
              {Array.from({ length: count }, (_, dot) => (
                <View
                  // biome-ignore lint/suspicious/noArrayIndexKey: points de progression, sans identité propre.
                  key={dot}
                  className="h-1.5 rounded-full"
                  style={{
                    width: dot === index ? 16 : 6,
                    backgroundColor:
                      dot <= index ? accent : hexToRgba(accent, 0.2),
                  }}
                />
              ))}
            </View>
            {step.badge ? (
              <View
                className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                style={{ backgroundColor: hexToRgba(PREMIUM_GOLD, 0.14) }}
              >
                <Ionicons name="diamond" size={10} color={PREMIUM_GOLD} />
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: PREMIUM_GOLD }}
                >
                  {step.badge}
                </Text>
              </View>
            ) : null}
          </View>
          {isLast ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Passer la visite guidée"
              hitSlop={10}
              onPress={onSkip}
            >
              <Text
                className="text-[13px] font-semibold"
                style={{ color: GLASS_BODY_COLOR }}
              >
                Passer
              </Text>
            </Pressable>
          )}
        </View>

        <View className="gap-1">
          <Text
            className="text-[18px] font-extrabold leading-6"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
          >
            {step.title}
          </Text>
          <Text
            className="text-[14px] leading-5"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {step.body}
          </Text>
        </View>

        {step.items ? (
          <View className="gap-2">
            {step.items.map((item) => (
              <View key={item.label} className="flex-row items-center gap-2.5">
                <Image
                  source={item.image}
                  style={{ width: 30, height: 30, borderRadius: 9 }}
                  resizeMode="contain"
                />
                <Text
                  className="flex-1 text-[13px] leading-[18px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  <Text
                    className="font-bold"
                    style={{ color: GLASS_TITLE_COLOR }}
                  >
                    {item.label}
                  </Text>{' '}
                  · {item.text}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="flex-row items-center gap-2.5">
          {index > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Étape précédente"
              hitSlop={6}
              onPress={onPrevious}
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: hexToRgba(accent, 0.1) }}
            >
              <Ionicons name="chevron-back" size={19} color={accent} />
            </Pressable>
          ) : null}
          <View className="flex-1">
            <Pressable
              accessibilityRole="button"
              onPress={onNext}
              className="h-11 flex-row items-center justify-center gap-1.5 overflow-hidden rounded-full active:opacity-85"
              style={{
                backgroundColor: accent,
                shadowColor: accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Text className="text-[15px] font-bold text-white">
                {isLast ? 'C’est parti !' : 'Suivant'}
              </Text>
              <Ionicons
                name={isLast ? 'checkmark' : 'arrow-forward'}
                size={17}
                color="#ffffff"
              />
            </Pressable>
            {isLast ? (
              <SparkLines
                color={hexToRgba(accent, 0.6)}
                style={{ right: -6, top: -14, transform: [{ scale: 0.75 }] }}
              />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

import { useEffect } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const LOGO_IMAGE = require('@/assets/images/Logo_coeur.png');

/** Dimensions de `Logo_coeur.png` : les positions ci-dessous s'y rapportent. */
const SOURCE_WIDTH = 600;
const SOURCE_HEIGHT = 477;

const HEART_PATH =
  'M12 21 C 5 15.5, 1 11.5, 1 7 C 1 3.6, 3.6 1, 6.8 1 C 9 1, 10.9 2.2, 12 4 C 13.1 2.2, 15 1, 17.2 1 C 20.4 1, 23 3.6, 23 7 C 23 11.5, 19 15.5, 12 21 Z';
const STAR_PATH =
  'M12 0 C 13 9, 15 12, 24 14 C 15 16, 13 19, 12 28 C 11 19, 9 16, 0 14 C 9 12, 11 9, 12 0 Z';

type Sparkle = {
  kind: 'heart' | 'star';
  /** Centre et largeur dans l'image source (600 × 477). */
  cx: number;
  cy: number;
  width: number;
  rotate: number;
  color: string;
  /** Décalage de la boucle, pour que rien ne bouge en même temps. */
  delay: number;
};

/**
 * Petits cœurs et étoiles du logo, détourés de l'image et redessinés ici
 * pour être animés (demande explicite : « simple, discret mais design »).
 */
const SPARKLES: Sparkle[] = [
  {
    kind: 'heart',
    cx: 525,
    cy: 66,
    width: 57,
    rotate: 16,
    color: '#f08a84',
    delay: 0,
  },
  {
    kind: 'heart',
    cx: 38,
    cy: 136,
    width: 40,
    rotate: -14,
    color: '#f4948f',
    delay: 900,
  },
  {
    kind: 'star',
    cx: 67,
    cy: 83,
    width: 45,
    rotate: 0,
    color: '#efae45',
    delay: 300,
  },
  {
    kind: 'star',
    cx: 561,
    cy: 299,
    width: 42,
    rotate: 0,
    color: '#efae45',
    delay: 1300,
  },
  {
    kind: 'star',
    cx: 536,
    cy: 335,
    width: 22,
    rotate: 0,
    color: '#f2b44e',
    delay: 1700,
  },
];

/**
 * Logo cœur de la page de connexion. Les cœurs flottent doucement, les
 * étoiles scintillent à tour de rôle avec une pause entre deux éclats ;
 * chacun apparaît d'un petit zoom à l'ouverture. Mouvement réduit :
 * Reanimated suit le réglage du système.
 */
export function AnimatedLogo({ width }: { width: number }) {
  const scale = width / SOURCE_WIDTH;
  const height = SOURCE_HEIGHT * scale;

  return (
    <View style={{ width, height }}>
      <Image
        source={LOGO_IMAGE}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      {SPARKLES.map((sparkle, index) => (
        <SparkleShape
          key={`${sparkle.kind}-${sparkle.cx}`}
          sparkle={sparkle}
          scale={scale}
          index={index}
        />
      ))}
    </View>
  );
}

function SparkleShape({
  sparkle,
  scale,
  index,
}: {
  sparkle: Sparkle;
  scale: number;
  index: number;
}) {
  const isHeart = sparkle.kind === 'heart';
  const width = sparkle.width * scale;
  const height = width * (isHeart ? 22 / 24 : 28 / 24);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      sparkle.delay,
      isHeart
        ? // Flottement continu, aller-retour.
          withRepeat(
            withTiming(1, {
              duration: 2300,
              easing: Easing.inOut(Easing.sin),
            }),
            -1,
            true,
          )
        : // Éclat bref puis pause : un scintillement, pas une pulsation.
          withRepeat(
            withSequence(
              withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) }),
              withTiming(0, { duration: 650, easing: Easing.in(Easing.quad) }),
              withTiming(0, { duration: 1800 }),
            ),
            -1,
          ),
    );
    return () => cancelAnimation(progress);
  }, [progress, sparkle.delay, isHeart]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    if (isHeart) {
      // Flottement assez ample pour se voir (demande explicite), sans
      // quitter la place du cœur dans le dessin.
      return {
        transform: [
          { translateY: -8 * t },
          { translateX: (sparkle.rotate > 0 ? 3 : -3) * t },
          { rotate: `${sparkle.rotate + 12 * t}deg` },
          { scale: 1 + 0.14 * t },
        ],
      };
    }
    return {
      opacity: 1 - 0.5 * t,
      transform: [{ scale: 1 - 0.4 * t }, { rotate: `${45 * t}deg` }],
    };
  });

  return (
    <Animated.View
      entering={ZoomIn.delay(150 + index * 90)
        .springify()
        .damping(12)}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: sparkle.cx * scale - width / 2,
        top: sparkle.cy * scale - height / 2,
        width,
        height,
      }}
    >
      <Animated.View style={[{ width, height }, animatedStyle]}>
        <Svg
          width={width}
          height={height}
          viewBox={isHeart ? '0 0 24 22' : '0 0 24 28'}
        >
          <Path d={isHeart ? HEART_PATH : STAR_PATH} fill={sparkle.color} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

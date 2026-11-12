import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { SparkLines } from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { darkenHex, hexToRgba, lightenHex } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const SIZE = 64;
const HEIGHT = 66;
/**
 * Même bulle « organique » que l'onglet actif de la barre de navigation
 * (`AppTabBar`) : coins légèrement asymétriques, plus haute à gauche.
 */
const BLOB_PATH =
  'M33 1.5C51 0.5 63 11 63 31C63 52 52 65 31 65C12 65 1 54 1 34C1 13 13 2.5 33 1.5Z';

/**
 * Bouton flottant d'action, habillé comme la bulle active du menu du bas
 * (demande explicite : « plus en adéquation avec le bouton du menu ») :
 * bulle organique au dégradé d'accent, reflet doux, trois petits traits qui
 * jaillissent.
 *
 * Vivant sans être distrayant : la bulle flotte très légèrement au repos ;
 * à l'appui elle s'écrase puis rebondit, et les traits rejaillissent — le
 * même vocabulaire que la sélection d'un onglet.
 *
 * `invite` : rejoue ce même geste d'appui (écrasement, rebond, traits qui
 * rejaillissent) toutes les quelques secondes — l'animation de sélection
 * d'un onglet du menu du bas, plutôt qu'un halo qui pulse (demande
 * explicite). Pour inciter à appuyer quand la liste qu'elle remplit est
 * encore vide (Informations importantes).
 *
 * Le positionnement (`absolute`, coin de l'écran) reste à l'appelant, via
 * `className`.
 */
export function BlobFab({
  icon = 'add',
  iconSize = 32,
  accessibilityLabel,
  onPress,
  className,
  style,
  invite = false,
}: {
  icon?: IoniconName;
  /** 32 pour le « + » ; plus petit pour une icône plus chargée. */
  iconSize?: number;
  accessibilityLabel: string;
  onPress: () => void;
  className?: string;
  /** Position fine (ex. `bottom` au-dessus de la barre du bas). */
  style?: StyleProp<ViewStyle>;
  invite?: boolean;
}) {
  const accent = useThemeAccent();
  const float = useSharedValue(0);
  const scale = useSharedValue(1);
  const sparks = useSharedValue(1);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [float]);

  // Le geste d'un onglet qu'on sélectionne (`AppTabBar`) : la bulle
  // s'écrase puis rebondit, les traits disparaissent puis rejaillissent.
  const playBounce = () => {
    scale.value = withSequence(
      withTiming(0.86, { duration: 90 }),
      withSpring(1, { damping: 8, stiffness: 230 }),
    );
    sparks.value = 0;
    sparks.value = withDelay(
      120,
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: `playBounce` ne manipule que des valeurs partagées stables ; le garder en dépendance relancerait l'intervalle à chaque rendu.
  useEffect(() => {
    if (!invite) return;
    // Un premier rebond peu après l'arrivée sur l'écran, puis toutes les
    // 3,5 s : assez espacé pour rester discret.
    const first = setTimeout(playBounce, 900);
    const interval = setInterval(playBounce, 3500);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [invite]);

  const handlePress = () => {
    playBounce();
    onPress();
  };

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * float.value }, { scale: scale.value }],
  }));
  const sparksStyle = useAnimatedStyle(() => ({
    opacity: sparks.value,
    transform: [{ scale: 0.5 + 0.5 * sparks.value }],
  }));

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={handlePress}
      hitSlop={6}
      className={className}
      style={style}
    >
      <Animated.View
        style={[
          {
            width: SIZE,
            height: HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: SIZE / 2,
            shadowColor: accent,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 10,
          },
          bubbleStyle,
        ]}
      >
        <Svg
          width={SIZE}
          height={HEIGHT}
          viewBox={`0 0 ${SIZE} ${HEIGHT}`}
          style={{ position: 'absolute' }}
        >
          <Defs>
            <LinearGradient id="blobFabGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={lightenHex(accent, 0.14)} />
              <Stop offset="1" stopColor={darkenHex(accent, 0.08)} />
            </LinearGradient>
          </Defs>
          <Path d={BLOB_PATH} fill="url(#blobFabGradient)" />
          {/* Reflet doux en haut à gauche : donne du volume à la bulle. */}
          <Ellipse
            cx={22}
            cy={16}
            rx={14}
            ry={8}
            fill="#ffffff"
            opacity={0.18}
          />
        </Svg>
        <Ionicons name={icon} size={iconSize} color="#ffffff" />

        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: -14,
              left: -12,
              width: 26,
              height: 26,
            },
            sparksStyle,
          ]}
        >
          <SparkLines
            color={hexToRgba(accent, 0.6)}
            style={{ top: 0, left: 0, transform: [{ rotate: '-80deg' }] }}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

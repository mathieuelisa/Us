import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { hexToRgba } from '@/lib/color';

/**
 * Briques des cartes « verre dépoli à vague pastel », nées sur `/bebe`
 * (capture de référence) et reprises par les cartes du hub
 * (`PillarCard`) : carte translucide, vague pastel en bas, tuile d'icône,
 * chevron dans une pastille ronde.
 */

export const GLASS_TITLE_COLOR = '#1c1a2e';
export const GLASS_BODY_COLOR = '#6b6b78';

/**
 * Pastels fixes des vagues : une teinte par carte pour les différencier
 * d'un coup d'œil, à intensité égale. L'accent du thème reste porté par les
 * icônes, chevrons et doodles.
 */
export const WAVE_PEACH = '#f7d6b5';
export const WAVE_PINK = '#f4c4d6';
export const WAVE_MINT = '#bfe6d0';
export const WAVE_SKY = '#cfe0f7';
export const WAVE_LILAC = '#d9cdf3';

/**
 * Vague pastel posée en bas d'une carte (deux couches décalées pour donner
 * de la profondeur). Le dégradé horizontal la fait naître de rien à gauche
 * et s'affirmer à droite. `id` doit être unique à l'écran : il nomme les
 * dégradés SVG.
 */
export function CardWave({
  id,
  color,
  secondColor,
  height = 56,
}: {
  id: string;
  color: string;
  secondColor?: string;
  height?: number;
}) {
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height={height}
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
    >
      <Defs>
        <LinearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={color} stopOpacity={0.15} />
          <Stop offset="1" stopColor={color} stopOpacity={0.75} />
        </LinearGradient>
        <LinearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
          <Stop
            offset="0"
            stopColor={secondColor ?? color}
            stopOpacity={0.55}
          />
          <Stop offset="1" stopColor={secondColor ?? color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path
        d="M0 24 C 22 12, 38 34, 62 22 S 90 6, 100 12 L 100 40 L 0 40 Z"
        fill={`url(#${id}-a)`}
      />
      <Path
        d="M0 30 C 20 22, 40 38, 66 32 S 92 26, 100 30 L 100 40 L 0 40 Z"
        fill={`url(#${id}-b)`}
      />
    </Svg>
  );
}

/** Pastille ronde teintée portant le chevron, en bas à droite des cartes. */
export function ChevronBubble({ accent }: { accent: string }) {
  return (
    <View
      className="h-9 w-9 items-center justify-center rounded-full"
      style={{
        backgroundColor: hexToRgba(accent, 0.12),
        shadowColor: accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}
    >
      <Ionicons name="chevron-forward" size={17} color={accent} />
    </View>
  );
}

/** Tuile arrondie teintée qui accueille l'emoji de la carte. */
export function IconTile({
  emoji,
  tint,
  size = 56,
}: {
  emoji: string;
  tint: string;
  size?: number;
}) {
  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: tint,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.9)',
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

/**
 * Carte « verre dépoli » : blanc translucide, grand rayon, ombre douce
 * teintée d'accent. L'ombre est portée par le `Pressable` extérieur et le
 * rognage (`overflow: hidden`, pour la vague) par la vue intérieure — sur
 * iOS, une vue rognée perd son ombre.
 */
export function GlassCard({
  accessibilityLabel,
  accent,
  onPress,
  className,
  children,
}: {
  accessibilityLabel: string;
  accent: string;
  onPress: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      className={`rounded-[28px] active:opacity-80 ${className ?? ''}`}
      style={{
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      <View
        className="flex-1 overflow-hidden rounded-[28px]"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        {children}
      </View>
    </Pressable>
  );
}

/**
 * Boucle en pointillés et petit cœur, à poser en bas d'écran — pure
 * décoration (`/bebe`, `/partenaire`).
 */
export function DashedLoopDoodle({ color }: { color: string }) {
  return (
    <View pointerEvents="none" style={{ height: 90 }}>
      <Svg width="100%" height="100%" viewBox="0 0 340 90">
        <Path
          d="M70 74 C 120 86, 170 80, 196 58 C 216 40, 204 16, 186 22 C 166 30, 178 62, 224 66 C 266 70, 300 48, 336 44"
          stroke={hexToRgba(color, 0.35)}
          strokeWidth={2}
          strokeDasharray="5 7"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <Ionicons
        name="heart-outline"
        size={26}
        color={hexToRgba(color, 0.6)}
        style={{
          position: 'absolute',
          right: '22%',
          top: 0,
          transform: [{ rotate: '10deg' }],
        }}
      />
    </View>
  );
}

type Spark = { left: number; top: number; rotate: string };

/** Trois traits en éventail vers le haut à droite (coin d'un élément). */
export const SPARKS_TOP_RIGHT: Spark[] = [
  { left: 4, top: 2, rotate: '20deg' },
  { left: 12, top: 8, rotate: '50deg' },
  { left: 16, top: 18, rotate: '80deg' },
];

/** Trois traits en éventail droit au-dessus d'un élément (\ | /). */
export const SPARKS_ABOVE: Spark[] = [
  { left: 2, top: 6, rotate: '-35deg' },
  { left: 11.5, top: 2, rotate: '0deg' },
  { left: 21, top: 6, rotate: '35deg' },
];

/**
 * Petits traits qui « jaillissent » d'un élément actif — même motif que la
 * bulle de la barre d'onglets. Boîte de 26 × 26 à positionner via `style`.
 */
export function SparkLines({
  color,
  sparks = SPARKS_TOP_RIGHT,
  style,
}: {
  color: string;
  sparks?: Spark[];
  style?: object;
}) {
  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', width: 26, height: 26 }, style]}
    >
      {sparks.map((spark) => (
        <View
          key={spark.rotate}
          style={{
            position: 'absolute',
            left: spark.left,
            top: spark.top,
            width: 3.5,
            height: 11,
            borderRadius: 2,
            backgroundColor: color,
            transform: [{ rotate: spark.rotate }],
          }}
        />
      ))}
    </View>
  );
}

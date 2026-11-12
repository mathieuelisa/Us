import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { PASSWORD_MIN_LENGTH } from '@/features/auth/api';
import { hexToRgba } from '@/lib/color';

/** Du plus faible au plus fort : rouge, orange, vert tendre, vert. */
const LEVEL_COLORS = ['#e0533d', '#f0a03c', '#7cc47f', '#2fa36b'] as const;
const LEVEL_LABELS = ['Faible', 'Moyen', 'Bon', 'Fort'] as const;
const SEGMENTS = [0, 1, 2, 3] as const;
const TRACK_COLOR = '#ebe9f0';

type Criterion = { key: string; label: string; isMet: boolean };

/**
 * Solidité d'un mot de passe, de 0 (trop court) à 4 (fort). La longueur
 * minimale est le seul critère bloquant (comme à l'inscription) ; ensuite
 * chaque critère rempli — majuscules et minuscules, chiffre, symbole — et
 * une longueur d'au moins 12 font monter d'un cran.
 */
export function evaluatePassword(password: string): {
  level: number;
  criteria: Criterion[];
} {
  const criteria: Criterion[] = [
    {
      key: 'length',
      label: `${PASSWORD_MIN_LENGTH} caractères`,
      isMet: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      key: 'case',
      label: 'Maj. et min.',
      isMet: /[a-zà-ÿ]/.test(password) && /[A-ZÀ-Ý]/.test(password),
    },
    { key: 'digit', label: 'Un chiffre', isMet: /\d/.test(password) },
    {
      key: 'symbol',
      label: 'Un symbole',
      isMet: /[^\p{L}\p{N}]/u.test(password),
    },
  ];

  if (!criteria[0].isMet) return { level: 0, criteria };
  const extras =
    criteria.slice(1).filter((criterion) => criterion.isMet).length +
    (password.length >= 12 ? 1 : 0);
  return { level: Math.min(4, 1 + extras), criteria };
}

/**
 * Jauge de solidité du mot de passe à l'inscription (demande explicite d'un
 * rendu « design et moderne ») : quatre segments qui se remplissent et
 * changent de teinte en douceur, le niveau en toutes lettres, puis les
 * critères en pastilles qui se cochent au fil de la saisie. Indicative :
 * seule la longueur minimale empêche de s'inscrire.
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const { level, criteria } = evaluatePassword(password);
  // Trop court : un premier segment à moitié, en rouge, pour montrer que
  // la jauge vit dès la première lettre.
  const target =
    level === 0 ? Math.min(0.5, password.length / 16 + 0.1) : level;
  const progress = useSharedValue(target);

  useEffect(() => {
    progress.value = withTiming(target, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  }, [target, progress]);

  const label = level === 0 ? 'Trop court' : LEVEL_LABELS[level - 1];
  const color = LEVEL_COLORS[Math.max(0, level - 1)];

  return (
    <View
      accessible
      accessibilityLabel={`Solidité du mot de passe : ${label}`}
      className="gap-2.5 px-1"
    >
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row gap-1.5">
          {SEGMENTS.map((index) => (
            <Segment key={index} index={index} progress={progress} />
          ))}
        </View>
        <Text
          className="min-w-[70px] text-right text-[12.5px] font-bold"
          style={{ color }}
        >
          {label}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-1.5">
        {criteria.map((criterion) => (
          <View
            key={criterion.key}
            className="flex-row items-center gap-1 rounded-full py-1 pl-1 pr-2.5"
            style={{
              backgroundColor: criterion.isMet
                ? hexToRgba(LEVEL_COLORS[3], 0.12)
                : 'rgba(255, 255, 255, 0.85)',
              borderWidth: 1,
              borderColor: criterion.isMet
                ? hexToRgba(LEVEL_COLORS[3], 0.25)
                : 'rgba(0, 0, 0, 0.05)',
            }}
          >
            <View
              className="h-[18px] w-[18px] items-center justify-center rounded-full"
              style={{
                backgroundColor: criterion.isMet
                  ? LEVEL_COLORS[3]
                  : TRACK_COLOR,
              }}
            >
              <Ionicons
                name={criterion.isMet ? 'checkmark' : 'ellipse'}
                size={criterion.isMet ? 12 : 5}
                color={criterion.isMet ? '#ffffff' : '#b9b6c4'}
              />
            </View>
            <Text
              className="text-[12px] font-medium"
              style={{
                color: criterion.isMet ? GLASS_TITLE_COLOR : GLASS_BODY_COLOR,
              }}
            >
              {criterion.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Un segment : se remplit de gauche à droite, teinte du niveau atteint. */
function Segment({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) {
  const fillStyle = useAnimatedStyle(() => {
    const fill = Math.min(1, Math.max(0, progress.value - index));
    return {
      width: `${fill * 100}%`,
      backgroundColor: interpolateColor(
        Math.max(1, progress.value),
        [1, 2, 3, 4],
        [...LEVEL_COLORS],
      ),
    };
  });

  return (
    <View
      className="h-1.5 flex-1 overflow-hidden rounded-full"
      style={{ backgroundColor: TRACK_COLOR }}
    >
      <Animated.View className="h-1.5 rounded-full" style={fillStyle} />
    </View>
  );
}

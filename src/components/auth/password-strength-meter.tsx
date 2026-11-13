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

import { PASSWORD_MIN_LENGTH } from '@/features/auth/api';

/**
 * Teintes adoucies (demande explicite d'une jauge plus discrète), du plus
 * faible au plus fort : corail, ambre, vert tendre, vert sauge.
 */
const LEVEL_COLORS = ['#e3998b', '#e6bf7a', '#a3d39c', '#78bf79'] as const;
/** Teinte du libellé, un ton plus soutenu que les barres pour se lire. */
const LABEL_COLORS = ['#b8695c', '#ad8540', '#5f9a64', '#4f7c66'] as const;
const LEVEL_LABELS = [
  'Mot de passe faible',
  'Mot de passe moyen',
  'Bon mot de passe',
  'Mot de passe robuste',
] as const;
const SEGMENTS = [0, 1, 2, 3] as const;
const TRACK_COLOR = '#e9e8ee';
const CRITERION_MET = '#6b7a72';
const CRITERION_PENDING = '#aeacb8';

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
      label: `${PASSWORD_MIN_LENGTH} caractères min.`,
      isMet: password.length >= PASSWORD_MIN_LENGTH,
    },
    {
      key: 'case',
      label: 'Majuscule et minuscule',
      isMet: /[a-zà-ÿ]/.test(password) && /[A-ZÀ-Ý]/.test(password),
    },
    { key: 'digit', label: 'Chiffre', isMet: /\d/.test(password) },
    {
      key: 'symbol',
      label: 'Symbole',
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
 * Jauge de solidité du mot de passe à l'inscription, version discrète
 * (capture de référence, demande explicite) : quatre barres fines aux
 * teintes douces qui se remplissent, le niveau en toutes lettres à droite,
 * puis les critères en simple texte, cochés au fil de la saisie — sans
 * pastilles. Indicative : seule la longueur minimale empêche de
 * s'inscrire.
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
  const color = LABEL_COLORS[Math.max(0, level - 1)];

  return (
    <View
      accessible
      accessibilityLabel={`Solidité du mot de passe : ${label}`}
      className="gap-2 px-1"
    >
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row gap-1.5">
          {SEGMENTS.map((index) => (
            <Segment key={index} index={index} progress={progress} />
          ))}
        </View>
        <Text className="text-[13px] font-semibold" style={{ color }}>
          {label}
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-x-3.5 gap-y-1">
        {criteria.map((criterion) => (
          <View key={criterion.key} className="flex-row items-center gap-1">
            <Ionicons
              name={criterion.isMet ? 'checkmark' : 'ellipse-outline'}
              size={criterion.isMet ? 14 : 8}
              color={criterion.isMet ? CRITERION_MET : CRITERION_PENDING}
            />
            <Text
              className="text-[12.5px]"
              style={{
                color: criterion.isMet ? CRITERION_MET : CRITERION_PENDING,
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
      className="h-[5px] flex-1 overflow-hidden rounded-full"
      style={{ backgroundColor: TRACK_COLOR }}
    >
      <Animated.View className="h-[5px] rounded-full" style={fillStyle} />
    </View>
  );
}

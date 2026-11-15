import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

/**
 * Illustrations fournies (fond transparent, petits traits inclus) : cigogne
 * au baluchon pour « J'attends un bébé », deux cœurs pour le partenaire.
 */
const ILLUSTRATIONS = {
  pregnant: require('@/assets/images/Signup_stork.png'),
  partner: require('@/assets/images/Signup_hearts.png'),
} as const;

/** Palette chaude fixe de la carte partenaire (pêche → crème). */
const PARTNER_PALETTE = {
  from: '#fbe3d3',
  to: '#fff6ef',
  wave: '#f6d2b8',
} as const;

/** Largeur d'écran à partir de laquelle l'illustration passe à gauche du texte. */
const WIDE_LAYOUT_MIN_WIDTH = 520;

export type SignupRoleKind = 'pregnant' | 'partner';

/**
 * Carte de rôle illustrée à l'inscription, d'après une capture de référence
 * (demande explicite : « plus design ») : fond en dégradé doux, vague en
 * bas, illustration, titre en gras, coche ronde en haut à droite. Choisie,
 * elle prend une bordure d'accent et une ombre teintée.
 *
 * La carte « J'attends un bébé » suit l'accent du thème ; la carte
 * partenaire garde une palette chaude fixe pour que les deux choix se
 * distinguent d'un coup d'œil, comme sur la référence.
 *
 * Sur téléphone (deux cartes côte à côte d'environ 160 pt), l'illustration
 * passe au-dessus du texte ; sur écran large, elle est à gauche.
 */
export function SignupRoleCard({
  kind,
  title,
  subtitle,
  isSelected,
  accent,
  onPress,
}: {
  kind: SignupRoleKind;
  title: string;
  subtitle: string;
  isSelected: boolean;
  accent: string;
  onPress: () => void;
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_LAYOUT_MIN_WIDTH;
  const isPregnant = kind === 'pregnant';
  const themeBackground = useThemeBackground();

  const gradient = isPregnant
    ? // Teintes transparentes sur le pastel du thème : `lightenHex` décale
      // chaque canal du même montant et ferait virer la sauge au cyan.
      ([hexToRgba(accent, 0.16), hexToRgba(accent, 0.02)] as const)
    : ([PARTNER_PALETTE.from, PARTNER_PALETTE.to] as const);
  const waveColor = isPregnant
    ? hexToRgba(accent, 0.14)
    : hexToRgba(PARTNER_PALETTE.wave, 0.8);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${title}, ${subtitle}`}
      onPress={onPress}
      className="flex-1"
      style={({ pressed }) => ({
        borderRadius: 26,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        shadowColor: isSelected ? accent : '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isSelected ? 0.22 : 0.06,
        shadowRadius: 18,
        elevation: isSelected ? 6 : 2,
      })}
    >
      <View
        className="flex-1 overflow-hidden rounded-[26px]"
        style={{
          backgroundColor: isPregnant ? themeBackground : '#ffffff',
          borderWidth: 2,
          borderColor: isSelected ? accent : 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        />
        <BottomWave color={waveColor} />

        <View
          className={
            isWide
              ? 'min-h-[150px] flex-row items-center gap-3 py-4 pl-3 pr-4'
              : 'min-h-[176px] gap-2 px-3.5 pb-4 pt-3.5'
          }
        >
          <Image
            source={ILLUSTRATIONS[kind]}
            resizeMode="contain"
            style={
              isWide
                ? { width: 132, height: 104 }
                : { width: 100, height: 78, marginLeft: -4 }
            }
          />

          <View className={isWide ? 'flex-1 gap-1' : 'gap-0.5'}>
            <Text
              className={
                isWide
                  ? 'text-[19px] font-extrabold leading-6'
                  : 'text-[15.5px] font-extrabold leading-5'
              }
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
            >
              {title}
            </Text>
            <Text
              className={isWide ? 'text-[14px]' : 'text-[12.5px] leading-4'}
              style={{ color: GLASS_BODY_COLOR }}
            >
              {subtitle}
            </Text>
          </View>
        </View>

        <View className="absolute right-3 top-3">
          {isSelected ? (
            <View
              className="h-7 w-7 items-center justify-center rounded-full"
              style={{
                backgroundColor: accent,
                borderWidth: 2,
                borderColor: '#ffffff',
              }}
            >
              <Ionicons name="checkmark" size={15} color="#ffffff" />
            </View>
          ) : (
            <View
              className="h-7 w-7 rounded-full"
              style={{
                borderWidth: 2,
                borderColor: 'rgba(120, 120, 135, 0.45)',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              }}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

/** Vague douce posée au bas de la carte. */
function BottomWave({ color }: { color: string }) {
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height={46}
      viewBox="0 0 200 46"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
    >
      <Path
        d="M0 30 C 40 14, 80 40, 125 28 C 160 19, 185 10, 200 12 L 200 46 L 0 46 Z"
        fill={color}
      />
    </Svg>
  );
}

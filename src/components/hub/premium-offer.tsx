import { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';
import { Image, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PREMIUM_FEATURES } from '@/components/onboarding/paywall-modal';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';

/**
 * Contenu de l'offre premium — illustration sur une tache d'accent, titre
 * souligné, prix dans un encart teinté à diamant, fonctionnalités en
 * pastilles cochées, bouton en gélule d'accent. Partagé entre le paywall
 * des écrans d'accès (`PremiumPaywallModal`) et la page `/premium`, pour
 * qu'ils restent identiques (demande explicite).
 *
 * Le bouton reste **inerte** (« bientôt disponible ») : le paiement est hors
 * périmètre MVP (DOCS/versions/MVP.md). Il est rendu comme une gélule
 * d'accent mais sans `Pressable`, pour ne rien promettre au toucher.
 */
export function PremiumOffer({
  title,
  image,
  compact = false,
}: {
  title: string;
  image: ImageSourcePropType;
  /**
   * Gabarit resserré pour la page `/premium`, qui doit tenir sans défiler
   * au-dessus de la barre de navigation (demande explicite).
   */
  compact?: boolean;
}) {
  const accent = useThemeAccent();
  const size = compact ? COMPACT : REGULAR;

  return (
    <>
      <View className={compact ? 'items-center gap-1.5' : 'items-center gap-2'}>
        <View
          className="w-[150px] items-center justify-center"
          style={{ height: size.illustrationHeight }}
          pointerEvents="none"
        >
          <View
            style={{
              position: 'absolute',
              bottom: 2,
              width: 120,
              height: size.illustrationHeight * 0.62,
              borderRadius: 60,
              backgroundColor: hexToRgba(accent, 0.12),
            }}
          />
          <Ionicons
            name="leaf"
            size={30}
            color={hexToRgba(accent, 0.3)}
            style={{
              position: 'absolute',
              right: 14,
              bottom: 8,
              transform: [{ rotate: '30deg' }],
            }}
          />
          <Image
            source={image}
            style={{
              width: size.imageHeight * 0.85,
              height: size.imageHeight,
            }}
            resizeMode="contain"
          />
          <Ionicons
            name="heart"
            size={20}
            color="#f08aa8"
            style={{ position: 'absolute', right: 6, top: 10 }}
          />
          <SparkLines
            color={hexToRgba(accent, 0.55)}
            style={{
              left: 4,
              top: 6,
              transform: [{ rotate: '-70deg' }],
            }}
          />
        </View>

        <Text
          className="text-center font-extrabold"
          style={{
            color: GLASS_TITLE_COLOR,
            letterSpacing: -0.4,
            fontSize: size.titleSize,
            lineHeight: size.titleSize + 6,
          }}
        >
          {title}
        </Text>
        <Svg width={130} height={10} viewBox="0 0 130 10">
          <Path
            d="M4 7 C 38 2, 92 1.5, 126 5"
            stroke={hexToRgba(accent, 0.5)}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <Text style={{ color: GLASS_BODY_COLOR, fontSize: compact ? 13 : 14 }}>
          Un seul paiement, accès à vie
        </Text>
      </View>

      <View
        className={`flex-row items-center gap-3.5 rounded-[24px] px-4 ${
          compact ? 'py-2.5' : 'py-3.5'
        }`}
        style={{
          backgroundColor: hexToRgba(accent, 0.08),
          borderWidth: 1,
          borderColor: hexToRgba(accent, 0.12),
        }}
      >
        <View>
          <Ionicons
            name="diamond-outline"
            size={compact ? 26 : 32}
            color={accent}
          />
          <SparkLines
            color={hexToRgba(accent, 0.55)}
            style={{
              right: -18,
              top: -14,
              transform: [{ scale: 0.7 }],
            }}
          />
        </View>
        <View className="flex-1 gap-0.5">
          <Text
            className="font-extrabold"
            style={{ color: GLASS_TITLE_COLOR, fontSize: compact ? 15.5 : 17 }}
          >
            14,99 € — paiement unique
          </Text>
          <Text className="text-[12.5px]" style={{ color: GLASS_BODY_COLOR }}>
            Pas d’abonnement, pas de renouvellement
          </Text>
        </View>
      </View>

      <View className={compact ? 'gap-1.5' : 'gap-2'}>
        {PREMIUM_FEATURES.map((feature) => (
          <View
            key={feature}
            className={`flex-row items-center gap-3 rounded-[18px] pl-2 pr-3 ${
              compact ? 'py-1' : 'py-2'
            }`}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.04)',
              shadowColor: accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 1,
            }}
          >
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: size.checkSize,
                height: size.checkSize,
                backgroundColor: hexToRgba(accent, 0.14),
              }}
            >
              <Ionicons
                name="checkmark"
                size={size.checkSize * 0.57}
                color={accent}
              />
            </View>
            <Text
              className="flex-1"
              style={{
                color: GLASS_TITLE_COLOR,
                fontSize: size.featureSize,
                lineHeight: size.featureSize + 4.5,
              }}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View className={compact ? '' : 'mt-1'}>
        <View
          accessibilityRole="text"
          accessibilityLabel="Débloquer — bientôt disponible"
          className="flex-row items-center justify-center gap-2.5 overflow-hidden rounded-full"
          style={{
            height: size.buttonHeight,
            backgroundColor: accent,
            shadowColor: accent,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 18,
            elevation: 4,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -30,
              top: -20,
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: lightenHex(accent, 0.12),
              opacity: 0.6,
            }}
          />
          <Ionicons name="lock-open-outline" size={20} color="#ffffff" />
          <Text
            className="font-bold text-white"
            style={{ fontSize: compact ? 15 : 16 }}
          >
            Débloquer — bientôt disponible
          </Text>
        </View>
        <SparkLines
          color={hexToRgba(accent, 0.6)}
          style={{ right: -6, top: -20 }}
        />
      </View>
    </>
  );
}

const REGULAR = {
  illustrationHeight: 112,
  imageHeight: 108,
  titleSize: 22,
  checkSize: 28,
  featureSize: 13.5,
  buttonHeight: 54,
};

const COMPACT = {
  illustrationHeight: 80,
  imageHeight: 76,
  titleSize: 19,
  checkSize: 22,
  featureSize: 12.5,
  buttonHeight: 48,
};

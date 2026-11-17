import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PremiumPurchaseButton } from '@/components/hub/premium-purchase-button';
import { PREMIUM_FEATURES } from '@/components/onboarding/paywall-modal';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { useIsSoloHousehold } from '@/features/household/hooks';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

/**
 * Contenu de l'offre premium — illustration sur une tache d'accent, titre
 * souligné, prix dans un encart teinté à diamant, fonctionnalités en
 * pastilles cochées, bouton en gélule d'accent. Partagé entre le paywall
 * des écrans d'accès (`PremiumPaywallModal`) et la page `/premium`, pour
 * qu'ils restent identiques (demande explicite).
 *
 * Le bouton achète réellement le premium (`PremiumPurchaseButton`, paiement
 * dans l'app via Stripe — choix du 2026-11-15, demande explicite).
 */
export function PremiumOffer({
  title,
  image,
  illustration,
  compact = false,
}: {
  title: string;
  image: ImageSourcePropType;
  /**
   * Illustration composée à la place de `image` (ex. les deux cartes du
   * match des prénoms, pour rester raccord avec sa carte d'Organisation).
   */
  illustration?: ReactNode;
  /**
   * Gabarit resserré pour la page `/premium`, qui doit tenir sans défiler
   * au-dessus de la barre de navigation (demande explicite).
   */
  compact?: boolean;
}) {
  const accent = useThemeAccent();
  const size = compact ? COMPACT : REGULAR;
  // Espace « Seul·e » : pas de partenaire, donc rien à préciser.
  const isSolo = useIsSoloHousehold();

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
          {illustration ?? (
            <Image
              source={image}
              style={{
                width: size.imageHeight * 0.85,
                height: size.imageHeight,
              }}
              resizeMode="contain"
            />
          )}
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
        className={`rounded-[24px] px-4 ${compact ? 'gap-2 py-2.5' : 'gap-3 py-3.5'}`}
        style={{
          backgroundColor: hexToRgba(accent, 0.08),
          borderWidth: 1,
          borderColor: hexToRgba(accent, 0.12),
        }}
      >
        <View className="flex-row items-center gap-3.5">
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
              style={{
                color: GLASS_TITLE_COLOR,
                fontSize: compact ? 15.5 : 17,
              }}
            >
              14,99 € — paiement unique
            </Text>
            <Text className="text-[12.5px]" style={{ color: GLASS_BODY_COLOR }}>
              Pas d’abonnement, pas de renouvellement
            </Text>
          </View>
        </View>
        {isSolo ? null : (
          <SharedPurchaseNote accent={accent} compact={compact} />
        )}
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

      <PremiumPurchaseButton compact={compact} />
    </>
  );
}

/**
 * « Valable pour vous deux » (demande explicite) : le premium est porté par
 * le foyer, un seul achat le débloque pour les deux parents. Posé dans
 * l'encart du prix, au moment où la question se pose.
 */
function SharedPurchaseNote({
  accent,
  compact,
}: {
  accent: string;
  compact: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-2.5 border-t pt-2 ${compact ? '' : 'pt-3'}`}
      style={{ borderColor: hexToRgba(accent, 0.12) }}
    >
      <View
        className="items-center justify-center rounded-full bg-white"
        style={{ width: compact ? 26 : 30, height: compact ? 26 : 30 }}
      >
        <Ionicons name="people" size={compact ? 14 : 16} color={accent} />
      </View>
      <Text
        className="flex-1 leading-[17px]"
        style={{ color: GLASS_TITLE_COLOR, fontSize: compact ? 12.5 : 13 }}
      >
        <Text className="font-bold">Valable pour vous deux</Text> : votre
        partenaire n’a rien à payer.
      </Text>
    </View>
  );
}

const REGULAR = {
  illustrationHeight: 112,
  imageHeight: 108,
  titleSize: 22,
  checkSize: 28,
  featureSize: 13.5,
};

const COMPACT = {
  illustrationHeight: 80,
  imageHeight: 76,
  titleSize: 19,
  checkSize: 22,
  featureSize: 12.5,
};

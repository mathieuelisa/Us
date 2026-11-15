import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ContractionsIllustration } from '@/components/hub/contractions-illustration';
import { NameCardsIllustration } from '@/components/hub/name-cards-illustration';
import {
  CardWave,
  ChevronBubble,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  GlassCard,
  WAVE_MINT,
  WAVE_PEACH,
  WAVE_PINK,
} from '@/components/ui/glass-card';
import { hexToRgba } from '@/lib/color';

/** Vert profond du premium, comme les cartes premium du hub. */
const PREMIUM_GREEN = '#1f3d3a';
const PREMIUM_GREEN_LIGHT = '#2f5c55';
const PREMIUM_GOLD = '#e8c874';

/**
 * Hauteur commune des cartes « Inclus » : celle de la plus haute (titre
 * des contractions sur 3 lignes sur un écran de 375 pt), pour que les trois
 * aient la même taille (demande explicite).
 */
const BENEFIT_CARD_HEIGHT = 128;

/**
 * Page Premium d'un foyer qui a payé (demande explicite du 2026-11-15,
 * d'après une maquette) : titre « Vos avantages Premium », bandeau vert
 * à couronne, puis une carte par fonctionnalité
 * débloquée avec sa pastille « Inclus », chacune ouvrant son écran.
 *
 * Le vert et l'or sont ceux de l'identité premium (cartes premium du hub
 * et d'Organisation) ; seul le trait sous le titre suit l'accent du thème
 * personnel.
 */
export function PremiumBenefits({
  accent,
  isSolo,
}: {
  accent: string;
  isSolo: boolean;
}) {
  return (
    <View className="gap-4">
      <View className="gap-2 px-1 pt-1">
        <Text
          className="text-[26px] font-extrabold leading-[32px]"
          style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.7 }}
        >
          Vos avantages Premium
        </Text>
        <Svg width={92} height={10} viewBox="0 0 92 10">
          <Path
            d="M3 7 C 26 2.5, 62 2, 89 5"
            stroke={hexToRgba(accent, 0.7)}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <Text className="text-[15px]" style={{ color: GLASS_BODY_COLOR }}>
          Profitez de toutes les fonctionnalités exclusives.
        </Text>
      </View>

      <HeroBanner />

      <BenefitCard
        id="bebe"
        accent={accent}
        waveColor={WAVE_PEACH}
        title="Votre bébé"
        subtitle="Croissance, biberons, allaitement, sommeil"
        href="/bebe"
        illustration={<BearIllustration />}
      />
      <BenefitCard
        id="prenoms"
        accent={accent}
        waveColor={WAVE_PINK}
        title="Le match des prénoms"
        subtitle={
          isSolo
            ? 'Trouvez le prénom parfait'
            : 'Trouvez le prénom parfait à deux'
        }
        href="/prenoms"
        illustration={<NameCardsIllustration />}
      />
      <BenefitCard
        id="contractions"
        accent={accent}
        waveColor={WAVE_MINT}
        title="Assistant Contractions & Départ Maternité"
        subtitle="Chronométrez, on vous dit quand partir"
        href="/contractions"
        illustration={<ContractionsIllustration />}
      />
    </View>
  );
}

/** Couronne 3D dorée, étincelles comprises (fournie par l'utilisateur). */
const CROWN_IMAGE = require('@/assets/images/Premium_crown.png');

/**
 * Bandeau vert, d'après la capture de référence : badge « Actif », promesse
 * à gauche ; à droite un grand arc plus clair, deux collines et la couronne
 * posée sur la colline de devant.
 */
function HeroBanner() {
  return (
    <View
      className="overflow-hidden rounded-[30px]"
      style={{
        shadowColor: PREMIUM_GREEN,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={[PREMIUM_GREEN, PREMIUM_GREEN_LIGHT]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ minHeight: 178 }}
      >
        {/* Grand arc clair qui occupe le tiers droit, du haut en bas. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: -90,
            top: -70,
            width: 290,
            height: 290,
            borderRadius: 145,
            backgroundColor: 'rgba(255, 255, 255, 0.055)',
          }}
        />

        {/* Collines : celle du fond, puis celle de devant, sous la couronne. */}
        <Svg
          pointerEvents="none"
          width={230}
          height={78}
          viewBox="0 0 230 78"
          style={{ position: 'absolute', right: 0, bottom: 0 }}
        >
          <Path
            d="M0 78 C 60 34, 150 20, 230 30 L 230 78 Z"
            fill="rgba(111, 174, 156, 0.22)"
          />
          <Path
            d="M70 78 C 110 46, 175 36, 230 44 L 230 78 Z"
            fill="rgba(111, 174, 156, 0.32)"
          />
        </Svg>

        <Image
          source={CROWN_IMAGE}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          style={{
            position: 'absolute',
            right: 14,
            bottom: 26,
            width: 112,
            height: 95,
          }}
        />

        <View className="gap-3 p-5" style={{ paddingRight: 128 }}>
          <View
            className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5"
            style={{ backgroundColor: PREMIUM_GOLD }}
          >
            <MaterialCommunityIcons
              name="crown"
              size={15}
              color={PREMIUM_GREEN}
            />
            <Text
              className="text-[12px] font-extrabold"
              style={{ color: PREMIUM_GREEN, letterSpacing: 0.8 }}
            >
              ACTIF
            </Text>
          </View>
          <Text className="text-[17px] leading-[24px] text-white">
            Accès illimité à toutes les fonctionnalités essentielles de votre
            grossesse.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

/**
 * Carte d'une fonctionnalité débloquée, au design des cartes cliquables de
 * l'app (demande explicite) : carte « verre dépoli » (`GlassCard`, pâlit au
 * toucher), vague pastel, illustration sur tache, titre et description,
 * pastille « Inclus » en haut à droite (comme le badge « Premium » de la
 * carte Croissance) et chevron en bas à droite. Toute la carte ouvre
 * l'écran de la fonctionnalité. Hauteur commune aux trois cartes.
 */
function BenefitCard({
  id,
  title,
  subtitle,
  href,
  illustration,
  waveColor,
  accent,
}: {
  id: string;
  title: string;
  subtitle: string;
  href: Href;
  illustration: ReactNode;
  waveColor: string;
  accent: string;
}) {
  return (
    <GlassCard
      accessibilityLabel={`Ouvrir ${title}, inclus dans votre Premium`}
      accent={accent}
      onPress={() => router.push(href)}
    >
      <CardWave id={`wave-premium-${id}`} color={waveColor} height={36} />
      <View
        className="flex-row items-center gap-2.5 py-3.5 pl-2 pr-3"
        style={{ minHeight: BENEFIT_CARD_HEIGHT }}
      >
        {/* Illustrations au gabarit 82 × 64, réduites pour laisser de la
            place au texte sur un petit écran. */}
        <View
          className="items-center justify-center"
          style={{ width: 70, height: 70 }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: 66,
              height: 46,
              bottom: 4,
              borderRadius: 33,
              backgroundColor: hexToRgba(accent, 0.1),
            }}
          />
          <View style={{ transform: [{ scale: 0.82 }] }}>{illustration}</View>
        </View>

        <View className="flex-1 gap-1">
          <Text
            className="text-[15.5px] font-extrabold leading-[20px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.2 }}
          >
            {title}
          </Text>
          <Text
            className="text-[12.5px] leading-[17px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {subtitle}
          </Text>
        </View>

        <View className="items-end justify-between self-stretch">
          <View
            className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
            style={{ backgroundColor: PREMIUM_GREEN }}
          >
            <Ionicons name="lock-open" size={11} color={PREMIUM_GOLD} />
            <Text className="text-[11.5px] font-bold text-white">Inclus</Text>
          </View>
          <ChevronBubble accent={accent} />
        </View>
      </View>
    </GlassCard>
  );
}

/** L'ourson de l'app (même illustration que l'offre), avec un cœur. */
function BearIllustration() {
  return (
    <View pointerEvents="none" style={{ width: 82, height: 72 }}>
      <Image
        source={require('@/assets/images/Baby_said_hi.png')}
        style={{ position: 'absolute', left: 6, top: 0, width: 66, height: 72 }}
        resizeMode="contain"
      />
      <Ionicons
        name="heart"
        size={16}
        color="#e8739a"
        style={{ position: 'absolute', right: 2, top: 10 }}
      />
    </View>
  );
}

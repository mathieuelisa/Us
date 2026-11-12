import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { NameCardsIllustration } from '@/components/hub/name-cards-illustration';
import { PremiumLockedScreen } from '@/components/hub/premium-locked-screen';
import {
  ChevronBubble,
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const HEART_IMAGE = require('@/assets/images/Heart_girls_boys.png');
const LEAF_IMAGE = require('@/assets/images/Leaf_branch.png');
const HEADER_HEART_IMAGE = require('@/assets/images/Prenoms_heart_header.png');
const DESCRIPTION =
  "Swipez chacun de votre côté et découvrez les prénoms sur lesquels vous êtes tombés d'accord.";

/**
 * Les 4 entrées du jeu, chacune avec son illustration (fournie par
 * l'utilisateur, tache de couleur comprise dans l'image). Accessibles en
 * fermant le paywall, comme les suivis de `/bebe` (le paiement est hors
 * MVP) : filles et garçons ouvrent le jeu (`/prenoms-jeu`), les deux autres
 * leurs listes.
 */
const PRENOMS_MODULES = [
  {
    label: 'Prénoms filles',
    image: require('@/assets/images/Prenoms_filles.png'),
    href: '/prenoms-jeu?gender=girl',
  },
  {
    label: 'Prénoms garçons',
    image: require('@/assets/images/Prenoms_garcons.png'),
    href: '/prenoms-jeu?gender=boy',
  },
  {
    label: 'Vos matchs',
    image: require('@/assets/images/Prenoms_matchs.png'),
    href: '/prenoms-matchs',
  },
  {
    label: 'Favoris',
    image: require('@/assets/images/Prenoms_favoris.png'),
    href: '/prenoms-favoris',
  },
] as const;

/**
 * En-tête sur mesure (capture de référence) : grand titre souligné, cœur
 * fille / garçon en haut à droite (illustration fournie, légèrement
 * penchée), description en dessous sur toute la largeur.
 */
function PrenomsHeader({ accent }: { accent: string }) {
  return (
    <View className="gap-4">
      <View className="min-h-[124px] justify-center">
        {/* Cœur fille / garçon (illustration fournie, traits, cœurs et
            boucle compris), légèrement penché. */}
        <Image
          source={HEADER_HEART_IMAGE}
          style={{
            position: 'absolute',
            top: -18,
            right: -16,
            width: 170,
            height: 130,
            transform: [{ rotate: '8deg' }],
          }}
          resizeMode="contain"
        />

        <View className="gap-2" style={{ maxWidth: '62%' }}>
          <Text
            className="text-[32px] font-extrabold leading-[38px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.7 }}
          >
            Le match des prénoms
          </Text>
          <Svg width={120} height={10} viewBox="0 0 120 10">
            <Path
              d="M3 7 C 34 2, 80 1.5, 117 4"
              stroke={hexToRgba(accent, 0.5)}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
      </View>

      <Text
        className="text-[14.5px] leading-[21px]"
        style={{ color: GLASS_BODY_COLOR }}
      >
        {DESCRIPTION}
      </Text>
    </View>
  );
}

/**
 * Grille 2×2 des catégories : cartes « verre dépoli », illustration en
 * haut, cadenas en haut à droite, libellé en bas. Les cartes ne
 * sont pas touchables (vitrine verrouillée) ; le chevron en pastille est
 * repris de la capture de référence à la demande explicite de
 * l'utilisateur, à titre décoratif.
 */
function PrenomsGrid({ accent }: { accent: string }) {
  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap justify-between gap-y-3.5">
        {PRENOMS_MODULES.map((module) => (
          <Pressable
            key={module.label}
            accessibilityRole="button"
            accessibilityLabel={module.label}
            onPress={() => router.push(module.href)}
            className="w-[48%] gap-3 rounded-[28px] p-4 active:opacity-80"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.95)',
              shadowColor: accent,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.1,
              shadowRadius: 18,
              elevation: 3,
            }}
          >
            <Image
              source={module.image}
              style={{ width: 104, height: 104, marginLeft: -8, marginTop: -6 }}
              resizeMode="contain"
            />
            <View className="flex-row items-center justify-between gap-2">
              <Text
                className="flex-1 text-[15.5px] font-bold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {module.label}
              </Text>
              <ChevronBubble accent={accent} />
            </View>
          </Pressable>
        ))}
      </View>

      {/* Branche de feuillage (illustration fournie) en bas à gauche, la
          boucle en pointillés à droite — fond décoratif de la capture. */}
      <View pointerEvents="none">
        <DashedLoopDoodle color={accent} />
        <Image
          source={LEAF_IMAGE}
          style={{
            position: 'absolute',
            left: -46,
            bottom: -52,
            width: 220,
            height: 146,
            opacity: 0.9,
            transform: [{ rotate: '-12deg' }],
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

/**
 * Écran d'accès « Le match des prénoms » (mini-jeu premium, hors MVP — voir
 * DOCS/versions/MVP.md). Ouvert depuis la carte teaser d'Organisation &
 * Préparation. Structure partagée avec `/bebe` — voir
 * `PremiumLockedScreen` — avec en-tête et grille sur mesure, d'après une
 * capture de référence (demande explicite).
 */
export default function PrenomsScreen() {
  const accent = useThemeAccent();

  return (
    <PremiumLockedScreen
      title="Le match des prénoms"
      image={HEART_IMAGE}
      description={DESCRIPTION}
      paywallTitle="Débloquez le match des prénoms"
      // Les deux cartes de l'entrée « Le match des prénoms »
      // d'Organisation, pour que le paywall soit raccord (demande
      // explicite).
      paywallIllustration={<NameCardsIllustration scale={1.45} />}
      header={<PrenomsHeader accent={accent} />}
      gridContent={<PrenomsGrid accent={accent} />}
    />
  );
}

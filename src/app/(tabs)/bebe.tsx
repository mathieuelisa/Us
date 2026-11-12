import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, type ImageSourcePropType, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { PremiumLockedScreen } from '@/components/hub/premium-locked-screen';
import {
  CardWave,
  ChevronBubble,
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  GlassCard,
  IconTile,
  WAVE_MINT,
  WAVE_PEACH,
  WAVE_PINK,
  WAVE_SKY,
} from '@/components/ui/glass-card';
import { BABY_MODULES, type BabyModuleSlug } from '@/features/baby/constants';
import {
  useThemeAccent,
  useThemeBabyWallpaper,
} from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';

const TITLE_COLOR = GLASS_TITLE_COLOR;
const BODY_COLOR = GLASS_BODY_COLOR;
const PREMIUM_GOLD = '#b8860b';

const BABY_IMAGE = require('@/assets/images/Baby_said_hi.png');
// Icônes 3D des suivis (fournies par l'utilisateur) : elles ont déjà leur
// tuile, elles remplacent donc tuile et émoji. Définies une seule fois
// dans `BABY_MODULES`, reprises dans les écrans de suivi.
const BIBERON_ICON = BABY_MODULES.biberon.image;
const CROISSANCE_ICON = BABY_MODULES.croissance.image;
const BAIN_ICON = BABY_MODULES.bain.image;
const ALLAITEMENT_ICON = BABY_MODULES.allaitement.image;
const DESCRIPTION =
  'Centralisez la croissance, les repas et le sommeil de bébé, et gardez votre co-parent connecté à chaque étape.';

/**
 * Ouvre le détail d'un suivi. Les 4 routes vivent dans le groupe `(tabs)`
 * (`bebe-<slug>`, déclarées `href: null` dans `_layout.tsx`) pour que la
 * barre de navigation reste visible pendant la consultation, comme pour
 * `/premium`.
 */
function openBabyModule(slug: BabyModuleSlug) {
  router.push(`/bebe-${slug}`);
}

/** Trois petits traits qui « jaillissent », même motif que la barre d'onglets. */
function Sparks({ color }: { color: string }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 6, right: 0, width: 26, height: 26 }}
    >
      {[
        { left: 4, top: 2, rotate: '20deg' },
        { left: 12, top: 8, rotate: '50deg' },
        { left: 16, top: 18, rotate: '80deg' },
      ].map((spark) => (
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

/**
 * En-tête sur mesure : grand titre souligné d'un trait « à main levée »,
 * ourson posé sur une tache d'accent, et description dans une gélule teintée
 * — remplace le bloc centré par défaut de `PremiumLockedScreen`.
 */
function BabyHeader({ accent }: { accent: string }) {
  return (
    <View className="gap-5">
      <View className="flex-row items-center">
        <View className="flex-1 gap-1.5">
          <Ionicons
            name="heart-outline"
            size={26}
            color={hexToRgba(accent, 0.75)}
            style={{
              position: 'absolute',
              top: -30,
              right: 14,
              transform: [{ rotate: '-14deg' }],
            }}
          />
          <Text
            className="text-[34px] font-extrabold"
            style={{ color: TITLE_COLOR, letterSpacing: -0.8 }}
          >
            Votre bébé
          </Text>
          <Svg width={150} height={12} viewBox="0 0 150 12">
            <Path
              d="M4 9 C 40 3, 100 1.5, 146 5"
              stroke={hexToRgba(accent, 0.45)}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>

        <View className="h-40 w-36 items-center justify-center">
          <View
            className="absolute h-32 w-32 rounded-full"
            style={{
              backgroundColor: hexToRgba(accent, 0.12),
              right: -14,
              top: 6,
            }}
          />
          <Image
            source={BABY_IMAGE}
            style={{ width: 120, height: 140 }}
            resizeMode="contain"
          />
          <Sparks color={hexToRgba(accent, 0.7)} />
        </View>
      </View>

      <View
        className="flex-row items-center gap-3 rounded-[28px] px-5 py-4"
        style={{ backgroundColor: hexToRgba(accent, 0.12) }}
      >
        <Ionicons name="sparkles" size={18} color={accent} />
        <Text
          className="flex-1 text-[13.5px] leading-5"
          style={{ color: '#4a4858' }}
        >
          {DESCRIPTION}
        </Text>
        <Ionicons
          name="heart-outline"
          size={22}
          color={hexToRgba(accent, 0.7)}
          style={{
            position: 'absolute',
            right: -6,
            top: -14,
            transform: [{ rotate: '12deg' }],
          }}
        />
      </View>
    </View>
  );
}

/** Points de la courbe décorative, en % de la zone du graphe. */
const SPARKLINE_POINTS = [
  { x: 6, y: 80 },
  { x: 22, y: 58 },
  { x: 38, y: 68 },
  { x: 58, y: 30 },
  { x: 74, y: 44 },
  { x: 94, y: 10 },
];

/**
 * Courbe décorative — évoque la croissance sans donner de vraies données
 * (contenu réel hors MVP). Trait et aire étirés en SVG (`preserveAspectRatio
 * none`), mais points posés en vues absolues : étirés avec le reste, ils
 * deviendraient des ellipses.
 */
function GrowthSparkline({ accent }: { accent: string }) {
  const line = SPARKLINE_POINTS.map((p) => `${p.x},${p.y}`).join(' L ');
  const first = SPARKLINE_POINTS[0];
  const last = SPARKLINE_POINTS[SPARKLINE_POINTS.length - 1];

  return (
    <View style={{ height: 76 }}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id="growth-area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={accent} stopOpacity={0.22} />
            <Stop offset="1" stopColor={accent} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path
          d={`M ${line} L ${last.x},100 L ${first.x},100 Z`}
          fill="url(#growth-area)"
        />
        <Path
          d={`M ${line}`}
          stroke={accent}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
      {SPARKLINE_POINTS.map((point) => (
        <View
          key={point.x}
          style={{
            position: 'absolute',
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: 9,
            height: 9,
            marginLeft: -4.5,
            marginTop: -4.5,
            borderRadius: 4.5,
            backgroundColor: accent,
            borderWidth: 2,
            borderColor: '#ffffff',
          }}
        />
      ))}
    </View>
  );
}

function SmallModuleCard({
  emoji,
  image,
  label,
  slug,
  waveColor,
  accent,
}: {
  emoji: string;
  /** Illustration à sa propre tuile, à la place de l'émoji. */
  image?: ImageSourcePropType;
  label: string;
  slug: BabyModuleSlug;
  waveColor: string;
  accent: string;
}) {
  return (
    <GlassCard
      accessibilityLabel={`Ouvrir le suivi ${label}`}
      accent={accent}
      onPress={() => openBabyModule(slug)}
      className="flex-1"
    >
      <CardWave id={`wave-${slug}`} color={waveColor} />
      <View className="flex-1 justify-between p-4">
        <IconTile
          emoji={emoji}
          image={image}
          imageFillsTile={Boolean(image)}
          tint={hexToRgba(accent, 0.12)}
          size={52}
        />
        <View className="flex-row items-center justify-between gap-2">
          <Text
            numberOfLines={1}
            className="flex-1 text-[17px] font-bold"
            style={{ color: TITLE_COLOR }}
          >
            {label}
          </Text>
          <ChevronBubble accent={accent} />
        </View>
      </View>
    </GlassCard>
  );
}

/**
 * Disposition en bento (Croissance haute à gauche, Biberon et Allaitement
 * empilés à droite, Bain & Soins en largeur), habillée en cartes de verre
 * dépoli à vague pastel, d'après une capture de référence (demande
 * explicite). Passée en `gridContent` à `PremiumLockedScreen`.
 */
function BabyModulesGrid({ accent }: { accent: string }) {
  return (
    <View className="gap-4">
      <View className="flex-row gap-3.5" style={{ minHeight: 270 }}>
        <GlassCard
          accessibilityLabel="Ouvrir le suivi Croissance"
          accent={accent}
          onPress={() => openBabyModule('croissance')}
          className="flex-1"
        >
          <CardWave
            id="wave-croissance"
            color={lightenHex(accent, 0.45)}
            height={44}
          />
          <View className="flex-1 gap-3 p-4">
            <View className="flex-row items-start justify-between">
              <IconTile
                emoji="📏"
                image={CROISSANCE_ICON}
                imageFillsTile
                tint={hexToRgba(accent, 0.14)}
              />
              <View
                className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                style={{ backgroundColor: 'rgba(232, 200, 116, 0.3)' }}
              >
                <Ionicons name="star" size={11} color={PREMIUM_GOLD} />
                <Text
                  className="text-[10.5px] font-bold"
                  style={{ color: PREMIUM_GOLD }}
                >
                  Premium
                </Text>
              </View>
            </View>

            <View className="gap-1">
              <Text
                className="text-[21px] font-extrabold"
                style={{ color: TITLE_COLOR, letterSpacing: -0.4 }}
              >
                Croissance
              </Text>
              <Text
                className="text-[12.5px] leading-4"
                style={{ color: BODY_COLOR }}
              >
                Poids, taille, périmètre crânien
              </Text>
            </View>

            <View className="mt-auto">
              <GrowthSparkline accent={accent} />
              <View className="mt-1 items-end">
                <ChevronBubble accent={accent} />
              </View>
            </View>
          </View>
        </GlassCard>

        <View className="flex-1 gap-3.5">
          <SmallModuleCard
            emoji="🍼"
            image={BIBERON_ICON}
            label="Biberon"
            slug="biberon"
            waveColor={WAVE_PEACH}
            accent={accent}
          />
          <SmallModuleCard
            emoji="🤱"
            image={ALLAITEMENT_ICON}
            label="Allaitement"
            slug="allaitement"
            waveColor={WAVE_PINK}
            accent={accent}
          />
        </View>
      </View>

      <GlassCard
        accessibilityLabel="Ouvrir le suivi Bain & Soins"
        accent={accent}
        onPress={() => openBabyModule('bain')}
      >
        <CardWave
          id="wave-bain"
          color={WAVE_MINT}
          secondColor={WAVE_SKY}
          height={40}
        />
        <View className="flex-row items-center gap-3.5 p-4">
          <IconTile
            emoji="🛁"
            image={BAIN_ICON}
            imageFillsTile
            tint="rgba(207, 224, 247, 0.7)"
          />
          <View className="flex-1 gap-0.5">
            <Text
              className="text-[17px] font-bold"
              style={{ color: TITLE_COLOR }}
            >
              Bain & Soins
            </Text>
            <Text
              className="text-[12.5px] leading-4"
              style={{ color: BODY_COLOR }}
            >
              Rituel du soir, température, produits
            </Text>
          </View>
          <ChevronBubble accent={accent} />
        </View>
      </GlassCard>

      <DashedLoopDoodle color={accent} />
    </View>
  );
}

/**
 * Écran d'accès « Votre bébé » (section 8 du design, hors MVP — voir
 * DOCS/versions/MVP.md : « écran d'accès affiché comme verrouillé, contenu
 * réel reporté à V1 »). Ouvert depuis la carte teaser du hub. Structure
 * partagée avec `/prenoms` — voir `PremiumLockedScreen` — mais en-tête
 * (`BabyHeader`) et grille (`BabyModulesGrid`) sur mesure ici.
 *
 * Les décorations (doodles, traits, vagues, chevrons) suivent la couleur
 * d'accent du thème actif, pour rester cohérentes avec le wallpaper décliné
 * par `useThemeBabyWallpaper`.
 */
export default function BabyScreen() {
  const wallpaper = useThemeBabyWallpaper();
  const accent = useThemeAccent();

  return (
    <PremiumLockedScreen
      title="Votre bébé"
      image={BABY_IMAGE}
      description={DESCRIPTION}
      paywallTitle="Débloquez le suivi complet de bébé"
      header={<BabyHeader accent={accent} />}
      gridContent={<BabyModulesGrid accent={accent} />}
      backgroundImage={wallpaper}
    />
  );
}

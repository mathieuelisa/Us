import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { PremiumLockedScreen } from '@/components/hub/premium-locked-screen';
import { CARD_SHADOW } from '@/features/hub/constants';

/**
 * Petit graphe décoratif — évoque la courbe de croissance sans donner de
 * vraies données (contenu réel hors MVP). Tracé statique, pas de valeurs.
 */
function GrowthSparkline() {
  return (
    <Svg width="100%" height={32} viewBox="0 0 100 36" fill="none">
      <Polyline
        points="2,28 22,20 42,24 62,8 82,14 98,4"
        stroke="#1f3d3a"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SmallModuleCard({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View
      style={CARD_SHADOW}
      className="flex-1 justify-between rounded-3xl bg-white p-3.5"
    >
      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#1f3d3a]/10">
        <Text className="text-[20px]">{emoji}</Text>
      </View>
      <Text className="text-[13px] font-semibold text-[#1a1a1a]">{label}</Text>
    </View>
  );
}

/**
 * Disposition en bento plutôt qu'en grille 2×2 uniforme (demande explicite,
 * inspirée d'une maquette fournie : « formation et placement des blocs »,
 * mêmes couleurs que le reste de l'écran d'accès — bordure `#1f3d3a`,
 * cadenas, icônes en cercle teinté). Passée en `gridContent` à
 * `PremiumLockedScreen`, qui sinon rendrait la grille uniforme par défaut
 * (utilisée telle quelle par `/prenoms`).
 */
function BabyModulesGrid() {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <View
          style={CARD_SHADOW}
          className="flex-1 justify-between gap-3 rounded-3xl bg-white p-4"
        >
          <View className="flex-row items-start justify-between">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#1f3d3a]/10">
              <Text className="text-[22px]">📏</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-[#e8c874]/15 px-2.5 py-1">
              <Ionicons name="star" size={11} color="#b8860b" />
              <Text className="text-[10px] font-semibold text-[#b8860b]">
                Premium
              </Text>
            </View>
          </View>

          <View className="gap-1">
            <Text className="text-[17px] font-bold text-[#1a1a1a]">
              Croissance
            </Text>
            <Text className="text-[12.5px] leading-4 text-[#6b6b6b]">
              Poids, taille, périmètre crânien
            </Text>
          </View>

          <GrowthSparkline />
        </View>

        <View className="flex-1 gap-3">
          <SmallModuleCard emoji="🍼" label="Biberon" />
          <SmallModuleCard emoji="🤱" label="Allaitement" />
        </View>
      </View>

      <View
        style={CARD_SHADOW}
        className="flex-row items-center gap-3.5 rounded-3xl bg-white p-4"
      >
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#1f3d3a]/10">
          <Text className="text-[24px]">🛁</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[15px] font-semibold text-[#1a1a1a]">
            Bain & Soins
          </Text>
          <Text className="text-[12.5px] leading-4 text-[#6b6b6b]">
            Rituel du soir, température, produits
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Écran d'accès « Votre bébé » (section 8 du design, hors MVP — voir
 * DOCS/versions/MVP.md : « écran d'accès affiché comme verrouillé, contenu
 * réel reporté à V1 »). Ouvert depuis la carte teaser du hub. Structure
 * partagée avec `/prenoms` — voir `PremiumLockedScreen` — sauf la grille,
 * en bento ici (`BabyModulesGrid`).
 */
export default function BabyScreen() {
  return (
    <PremiumLockedScreen
      title="Votre bébé"
      image={require('@/assets/images/Baby_said_hi.png')}
      description="Centralisez la croissance, les repas et le sommeil de bébé, et gardez votre co-parent connecté à chaque étape."
      paywallTitle="Débloquez le suivi complet de bébé"
      gridContent={<BabyModulesGrid />}
      backgroundImage={require('@/assets/images/Wallpaper_baby.png')}
    />
  );
}

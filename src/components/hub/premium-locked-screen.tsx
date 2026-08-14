import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router, useFocusEffect } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { PremiumPaywallModal } from '@/components/hub/premium-paywall-modal';
import { CARD_SHADOW } from '@/features/hub/constants';
import { useThemeBackground } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écran d'accès verrouillé partagé entre « Votre bébé » (`/bebe`) et « Le
 * match des prénoms » (`/prenoms`) — demande explicite d'« exactement le
 * même concept » pour les deux, donc factorisé plutôt que dupliqué : image +
 * description, grille 2×2 de catégories bordées, flou tant que le paywall
 * est ouvert, paywall qui se rouvre à chaque arrivée sur l'écran.
 *
 * Le flou n'est présent que tant que le paywall est ouvert (demande
 * explicite) : il s'ouvre automatiquement à l'arrivée sur l'écran, et le
 * fermer révèle la page nette en dessous.
 *
 * `useFocusEffect` plutôt que `useState(true)` seul : ces écrans vivent dans
 * le navigateur `Tabs` (`_layout.tsx`, `HUB_DESTINATIONS`), qui garde les
 * écrans montés une fois visités au lieu de les démonter en revenant au
 * hub — un simple état initial ne rouvrirait la modale qu'au tout premier
 * passage, jamais aux suivants.
 *
 * `modules` couvre la grille 2×2 uniforme par défaut (`/prenoms`) ;
 * `gridContent` la remplace entièrement pour une disposition sur mesure
 * (bento de `/bebe`, demande explicite « inspire-toi de ça pour la
 * formation et le placement des blocs » — mêmes couleurs, agencement
 * différent).
 *
 * `backgroundImage` optionnel : remplace le fond pastel du thème par un
 * wallpaper (demande explicite pour `/bebe` uniquement — `/prenoms` garde
 * `useThemeBackground`).
 */
export function PremiumLockedScreen({
  title,
  image,
  description,
  paywallTitle,
  modules,
  gridContent,
  backgroundImage,
}: {
  title: string;
  image: ImageSourcePropType;
  description: string;
  paywallTitle: string;
  modules?: { emoji: string; label: string }[];
  gridContent?: ReactNode;
  backgroundImage?: ImageSourcePropType;
}) {
  const backgroundColor = useThemeBackground();
  const [isPaywallVisible, setIsPaywallVisible] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsPaywallVisible(true);
    }, []),
  );

  const content = (
    <>
      <ScrollView
        contentContainerClassName="gap-5 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Revenir en arrière"
          accessibilityRole="button"
          hitSlop={12}
          style={CARD_SHADOW}
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
        </Pressable>

        <Text className="text-[24px] font-bold text-[#1a1a1a]">{title}</Text>

        <View className="items-center gap-2 px-4">
          <Image source={image} className="h-30 w-20" resizeMode="contain" />
          <Text className="text-center text-[13.5px] leading-5 text-[#6b6b6b]">
            {description}
          </Text>
        </View>

        {gridContent ?? (
          <View className="flex-row flex-wrap gap-3">
            {modules?.map((module) => (
              <View
                key={module.label}
                style={CARD_SHADOW}
                className="aspect-square w-[47%] items-center justify-center gap-2.5 rounded-3xl bg-white px-3 py-4"
              >
                <Ionicons
                  name="lock-closed"
                  size={13}
                  color="#1f3d3a"
                  style={{ position: 'absolute', top: 12, right: 12 }}
                />

                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#1f3d3a]/10">
                  <Text className="text-[28px]">{module.emoji}</Text>
                </View>
                <Text className="text-[14px] font-semibold text-[#1a1a1a]">
                  {module.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {isPaywallVisible ? (
        <BlurView
          intensity={45}
          tint="light"
          pointerEvents="none"
          className="absolute inset-0"
        />
      ) : null}
    </>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: backgroundImage ? undefined : backgroundColor }}
    >
      {backgroundImage ? (
        <ImageBackground
          source={backgroundImage}
          resizeMode="cover"
          className="flex-1"
        >
          {content}
        </ImageBackground>
      ) : (
        <View className="flex-1">{content}</View>
      )}

      <PremiumPaywallModal
        visible={isPaywallVisible}
        onClose={() => setIsPaywallVisible(false)}
        title={paywallTitle}
        image={image}
      />
    </SafeAreaView>
  );
}

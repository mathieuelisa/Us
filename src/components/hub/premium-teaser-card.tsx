import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CARD_SHADOW } from '@/features/hub/constants';

/**
 * Carte teaser des fonctionnalités premium (paiement hors MVP) — partagée
 * entre « Votre bébé » (hub) et « Le match des prénoms » (Organisation &
 * Préparation), pour que le langage visuel du verrouillage reste cohérent
 * dans toute l'app. Design volontairement sobre — pas de bordure ni de
 * pavé de couleur épais, juste un cercle décoratif vert clair discret —
 * tout en restant reconnaissable au milieu des cartes blanches (demande
 * explicite).
 *
 * `onPress` optionnel : « Le match des prénoms » reste une simple vitrine
 * (jeu pas encore implémenté), alors que « Votre bébé » ouvre l'écran
 * d'accès verrouillé (`/bebe`, demande explicite) — MVP.md prévoit cet
 * écran d'accès même si le contenu réel est hors périmètre.
 */
export function PremiumTeaserCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={CARD_SHADOW}
      className="flex-row items-center gap-3.5 overflow-hidden rounded-2xl bg-[#1f3d3a] px-4 py-4"
    >
      <View
        pointerEvents="none"
        className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#6fae9c]/25"
      />

      <View className="h-11 w-11 items-center justify-center rounded-full bg-[#e8c874]/15">
        {icon}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-[16px] font-semibold text-white">{title}</Text>
        <Text className="text-[13px] text-[#9fb6b2]">{subtitle}</Text>
      </View>

      <View className="flex-row items-center gap-1">
        <Ionicons name="lock-closed" size={12} color="#e8c874" />
        <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#e8c874]">
          Premium
        </Text>
      </View>
    </Container>
  );
}

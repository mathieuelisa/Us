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
  illustration,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;
  /**
   * Variante « vedette » (« Le match des prénoms », capture de référence) :
   * remplace la pastille d'icône par une illustration plus grande, agrandit
   * la carte et pose « Premium » dans une gélule. Sans elle, la carte garde
   * son gabarit sobre (« Votre bébé » sur le hub).
   */
  illustration?: ReactNode;
}) {
  const Container = onPress ? Pressable : View;
  const isFeatured = Boolean(illustration);

  return (
    <Container
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={
        isFeatured
          ? {
              shadowColor: '#1f3d3a',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 6,
            }
          : CARD_SHADOW
      }
      className={`flex-row items-center overflow-hidden bg-[#1f3d3a] ${
        isFeatured
          ? 'gap-3 rounded-[28px] py-4 pl-3 pr-3.5'
          : 'gap-3.5 rounded-2xl px-4 py-4'
      }`}
    >
      <View
        pointerEvents="none"
        className={
          isFeatured
            ? 'absolute -right-10 -top-10 h-48 w-40 rounded-full bg-[#6fae9c]/25'
            : 'absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#6fae9c]/25'
        }
      />

      {isFeatured ? (
        illustration
      ) : (
        <View className="h-11 w-11 items-center justify-center rounded-full bg-[#e8c874]/15">
          {icon}
        </View>
      )}

      <View className="flex-1 gap-0.5">
        <Text
          className={`font-semibold text-white ${
            isFeatured ? 'text-[17px] font-bold' : 'text-[16px]'
          }`}
        >
          {title}
        </Text>
        <Text className="text-[13px] text-[#9fb6b2]">{subtitle}</Text>
      </View>

      <View
        className={`flex-row items-center gap-1 ${
          isFeatured ? 'rounded-full bg-black/20 px-2.5 py-1.5' : ''
        }`}
      >
        <Ionicons
          name="lock-closed"
          size={isFeatured ? 13 : 12}
          color="#e8c874"
        />
        <Text className="text-[10px] font-semibold uppercase tracking-wide text-[#e8c874]">
          Premium
        </Text>
      </View>
    </Container>
  );
}

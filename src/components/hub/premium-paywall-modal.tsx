import { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { PREMIUM_FEATURES } from '@/components/onboarding/paywall-modal';

/**
 * Paywall des écrans d'accès premium (`/bebe`, `/prenoms`) — variante
 * centrée du `PaywallModal` de l'onboarding (qui, lui, glisse depuis le
 * bas) : demande explicite d'une « modale centrale » avec un bouton dédié
 * pour la fermer, plutôt qu'un lien texte « Plus tard ». Fond `#1f3d3a`
 * (demande explicite) : même vert que `PremiumTeaserCard`, pour un langage
 * visuel premium cohérent entre les cartes teaser et leurs paywalls.
 * S'ouvre automatiquement à l'arrivée sur l'écran.
 *
 * `title`/`image` varient par écran (demande explicite « exactement le même
 * concept » pour « Le match des prénoms » que pour « Votre bébé ») ; la
 * liste de fonctionnalités reste la même partout — un seul paiement
 * débloque tout le bundle premium, pas une fonctionnalité isolée.
 */
export function PremiumPaywallModal({
  visible,
  onClose,
  title,
  image,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  image: ImageSourcePropType;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-h-[85%] rounded-3xl bg-[#1f3d3a] px-6 pb-6 pt-5">
          <Pressable
            accessibilityLabel="Fermer"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}
            className="absolute right-4 top-4 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/10"
          >
            <Ionicons name="close" size={18} color="#fff" />
          </Pressable>

          <View className="items-center gap-2 pt-2">
            <Image source={image} className="h-30 w-20" resizeMode="contain" />
            <Text className="text-center text-[22px] font-bold leading-7 text-white">
              {title}
            </Text>
            <Text className="text-[14px] text-[#b0b0b0]">
              Un seul paiement, accès à vie
            </Text>
          </View>

          <ScrollView
            className="mt-4"
            contentContainerClassName="gap-3 pb-2"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-1 rounded-[14px] border border-[#e8c874] px-4 py-4">
              <Text className="text-[18px] font-bold text-[#e8c874]">
                14,99 € — paiement unique
              </Text>
              <Text className="text-[13px] text-[#b0b0b0]">
                Pas d’abonnement, pas de renouvellement
              </Text>
            </View>

            {PREMIUM_FEATURES.map((feature) => (
              <View key={feature} className="flex-row gap-2.5">
                <Text className="text-[14px] text-[#e8c874]">✓</Text>
                <Text className="flex-1 text-[14px] leading-5 text-[#e0e0e0]">
                  {feature}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View className="mt-2 items-center rounded-full bg-[#191818] py-3.5">
            <Text className="text-[15px] font-medium text-[#e8c874]">
              Débloquer — bientôt disponible
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

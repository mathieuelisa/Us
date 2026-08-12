import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';

const PREMIUM_FEATURES = [
  'Match des Prénoms Duo',
  'Assistant Contractions & Départ Maternité',
  "Suivi Nutrition & Rythmes (Journal d'allaitement, biberons & statistiques)",
  'Suivi du rythme de sommeil de bébé',
  'Carnet de Croissance (Courbes poids/taille)',
  'Journal de Sommeil, Bain & Soins du quotidien',
  'Espace Santé & Calendrier des Rappels Vaccinaux',
];

/**
 * Écran 1g — paywall, en pop-up (demande explicite) plutôt qu'en route à
 * part entière. Ouvert depuis la réassurance (`reassurance.tsx`), fermé
 * (« Plus tard » ou geste de fermeture) vers la même suite que prévue.
 *
 * Affiché tel quel mais **non fonctionnel** : le MVP ne contient ni
 * paiement ni module « Votre bébé » (cf. DOCS/versions/MVP.md). Le bouton
 * « Débloquer » est donc désactivé et annoncé comme bientôt disponible ;
 * l'intégration réelle (RevenueCat) arrive en Phase 3.
 */
export function PaywallModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="max-h-[92%] rounded-t-3xl bg-[#194522] px-7 pb-8 pt-4">
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-[#3a3a3a]" />

          <View className="gap-2 items-center">
            <Image
              source={require('@/assets/images/Baby_said_hi.png')}
              className="w-20 h-30"
              resizeMode="contain"
            />
            <Text className="text-[24px] font-bold leading-7 text-white">
              Débloquez le suivi complet de bébé
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

          <View className="gap-3 pt-2">
            <View className="items-center rounded-full bg-[#3a3a3a] py-3.5">
              <Text className="text-[15px] font-medium text-[#8a8a8a]">
                Débloquer — bientôt disponible
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              className="items-center py-2"
              onPress={onClose}
            >
              <Text className="text-[15px] font-medium text-white">
                Plus tard
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

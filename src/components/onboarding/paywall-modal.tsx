import { Ionicons } from '@expo/vector-icons';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

export const PREMIUM_FEATURES = [
  'premium.features.names',
  'premium.features.contractions',
  'premium.features.feeding',
  'premium.features.sleepRhythm',
  'premium.features.growth',
  'premium.features.dailyCare',
  'premium.features.vaccines',
] as const;

/**
 * Écran 1g — paywall, en pop-up (demande explicite) plutôt qu'en route à
 * part entière. Ouvert depuis la réassurance (`reassurance.tsx`), fermé
 * (« Plus tard » ou geste de fermeture) vers la même suite que prévue.
 *
 * Le bouton « Débloquer » reste **inerte** ici : le premium est porté par
 * le foyer, et le foyer n'existe qu'à la fin de l'onboarding
 * (`finalisation`). L'achat (Stripe, dans l'app) se fait ensuite depuis
 * l'entrée « Premium » ou les paywalls des écrans premium.
 *
 * `animationType="none"` sur `Modal` (demande explicite) : le fond opaque
 * doit apparaître d'un coup, sans glisser avec le reste — seule la carte
 * anime (`SlideInDown`/`SlideOutDown`, Reanimated). `animationType="slide"`
 * faisait remonter le voile noir en même temps que la feuille, ce qui
 * donnait un balayage de bas en haut au lieu d'un assombrissement net.
 * Même mécanique que `HowItWorksModal` et `ConfirmBirthModal` — les trois
 * feuilles basses de l'app s'ouvrent désormais pareil. `Modal` démonte
 * réellement ses enfants quand `visible` repasse à `false`, donc
 * l'animation d'entrée se rejoue bien à chaque ouverture.
 */
export function PaywallModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Le foyer n'existe pas encore : c'est le choix de l'étape 1 qui dit s'il
  // y a un partenaire. « Seul·e » : rien à préciser.
  const { accompanimentType } = useAtomValue(onboardingDraftAtom);
  const hasPartner = accompanimentType !== 'seul';
  return (
    <Modal
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="max-h-[92%] rounded-t-3xl bg-[#1f3d3a] px-7 pt-4"
          style={{ paddingBottom: 32 + insets.bottom }}
        >
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-[#3a3a3a]" />

          <View className="gap-2 items-center">
            <Image
              source={require('@/assets/images/Baby_walking.png')}
              className="w-20 h-30"
              resizeMode="contain"
            />
            <Text className="text-[24px] font-bold leading-7 text-white">
              {t('premium.paywall.title')}
            </Text>
            <Text className="text-[14px] text-[#b0b0b0]">
              {t('premium.paywall.oneTime')}
            </Text>
          </View>

          <ScrollView
            className="mt-4"
            contentContainerClassName="gap-3 pb-2"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-1 rounded-[14px] border border-[#e8c874] px-4 py-4">
              <Text className="text-[18px] font-bold text-[#e8c874]">
                {t('premium.paywall.price')}
              </Text>
              <Text className="text-[13px] text-[#b0b0b0]">
                {t('premium.paywall.noSubscription')}
              </Text>
              {/* Un seul achat pour le foyer (demande explicite). */}
              {hasPartner ? (
                <View className="mt-2.5 flex-row items-center gap-2.5 border-t border-[#e8c874]/30 pt-2.5">
                  <Ionicons name="people" size={16} color="#e8c874" />
                  <Text className="flex-1 text-[13px] leading-[18px] text-[#e0e0e0]">
                    <Text className="font-bold text-[#e8c874]">
                      {t('premium.paywall.forBoth')}
                    </Text>
                    {t('premium.paywall.partnerFree')}
                  </Text>
                </View>
              ) : null}
            </View>

            {PREMIUM_FEATURES.map((feature) => (
              <View key={feature} className="flex-row gap-2.5">
                <Text className="text-[14px] text-[#e8c874]">✓</Text>
                <Text className="flex-1 text-[14px] leading-5 text-[#e0e0e0]">
                  {t(feature)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View className="gap-3 pt-2">
            <View className="items-center rounded-full bg-[#191818] py-3.5">
              <Text className="text-[15px] font-medium text-[#e8c874]">
                {t('premium.paywall.unlockLater')}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              className="items-center py-2"
              onPress={onClose}
            >
              <Text className="text-[15px] font-medium text-white">
                {t('premium.paywall.later')}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { PREMIUM_FEATURES } from '@/components/onboarding/paywall-modal';
import { CARD_SHADOW } from '@/features/hub/constants';
import { useThemeBackground } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

// Or plus soutenu que l'accent premium habituel (`#e8c874`) : celui-ci reste
// lisible sur fond blanc/pastel, alors que la teinte plus claire est pensée
// pour un fond sombre (cf. `PremiumTeaserCard`, `AppTabBar`).
const PREMIUM_GOLD_ON_LIGHT = '#b8860b';

/**
 * Page premium ouverte depuis l'icône dédiée de la barre de navigation
 * (`AppTabBar`) — page simple dans le groupe `(tabs)`, pas de `Modal`
 * (demande explicite) : la barre reste visible et utilisable pendant sa
 * consultation, comme les autres destinations du hub (`organisation`,
 * `sante`…).
 *
 * Fond pastel du thème actif (`useThemeBackground`, demande explicite)
 * plutôt que le vert sombre du paywall onboarding (`PaywallModal`) : ce
 * dernier reste un pop-up isolé, alors qu'ici la démarcation entre une page
 * plein écran sombre et le fond clair du reste de l'app (barre de nav
 * comprise) créait une coupure visuelle disgracieuse. Seuls le CTA et
 * quelques accents gardent la touche « premium » (or), le reste suit la
 * palette claire commune aux autres écrans du hub.
 */
export default function PremiumScreen() {
  const router = useRouter();
  const backgroundColor = useThemeBackground();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView
        contentContainerClassName="gap-3 px-6 pb-10 pt-4"
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

        <View className="items-center gap-2">
          <Image
            source={require('@/assets/images/Baby_said_hi.png')}
            className="w-20 h-30"
            resizeMode="contain"
          />
          <Text className="text-center text-[24px] font-bold leading-7 text-[#1a1a1a]">
            Débloquez le suivi complet de bébé
          </Text>
          <Text className="text-[14px] text-[#6b6b6b]">
            Un seul paiement, accès à vie
          </Text>
        </View>

        <View className="mt-2 gap-3">
          <View
            style={CARD_SHADOW}
            className="gap-1 rounded-2xl bg-white px-4 py-4"
          >
            <Text
              className="text-[18px] font-bold"
              style={{ color: PREMIUM_GOLD_ON_LIGHT }}
            >
              14,99 € — paiement unique
            </Text>
            <Text className="text-[13px] text-[#6b6b6b]">
              Pas d’abonnement, pas de renouvellement
            </Text>
          </View>

          <View style={CARD_SHADOW} className="gap-3 rounded-2xl bg-white p-4">
            {PREMIUM_FEATURES.map((feature) => (
              <View key={feature} className="flex-row gap-2.5">
                <Text
                  className="text-[14px]"
                  style={{ color: PREMIUM_GOLD_ON_LIGHT }}
                >
                  ✓
                </Text>
                <Text className="flex-1 text-[14px] leading-5 text-[#3d3d3d]">
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-2 items-center rounded-full bg-[#191818] py-3.5">
          <Text className="text-[15px] font-medium text-[#e8c874]">
            Débloquer — bientôt disponible
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

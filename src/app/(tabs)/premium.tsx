import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { PremiumBenefits } from '@/components/hub/premium-benefits';
import { PremiumOffer } from '@/components/hub/premium-offer';
import { useTabBarContentInset } from '@/components/navigation/use-tab-bar-height';
import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useIsSoloHousehold } from '@/features/household/hooks';
import { useIsPremium } from '@/features/premium/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Page premium ouverte depuis l'icône dédiée de la barre de navigation
 * (`AppTabBar`) — page simple dans le groupe `(tabs)`, pas de `Modal`
 * (demande explicite) : la barre reste visible et utilisable pendant sa
 * consultation, comme les autres destinations du hub (`organisation`,
 * `sante`…).
 *
 * Fond pastel du thème actif (`useThemeBackground`). Le contenu est le même
 * que le paywall des écrans d'accès (`PremiumOffer`, demande explicite que
 * les deux correspondent), posé dans une carte blanche arrondie sous le
 * bouton retour, au gabarit `compact` pour tenir sans défiler au-dessus de
 * la barre de navigation (demande explicite).
 *
 * Foyer premium : l'offre ne sert plus à rien (demande explicite du
 * 2026-11-15). La page devient « Vos avantages Premium »
 * (`PremiumBenefits`, d'après une maquette).
 */
export default function PremiumScreen() {
  const { t } = useTranslation();
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const router = useRouter();
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();
  const { isPremium, isLoading } = useIsPremium();
  const isSolo = useIsSoloHousehold();

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-3 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel={t('common.goBack')}
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <Ionicons name="chevron-back" size={22} color={GLASS_TITLE_COLOR} />
        </Pressable>

        {isLoading ? null : isPremium ? (
          <PremiumBenefits accent={accent} isSolo={isSolo} />
        ) : (
          <View
            className="gap-3 rounded-[32px] px-4 pb-4 pt-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.95)',
              shadowColor: accent,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.1,
              shadowRadius: 24,
              elevation: 4,
            }}
          >
            <PremiumOffer
              title={t('premium.paywall.title')}
              image={require('@/assets/images/Baby_said_hi.png')}
              compact
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

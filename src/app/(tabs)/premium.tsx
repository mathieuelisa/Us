import { Ionicons } from '@expo/vector-icons';
import { router, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { PremiumOffer } from '@/components/hub/premium-offer';
import { PremiumTeaserCard } from '@/components/hub/premium-teaser-card';
import { useTabBarContentInset } from '@/components/navigation/use-tab-bar-height';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useIsSoloHousehold } from '@/features/household/hooks';
import { useIsPremium } from '@/features/premium/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

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
 * 2026-11-15). La page liste alors les fonctionnalités débloquées, chacune
 * ouvrant son écran.
 */
export default function PremiumScreen() {
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
          accessibilityLabel="Revenir en arrière"
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
          <PremiumFeatures accent={accent} isSolo={isSolo} />
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
              title="Débloquez le suivi complet de bébé"
              image={require('@/assets/images/Baby_said_hi.png')}
              compact
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Fonctionnalités premium débloquées, chacune ouvrant son écran — mêmes
 * cartes que sur le hub et dans Organisation (`PremiumTeaserCard`, cadenas
 * ouvert pour un foyer premium).
 */
function PremiumFeatures({
  accent,
  isSolo,
}: {
  accent: string;
  isSolo: boolean;
}) {
  return (
    <View className="gap-3">
      <View
        className="flex-row items-center gap-3 rounded-[28px] p-4"
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
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: hexToRgba(accent, 0.14) }}
        >
          <Ionicons name="diamond-outline" size={22} color={accent} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text
            className="text-[18px] font-extrabold"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
          >
            Premium actif
          </Text>
          <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
            {isSolo
              ? 'Tout est débloqué. Merci de votre confiance !'
              : 'Tout est débloqué pour vous deux. Merci de votre confiance !'}
          </Text>
        </View>
      </View>

      <PremiumTeaserCard
        icon={
          <Image
            source={require('@/assets/images/Baby_head.png')}
            className="h-7 w-6"
            resizeMode="contain"
          />
        }
        title="Votre bébé"
        subtitle="Croissance, biberons, allaitement, sommeil"
        onPress={() => router.push('/bebe')}
      />
      <PremiumTeaserCard
        icon={
          <Image
            source={require('@/assets/images/Heart_girls_boys.png')}
            className="h-7 w-7"
            resizeMode="contain"
          />
        }
        title="Le match des prénoms"
        subtitle={
          isSolo
            ? 'Trouvez le prénom parfait'
            : 'Trouvez le prénom parfait à deux'
        }
        onPress={() => router.push('/prenoms')}
      />
      <PremiumTeaserCard
        icon={<Ionicons name="timer-outline" size={22} color="#e8c874" />}
        title="Assistant contractions"
        subtitle="Chronométrez, on vous dit quand partir"
        onPress={() => router.push('/contractions')}
      />
    </View>
  );
}

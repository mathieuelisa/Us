import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { useThemeBackground } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

type LegalDoc = 'privacy' | 'terms' | 'legal-notice';

const LEGAL_DOCS: Record<LegalDoc, { title: string }> = {
  privacy: { title: 'Politique de confidentialité' },
  terms: { title: "Conditions d'utilisation" },
  'legal-notice': { title: 'Mentions légales' },
};

/**
 * Écran 10a — sous-section CONFIDENTIALITÉ des Réglages. Un seul écran
 * générique pour les 3 documents plutôt que 3 routes quasi identiques.
 *
 * ⚠️ Contenu réel jamais rédigé (ni politique de confidentialité, ni CGU,
 * ni mentions légales) — c'est le point bloquant n°3 de
 * DOCS/05-DETTE-ET-POINTS-OUVERTS.md (consentement RGPD explicite), pas
 * quelque chose à improviser ici sans validation juridique.
 */
export default function LegalScreen() {
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const backgroundColor = useThemeBackground();

  const entry = LEGAL_DOCS[doc as LegalDoc];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 gap-3 px-6 pt-4">
        {router.canGoBack() ? (
          <Pressable
            accessibilityLabel="Revenir en arrière"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
            className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-[17px] leading-[20px] text-[#1a1a1a]">‹</Text>
          </Pressable>
        ) : null}

        <Text className="text-[26px] font-bold text-[#1a1a1a]">
          {entry?.title ?? 'Document'}
        </Text>
        <Text className="text-[15px] leading-5 text-[#6b6b6b]">
          Ce document n'a pas encore été rédigé. Il sera ajouté avant la mise en
          production de l'application.
        </Text>
      </View>
    </SafeAreaView>
  );
}

import { Button } from 'heroui-native';
import { useAtom, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { useSubmitOnboarding } from '@/features/onboarding/hooks';
import { useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import {
  devBypassAccompanimentTypeAtom,
  devBypassAtom,
  devBypassFirstNameAtom,
} from '@/lib/atoms/dev-bypass';
import {
  EMPTY_ONBOARDING_DRAFT,
  onboardingDraftAtom,
} from '@/lib/atoms/onboarding';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écran 2a — transition de fin d'onboarding. C'est ici, et seulement ici,
 * que tout le brouillon est écrit en base (cf. §1.2 du plan d'action).
 * Une fois le foyer créé, le routage racine bascule tout seul vers le hub :
 * cet écran n'a pas besoin de naviguer lui-même.
 */
export default function FinalisationScreen() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);
  const submitOnboarding = useSubmitOnboarding();
  const backgroundColor = useThemeBackground();

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
  const [devBypass, setDevBypass] = useAtom(devBypassAtom);
  const setDevBypassFirstName = useSetAtom(devBypassFirstNameAtom);
  const setDevBypassAccompanimentType = useSetAtom(
    devBypassAccompanimentTypeAtom,
  );

  const hasSubmitted = useRef(false);
  const { mutate } = submitOnboarding;

  useEffect(() => {
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    // ⚠️ TEMPORAIRE : sans utilisateur réel, l'écriture échouerait. On passe
    // directement au hub pour que le parcours reste explorable de bout en
    // bout tant que la connexion n'aboutit pas. Le prénom (le sien, jamais
    // celui du co-parent) est conservé à part, sans quoi la salutation du
    // hub resterait vide une fois le brouillon effacé juste après.
    if (devBypass === 'onboarding') {
      setDevBypassFirstName(draft.firstName.trim());
      setDevBypassAccompanimentType(draft.accompanimentType ?? '');
      setDraft(EMPTY_ONBOARDING_DRAFT);
      setDevBypass('app');
      return;
    }

    mutate(
      {
        draft,
        partnerEmail: draft.partnerEmail.trim() || null,
      },
      { onSuccess: () => setDraft(EMPTY_ONBOARDING_DRAFT) },
    );
  }, [
    mutate,
    draft,
    setDraft,
    devBypass,
    setDevBypass,
    setDevBypassFirstName,
    setDevBypassAccompanimentType,
  ]);

  const retry = () => {
    submitOnboarding.mutate(
      { draft, partnerEmail: draft.partnerEmail.trim() || null },
      { onSuccess: () => setDraft(EMPTY_ONBOARDING_DRAFT) },
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 items-center justify-center gap-4 px-7">
        {submitOnboarding.isError ? (
          <>
            <Text className="text-center text-[18px] font-bold text-[#1a1a1a]">
              La création de votre espace a échoué
            </Text>
            <Text className="text-center text-[14px] leading-5 text-[#6b6b6b]">
              Vos réponses sont conservées. Vérifiez votre connexion, puis
              réessayez.
            </Text>
            <Button
              isDisabled={submitOnboarding.isPending}
              onPress={retry}
              className="w-full"
            >
              <Button.Label>Réessayer</Button.Label>
            </Button>
          </>
        ) : (
          <>
            <ActivityIndicator color="#2D5E5A" size="large" />
            <Text className="text-center text-[16px] font-medium text-[#1a1a1a]">
              Nous préparons votre espace…
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

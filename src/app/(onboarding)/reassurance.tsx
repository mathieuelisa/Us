import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { PaywallModal } from '@/components/onboarding/paywall-modal';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { shouldInvitePartner } from '@/features/onboarding/constants';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

/** Écran 1y — réassurance sociale, hors parcours numéroté. */
export default function ReassuranceStep() {
  const draft = useAtomValue(onboardingDraftAtom);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Fermer le paywall (demande explicite : c'est une pop-up, pas une route)
  // continue exactement où l'ancienne route menait.
  const closePaywallAndContinue = () => {
    setIsPaywallOpen(false);
    const nextRoute = shouldInvitePartner(
      draft.accompanimentType,
      draft.partnerUsesApp,
    )
      ? '/invitation'
      : '/finalisation';
    router.push(nextRoute);
  };

  return (
    <>
      <OnboardingStepShell
        step={null}
        centered
        title="Vous avez fait le bon choix"
        subtitle="Des milliers de parents utilisent déjà US pour vivre cette étape sereinement"
        primaryLabel="Suivant"
        onPrimaryPress={() => setIsPaywallOpen(true)}
      >
        <View className="items-center gap-6">
          <Text className="text-[52px]">🎉</Text>

          <View className="flex-row items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5">
            <Text className="text-[13px] font-medium text-accent-foreground">
              ✓ Configuration terminée
            </Text>
          </View>

          <View className="flex-row gap-4">
            <View className="flex-1 items-center gap-1 rounded-[14px] bg-[#f4f4f4] px-4 py-5">
              <Text className="text-[20px] font-bold text-accent">50 000+</Text>
              <Text className="text-[13px] text-[#6b6b6b]">
                Téléchargements
              </Text>
            </View>
            <View className="flex-1 items-center gap-1 rounded-[14px] bg-[#f4f4f4] px-4 py-5">
              <Text className="text-[20px] font-bold text-accent">4,8 ★</Text>
              <Text className="text-[13px] text-[#6b6b6b]">Note moyenne</Text>
            </View>
          </View>
        </View>
      </OnboardingStepShell>

      <PaywallModal visible={isPaywallOpen} onClose={closePaywallAndContinue} />
    </>
  );
}

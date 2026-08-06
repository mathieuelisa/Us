import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { OnboardingStepShell } from '@/components/onboarding/step-shell';

/** Écran 1y — réassurance sociale, hors parcours numéroté. */
export default function ReassuranceStep() {
  return (
    <OnboardingStepShell
      step={null}
      title="Vous avez fait le bon choix"
      subtitle="Des milliers de parents utilisent déjà US pour vivre cette étape sereinement"
      primaryLabel="Continuer"
      onPrimaryPress={() => router.push('/paywall')}
    >
      <View className="items-center gap-6 pt-6">
        <Text className="text-[52px]">🎉</Text>

        <View className="flex-row gap-4">
          <View className="flex-1 items-center gap-1 rounded-[14px] bg-[#f4f4f4] px-4 py-5">
            <Text className="text-[20px] font-bold text-accent">50 000+</Text>
            <Text className="text-[13px] text-[#6b6b6b]">Téléchargements</Text>
          </View>
          <View className="flex-1 items-center gap-1 rounded-[14px] bg-[#f4f4f4] px-4 py-5">
            <Text className="text-[20px] font-bold text-accent">4,8 ★</Text>
            <Text className="text-[13px] text-[#6b6b6b]">Note moyenne</Text>
          </View>
        </View>
      </View>
    </OnboardingStepShell>
  );
}

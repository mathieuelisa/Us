import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { Text, View } from 'react-native';

import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { YesNoChoice } from '@/components/onboarding/yes-no-choice';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

/** Écran 1b — Étape 3/6, arrivée du bébé. */
export default function BabyArrivalStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);

  return (
    <OnboardingStepShell
      step={3}
      title="Quand votre bébé arrive-t-il ?"
      primaryLabel="Suivant"
      isPrimaryDisabled={draft.dueDate === null || draft.isFirstChild === null}
      onPrimaryPress={() => router.push('/statut')}
    >
      <View className="gap-2.5">
        <Text className="text-[14px] font-medium text-[#1a1a1a]">
          Date de naissance prévue ou réelle
        </Text>
        <WheelDatePicker
          value={draft.dueDate}
          onChange={(dueDate) =>
            setDraft((current) => ({ ...current, dueDate }))
          }
        />
      </View>

      <View className="gap-2.5 pt-4">
        <Text className="text-[14px] font-medium text-[#1a1a1a]">
          Est-ce votre premier enfant ?
        </Text>
        <YesNoChoice
          value={draft.isFirstChild}
          onChange={(isFirstChild) =>
            setDraft((current) => ({ ...current, isFirstChild }))
          }
        />
      </View>
    </OnboardingStepShell>
  );
}

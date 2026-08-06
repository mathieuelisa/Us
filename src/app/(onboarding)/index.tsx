import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { Text, View } from 'react-native';

import { ChoiceCard } from '@/components/onboarding/choice-card';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { YesNoChoice } from '@/components/onboarding/yes-no-choice';
import {
  ACCOMPANIMENT_OPTIONS,
  type AccompanimentType,
} from '@/features/onboarding/constants';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

/** Écran 1d — Étape 1/6, mode d'accompagnement. */
export default function AccompanimentStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);

  const selectAccompaniment = (accompanimentType: AccompanimentType) =>
    setDraft((current) => ({ ...current, accompanimentType }));

  return (
    <OnboardingStepShell
      step={1}
      title="Qui vous accompagne dans cette aventure ?"
      primaryLabel="Continuer"
      isPrimaryDisabled={draft.accompanimentType === null}
      onPrimaryPress={() => router.push('/prenoms')}
    >
      {ACCOMPANIMENT_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          label={option.label}
          isSelected={draft.accompanimentType === option.value}
          onPress={() => selectAccompaniment(option.value)}
        />
      ))}

      <View className="gap-2.5 pt-4">
        <Text className="text-[14px] font-medium text-[#1a1a1a]">
          Le co-parent utilisera-t-il aussi l’app ?
        </Text>
        <YesNoChoice
          value={draft.partnerUsesApp}
          onChange={(partnerUsesApp) =>
            setDraft((current) => ({ ...current, partnerUsesApp }))
          }
        />
      </View>
    </OnboardingStepShell>
  );
}

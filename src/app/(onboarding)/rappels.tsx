import { router } from 'expo-router';
import { useAtom } from 'jotai';

import { ChoiceCard } from '@/components/onboarding/choice-card';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { REMINDER_OPTIONS } from '@/features/onboarding/constants';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

/** Écran 1f — Étape 6/6, rythme des rappels. */
export default function RemindersStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);

  return (
    <OnboardingStepShell
      step={6}
      title="Quel rythme de rappels préférez-vous ?"
      primaryLabel="Terminer"
      isPrimaryDisabled={draft.reminderFrequency === null}
      onPrimaryPress={() => router.push('/reassurance')}
    >
      {REMINDER_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          label={option.label}
          description={option.description}
          isSelected={draft.reminderFrequency === option.value}
          onPress={() =>
            setDraft((current) => ({
              ...current,
              reminderFrequency: option.value,
            }))
          }
        />
      ))}
    </OnboardingStepShell>
  );
}

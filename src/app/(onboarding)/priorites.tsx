import { router } from 'expo-router';
import { useAtom } from 'jotai';

import { ChoiceCard } from '@/components/onboarding/choice-card';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { PRIORITY_OPTIONS } from '@/features/onboarding/constants';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

/** Écran 1e — Étape 5/6, priorités (choix multiple). */
export default function PrioritiesStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);

  const togglePriority = (value: string) =>
    setDraft((current) => ({
      ...current,
      priorities: current.priorities.includes(value)
        ? current.priorities.filter((priority) => priority !== value)
        : [...current.priorities, value],
    }));

  return (
    <OnboardingStepShell
      step={5}
      title="Quelles sont vos priorités ?"
      subtitle="Plusieurs choix possibles"
      primaryLabel="Suivant"
      isPrimaryDisabled={draft.priorities.length === 0}
      onPrimaryPress={() => router.push('/rappels')}
    >
      {PRIORITY_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          label={option.label}
          isSelected={draft.priorities.includes(option.value)}
          onPress={() => togglePriority(option.value)}
        />
      ))}
    </OnboardingStepShell>
  );
}

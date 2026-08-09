import { router } from 'expo-router';
import { useAtom } from 'jotai';

import { ChoiceCard } from '@/components/onboarding/choice-card';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { PROFESSIONAL_STATUS_OPTIONS } from '@/features/onboarding/constants';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

/** Écran 1c — Étape 4/6, statut professionnel. */
export default function ProfessionalStatusStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);

  return (
    <OnboardingStepShell
      step={4}
      title="Quel est votre statut professionnel ?"
      subtitle="Pour adapter vos démarches"
      primaryLabel="Suivant"
      isPrimaryDisabled={draft.professionalStatus === null}
      onPrimaryPress={() => router.push('/priorites')}
    >
      {PROFESSIONAL_STATUS_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          label={option.label}
          isSelected={draft.professionalStatus === option.value}
          onPress={() =>
            setDraft((current) => ({
              ...current,
              professionalStatus: option.value,
            }))
          }
        />
      ))}
    </OnboardingStepShell>
  );
}

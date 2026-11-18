import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { ChoiceCard } from '@/components/onboarding/choice-card';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { PROFESSIONAL_STATUS_OPTIONS } from '@/features/onboarding/constants';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

/** Écran 1c — Étape 4/6, statut professionnel. */
export default function ProfessionalStatusStep() {
  const { t } = useTranslation();
  const [draft, setDraft] = useAtom(onboardingDraftAtom);

  return (
    <OnboardingStepShell
      step={4}
      title={t('onboarding.status.title')}
      subtitle={t('onboarding.status.subtitle')}
      primaryLabel={t('onboarding.next')}
      isPrimaryDisabled={draft.professionalStatus === null}
      onPrimaryPress={() => router.push('/priorites')}
    >
      {PROFESSIONAL_STATUS_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          label={t(option.label)}
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

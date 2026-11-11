import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { Text, View } from 'react-native';

import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { YesNoChoice } from '@/components/onboarding/yes-no-choice';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';
import { todayIso } from '@/lib/date';

/**
 * Écran 1b — Étape 3/6, arrivée du bébé.
 *
 * La date d'arrivée ne peut pas être passée (demande explicite) : la
 * molette part d'aujourd'hui (`minDate`) et un brouillon resté sur une date
 * dépassée (retour en arrière le lendemain, par exemple) bloque « Suivant »
 * avec une explication. Le libellé ne parle donc plus de date « réelle ».
 */
export default function BabyArrivalStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);
  const today = todayIso();
  const isDueDateInPast = draft.dueDate !== null && draft.dueDate < today;

  return (
    <OnboardingStepShell
      step={3}
      title="Quand votre bébé arrive-t-il ?"
      primaryLabel="Suivant"
      isPrimaryDisabled={
        draft.dueDate === null || isDueDateInPast || draft.isFirstChild === null
      }
      onPrimaryPress={() => router.push('/statut')}
    >
      <View className="gap-2.5">
        <Text className="text-[14px] font-medium text-[#1a1a1a]">
          Date de naissance prévue
        </Text>
        <WheelDatePicker
          value={draft.dueDate}
          minDate={today}
          onChange={(dueDate) =>
            setDraft((current) => ({ ...current, dueDate }))
          }
        />
        {isDueDateInPast ? (
          <Text className="px-1 text-[12.5px] text-[#c9553d]">
            La date d’arrivée doit être aujourd’hui ou plus tard.
          </Text>
        ) : null}
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

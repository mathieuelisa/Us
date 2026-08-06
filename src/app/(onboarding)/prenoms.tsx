import { router } from 'expo-router';
import { Input, TextField } from 'heroui-native';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { shouldInvitePartner } from '@/features/onboarding/constants';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

/**
 * Écran 1z — Étape 2/6, prénoms.
 *
 * ⚠️ Écart assumé entre les sources : la maquette Hi-Fi affiche le prénom
 * du co-parent comme « (facultatif) » et propose « Passer cette étape »,
 * alors que CONCEPT.md dit « prénoms des deux parents (obligatoire pour
 * personnaliser l'application) ». CLAUDE.md tranche : CONCEPT.md fait foi.
 * On rend donc les deux prénoms obligatoires — mais uniquement quand il y a
 * effectivement un co-parent : le champ disparaît si l'utilisateur a répondu
 * « Seul·e », ou que le co-parent n'utilisera pas l'app (cf.
 * `shouldInvitePartner`). Demander le prénom d'un co-parent inexistant
 * n'aurait pas de sens.
 *
 * ⚠️ État local plutôt que TanStack Form (que DOCS/04-ARCHITECTURE.md
 * impose) : la réactivité de TanStack Form v1 ne fonctionne pas dans cette
 * combinaison Expo/React 19 — voir la note dans l'architecture.
 */
export default function FirstNamesStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);

  const [firstName, setFirstName] = useState(draft.firstName);
  const [partnerFirstName, setPartnerFirstName] = useState(
    draft.partnerFirstName,
  );
  const [touchedField, setTouchedField] = useState<Record<string, boolean>>({});

  const hasPartner = shouldInvitePartner(
    draft.accompanimentType,
    draft.partnerUsesApp,
  );

  const isFirstNameMissing = firstName.trim().length === 0;
  const isPartnerFirstNameMissing =
    hasPartner && partnerFirstName.trim().length === 0;
  const isValid = !isFirstNameMissing && !isPartnerFirstNameMissing;

  const goToNextStep = () => {
    setDraft((current) => ({
      ...current,
      firstName: firstName.trim(),
      partnerFirstName: hasPartner ? partnerFirstName.trim() : '',
    }));
    router.push('/bebe');
  };

  return (
    <OnboardingStepShell
      step={2}
      title="Petit à petit, faisons connaissance 👋"
      subtitle="Ces prénoms nous servent uniquement à personnaliser votre espace — jamais utilisés pour vous identifier."
      primaryLabel="Continuer"
      isPrimaryDisabled={!isValid}
      onPrimaryPress={goToNextStep}
    >
      <View className="gap-1.5">
        <TextField isInvalid={touchedField.firstName && isFirstNameMissing}>
          <Input
            placeholder="Votre prénom"
            value={firstName}
            onChangeText={setFirstName}
            onBlur={() =>
              setTouchedField((current) => ({ ...current, firstName: true }))
            }
            autoCapitalize="words"
          />
        </TextField>
        {touchedField.firstName && isFirstNameMissing ? (
          <Text className="text-[12.5px] text-red-600">
            Votre prénom est nécessaire.
          </Text>
        ) : null}
      </View>

      {hasPartner ? (
        <View className="gap-1.5">
          <TextField
            isInvalid={
              touchedField.partnerFirstName && isPartnerFirstNameMissing
            }
          >
            <Input
              placeholder="Prénom du co-parent"
              value={partnerFirstName}
              onChangeText={setPartnerFirstName}
              onBlur={() =>
                setTouchedField((current) => ({
                  ...current,
                  partnerFirstName: true,
                }))
              }
              autoCapitalize="words"
            />
          </TextField>
          {touchedField.partnerFirstName && isPartnerFirstNameMissing ? (
            <Text className="text-[12.5px] text-red-600">
              Le prénom du co-parent est nécessaire.
            </Text>
          ) : null}
        </View>
      ) : null}
    </OnboardingStepShell>
  );
}

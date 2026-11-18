import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { PlainInput } from '@/components/plain-input';
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
  const { t } = useTranslation();
  const [draft, setDraft] = useAtom(onboardingDraftAtom);
  const [touchedField, setTouchedField] = useState<Record<string, boolean>>({});

  // La saisie va directement dans le brouillon, comme sur les autres étapes :
  // l'écran est démonté dès qu'on revient en arrière, donc un état local
  // serait perdu à chaque aller-retour entre étapes.
  const { firstName, partnerFirstName } = draft;
  const setFirstName = (value: string) =>
    setDraft((current) => ({ ...current, firstName: value }));
  const setPartnerFirstName = (value: string) =>
    setDraft((current) => ({ ...current, partnerFirstName: value }));

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
      firstName: current.firstName.trim(),
      partnerFirstName: hasPartner ? current.partnerFirstName.trim() : '',
    }));
    router.push('/bebe');
  };

  return (
    <OnboardingStepShell
      step={2}
      title={t('onboarding.names.title')}
      subtitle={t('onboarding.names.subtitle')}
      primaryLabel={t('onboarding.next')}
      isPrimaryDisabled={!isValid}
      onPrimaryPress={goToNextStep}
    >
      <View className="gap-1.5">
        <PlainInput
          isInvalid={touchedField.firstName && isFirstNameMissing}
          placeholder={t('onboarding.firstName')}
          value={firstName}
          onChangeText={setFirstName}
          onBlur={() =>
            setTouchedField((current) => ({ ...current, firstName: true }))
          }
          autoCapitalize="words"
        />
        {touchedField.firstName && isFirstNameMissing ? (
          <Text className="text-[12.5px] text-red-600">
            {t('onboarding.firstNameRequired')}
          </Text>
        ) : null}
      </View>

      {hasPartner ? (
        <View className="gap-1.5">
          <PlainInput
            isInvalid={
              touchedField.partnerFirstName && isPartnerFirstNameMissing
            }
            placeholder={t('onboarding.names.partnerFirstName')}
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
          {touchedField.partnerFirstName && isPartnerFirstNameMissing ? (
            <Text className="text-[12.5px] text-red-600">
              {t('onboarding.names.partnerFirstNameRequired')}
            </Text>
          ) : null}
        </View>
      ) : null}
    </OnboardingStepShell>
  );
}

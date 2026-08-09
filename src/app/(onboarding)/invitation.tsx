import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { PlainInput } from '@/components/plain-input';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Écran 2d — invitation du co-parent.
 *
 * L'invitation part à la toute fin (écran de finalisation), en même temps
 * que la création du foyer : tant que le foyer n'existe pas, il n'y a pas
 * d'`household_id` à rattacher à l'invitation.
 *
 * Les maquettes proposent « Email ou numéro » ; seul l'email est accepté
 * ici, le rattachement du co-parent reposant sur un lien magique envoyé par
 * email (CONCEPT.md). Un envoi par SMS supposerait un fournisseur SMS et un
 * autre mécanisme de rattachement — hors périmètre MVP.
 */
export default function InvitePartnerStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);
  const [isTouched, setIsTouched] = useState(false);

  // Saisie stockée dans le brouillon, pour survivre aux allers-retours
  // entre étapes (l'écran est démonté quand on revient en arrière).
  const partnerEmail = draft.partnerEmail;
  const setPartnerEmail = (value: string) =>
    setDraft((current) => ({ ...current, partnerEmail: value }));

  const partnerName = draft.partnerFirstName.trim();
  const isValidEmail = EMAIL_PATTERN.test(partnerEmail.trim());

  const sendInvitation = () => {
    setDraft((current) => ({
      ...current,
      partnerEmail: current.partnerEmail.trim(),
    }));
    router.push('/finalisation');
  };

  const skipInvitation = () => {
    setDraft((current) => ({ ...current, partnerEmail: '' }));
    router.push('/finalisation');
  };

  return (
    <OnboardingStepShell
      step={null}
      centered
      title={partnerName ? `Inviter ${partnerName}` : 'Inviter le co-parent'}
      subtitle={
        partnerName
          ? `${partnerName} pourra suivre les démarches, les infos concernant son bébé et rester connecté à votre grossesse`
          : 'Le co-parent pourra suivre les démarches, les infos concernant son bébé et rester connecté à votre grossesse'
      }
      primaryLabel="Envoyer l’invitation"
      isPrimaryDisabled={!isValidEmail}
      onPrimaryPress={sendInvitation}
      secondaryLabel="Plus tard"
      onSecondaryPress={skipInvitation}
    >
      <View className="gap-1.5">
        <PlainInput
          isInvalid={isTouched && !isValidEmail}
          placeholder={
            partnerName ? `Email de ${partnerName}` : 'Email du co-parent'
          }
          value={partnerEmail}
          onChangeText={setPartnerEmail}
          onBlur={() => setIsTouched(true)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {isTouched && partnerEmail.trim().length > 0 && !isValidEmail ? (
          <Text className="text-[12.5px] text-red-600">
            Cette adresse email ne semble pas valide.
          </Text>
        ) : null}
      </View>
    </OnboardingStepShell>
  );
}

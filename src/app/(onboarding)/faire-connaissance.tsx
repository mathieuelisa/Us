import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { ChoiceCard } from '@/components/onboarding/choice-card';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { PlainInput } from '@/components/plain-input';
import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import type { ProfilePronoun } from '@/features/profile/api';
import { useMyProfile, useSavePartnerIntro } from '@/features/profile/hooks';

const PRONOUN_OPTIONS: {
  value: ProfilePronoun;
  label: string;
  description: string;
  icon: {
    name: 'man-outline' | 'woman-outline' | 'person-outline';
    color: string;
    tint: string;
  };
}[] = [
  {
    value: 'il',
    label: 'Il',
    description: 'Ex. « Bram est en pleine forme, il… »',
    icon: { name: 'man-outline', color: '#3b82c4', tint: '#e0eefb' },
  },
  {
    value: 'elle',
    label: 'Elle',
    description: 'Ex. « Camille est en pleine forme, elle… »',
    icon: { name: 'woman-outline', color: '#d6457f', tint: '#fde4ee' },
  },
  {
    value: 'neutre',
    label: 'Avec mon prénom seulement',
    description: 'Sans « il » ni « elle »',
    icon: { name: 'person-outline', color: '#8a63c9', tint: '#eae1f8' },
  },
];

/**
 * « Faisons connaissance » du parcours partenaire (demande explicite) : après
 * la présentation de l'app, avant le code pour rejoindre l'espace. Prénom,
 * et façon d'en parler (« il », « elle » ou avec le prénom seulement), qui
 * sert uniquement à accorder les textes — plutôt qu'un « genre », plus
 * personnel que nécessaire. Enregistrés dans le profil (`first_name`,
 * `pronoun`), avec `is_partner` confirmé.
 */
export default function PartnerIntroStep() {
  const { data: profile } = useMyProfile();
  const saveIntro = useSavePartnerIntro();
  const [firstName, setFirstName] = useState('');
  const [pronoun, setPronoun] = useState<ProfilePronoun | null>(null);
  const [isFirstNameTouched, setIsFirstNameTouched] = useState(false);

  // Reprend ce qui est déjà au profil (retour arrière, nouvel essai).
  useEffect(() => {
    if (profile?.first_name)
      setFirstName((current) => current || profile.first_name || '');
    if (
      profile?.pronoun === 'il' ||
      profile?.pronoun === 'elle' ||
      profile?.pronoun === 'neutre'
    ) {
      setPronoun((current) => current ?? (profile.pronoun as ProfilePronoun));
    }
  }, [profile?.first_name, profile?.pronoun]);

  const isFirstNameMissing = firstName.trim().length === 0;
  const canContinue =
    !isFirstNameMissing && pronoun !== null && !saveIntro.isPending;

  const next = () => {
    if (!canContinue || !pronoun) return;
    saveIntro.mutate(
      { firstName: firstName.trim(), pronoun },
      { onSuccess: () => router.push('/rejoindre') },
    );
  };

  return (
    <OnboardingStepShell
      step={null}
      title="Faisons connaissance"
      subtitle="Votre prénom et la façon de parler de vous : ils servent seulement à personnaliser l’app pour vous deux."
      primaryLabel={saveIntro.isPending ? 'Enregistrement…' : 'Continuer'}
      isPrimaryDisabled={!canContinue}
      onPrimaryPress={next}
    >
      <View className="gap-1.5">
        <PlainInput
          isInvalid={isFirstNameTouched && isFirstNameMissing}
          placeholder="Votre prénom"
          value={firstName}
          onChangeText={setFirstName}
          onBlur={() => setIsFirstNameTouched(true)}
          autoCapitalize="words"
        />
        {isFirstNameTouched && isFirstNameMissing ? (
          <Text className="text-[12.5px] text-red-600">
            Votre prénom est nécessaire.
          </Text>
        ) : null}
      </View>

      <View className="gap-2.5">
        <Text
          className="text-[15px] font-bold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          Comment parler de vous ?
        </Text>
        {PRONOUN_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            label={option.label}
            description={option.description}
            icon={option.icon}
            isSelected={pronoun === option.value}
            onPress={() => setPronoun(option.value)}
          />
        ))}
      </View>

      {saveIntro.isError ? (
        <Text className="text-[12.5px] text-red-600">
          Impossible d’enregistrer pour le moment. Vérifiez votre connexion,
          puis réessayez.
        </Text>
      ) : null}
    </OnboardingStepShell>
  );
}

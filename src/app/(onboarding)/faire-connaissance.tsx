import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { ChoiceCard } from '@/components/onboarding/choice-card';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { PlainInput } from '@/components/plain-input';
import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import type { ProfilePronoun } from '@/features/profile/api';
import { useMyProfile, useSavePartnerIntro } from '@/features/profile/hooks';
import type { TranslationKey } from '@/i18n/types';

const PRONOUN_OPTIONS: {
  value: ProfilePronoun;
  label: TranslationKey;
  description: TranslationKey;
  icon: {
    name: 'man-outline' | 'woman-outline' | 'person-outline';
    color: string;
    tint: string;
  };
}[] = [
  {
    value: 'il',
    label: 'onboarding.intro.pronouns.il.label',
    description: 'onboarding.intro.pronouns.il.description',
    icon: { name: 'man-outline', color: '#3b82c4', tint: '#e0eefb' },
  },
  {
    value: 'elle',
    label: 'onboarding.intro.pronouns.elle.label',
    description: 'onboarding.intro.pronouns.elle.description',
    icon: { name: 'woman-outline', color: '#d6457f', tint: '#fde4ee' },
  },
  {
    value: 'neutre',
    label: 'onboarding.intro.pronouns.neutre.label',
    description: 'onboarding.intro.pronouns.neutre.description',
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
  const { t } = useTranslation();
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
      title={t('onboarding.intro.title')}
      subtitle={t('onboarding.intro.subtitle')}
      primaryLabel={
        saveIntro.isPending ? t('common.saving') : t('common.continue')
      }
      isPrimaryDisabled={!canContinue}
      onPrimaryPress={next}
    >
      <View className="gap-1.5">
        <PlainInput
          isInvalid={isFirstNameTouched && isFirstNameMissing}
          placeholder={t('onboarding.firstName')}
          value={firstName}
          onChangeText={setFirstName}
          onBlur={() => setIsFirstNameTouched(true)}
          autoCapitalize="words"
        />
        {isFirstNameTouched && isFirstNameMissing ? (
          <Text className="text-[12.5px] text-red-600">
            {t('onboarding.firstNameRequired')}
          </Text>
        ) : null}
      </View>

      <View className="gap-2.5">
        <Text
          className="text-[15px] font-bold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {t('onboarding.intro.howToRefer')}
        </Text>
        {PRONOUN_OPTIONS.map((option) => (
          <ChoiceCard
            key={option.value}
            label={t(option.label)}
            description={t(option.description)}
            icon={option.icon}
            isSelected={pronoun === option.value}
            onPress={() => setPronoun(option.value)}
          />
        ))}
      </View>

      {saveIntro.isError ? (
        <Text className="text-[12.5px] text-red-600">
          {t('onboarding.intro.saveError')}
        </Text>
      ) : null}
    </OnboardingStepShell>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAtom } from 'jotai';
import type { ComponentProps } from 'react';
import { Image, Text, View } from 'react-native';

import { ChoiceCard } from '@/components/onboarding/choice-card';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { YesNoChoice } from '@/components/onboarding/yes-no-choice';
import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import {
  ACCOMPANIMENT_OPTIONS,
  type AccompanimentType,
} from '@/features/onboarding/constants';
import { useThemeAccent } from '@/features/settings/hooks';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';
import { hexToRgba } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Pictogramme et teintes de chaque mode d'accompagnement — purement
 * visuels (capture de référence), la valeur enregistrée ne change pas.
 */
const ACCOMPANIMENT_ICONS: Record<
  AccompanimentType,
  { name: IoniconName; color: string; tint: string }
> = {
  couple: { name: 'people-outline', color: '#d6457f', tint: '#fde4ec' },
  coparentalite: { name: 'home-outline', color: '#2e9c93', tint: '#d9f2ee' },
  seul: { name: 'person-outline', color: '#8a63c9', tint: '#eae1f8' },
  autre: {
    name: 'ellipsis-horizontal',
    color: '#c99a2e',
    tint: '#fcf0c9',
  },
};

/** Ourson sur une tache d'accent, feuille et cœurs — en haut à droite. */
function StepIllustration() {
  const accent = useThemeAccent();
  return (
    <View style={{ width: 124, height: 124 }}>
      <View
        style={{
          position: 'absolute',
          left: 8,
          top: 10,
          width: 112,
          height: 112,
          borderRadius: 56,
          backgroundColor: hexToRgba(accent, 0.1),
        }}
      />
      <Ionicons
        name="leaf"
        size={30}
        color={hexToRgba(accent, 0.3)}
        style={{
          position: 'absolute',
          right: -4,
          bottom: 6,
          transform: [{ rotate: '25deg' }],
        }}
      />
      <Image
        source={require('@/assets/images/Baby_said_hi.png')}
        style={{ width: 108, height: 124, alignSelf: 'center' }}
        resizeMode="contain"
      />
      <Ionicons
        name="heart"
        size={18}
        color="#f08aa8"
        style={{ position: 'absolute', right: 0, top: 0 }}
      />
      <Ionicons
        name="heart-outline"
        size={14}
        color={hexToRgba(accent, 0.5)}
        style={{ position: 'absolute', left: -6, top: 14 }}
      />
    </View>
  );
}

/** Écran 1d — Étape 1/6, mode d'accompagnement. */
export default function AccompanimentStep() {
  const [draft, setDraft] = useAtom(onboardingDraftAtom);
  const accent = useThemeAccent();

  const selectAccompaniment = (accompanimentType: AccompanimentType) =>
    setDraft((current) => ({ ...current, accompanimentType }));

  return (
    <OnboardingStepShell
      step={1}
      title="Qui vous accompagne dans cette aventure ?"
      primaryLabel="Suivant"
      isPrimaryDisabled={draft.accompanimentType === null}
      onPrimaryPress={() => router.push('/prenoms')}
      illustration={<StepIllustration />}
    >
      {ACCOMPANIMENT_OPTIONS.map((option) => (
        <ChoiceCard
          key={option.value}
          label={option.label}
          icon={ACCOMPANIMENT_ICONS[option.value]}
          isSelected={draft.accompanimentType === option.value}
          onPress={() => selectAccompaniment(option.value)}
        />
      ))}

      <View
        className="mt-2 gap-3 rounded-[24px] p-3.5"
        style={{ backgroundColor: hexToRgba(accent, 0.07) }}
      >
        <View className="flex-row items-center gap-2.5 px-1">
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={accent}
          />
          <Text
            className="flex-1 text-[14.5px] font-medium"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            Le co-parent utilisera-t-il aussi l’app ?
          </Text>
        </View>
        <YesNoChoice
          value={draft.partnerUsesApp}
          onChange={(partnerUsesApp) =>
            setDraft((current) => ({ ...current, partnerUsesApp }))
          }
        />
      </View>
    </OnboardingStepShell>
  );
}

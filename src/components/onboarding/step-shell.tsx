import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { ONBOARDING_STEP_COUNT } from '@/features/onboarding/constants';
import { useThemeBackground } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

const STEP_NUMBERS = Array.from(
  { length: ONBOARDING_STEP_COUNT },
  (_, index) => index + 1,
);

/**
 * Ossature commune des écrans d'onboarding : barre de progression, titre,
 * sous-titre, contenu scrollable et action principale en pied d'écran.
 * Les écrans hors parcours numéroté (réassurance, paywall, invitation)
 * passent simplement `step={null}`.
 *
 * `centered` : variante où titre, sous-titre et contenu sont regroupés au
 * centre vertical de l'écran plutôt qu'alignés en haut — pour les écrans de
 * transition (réassurance, invitation) qui n'ont pas de longue liste à
 * faire défiler.
 */
export function OnboardingStepShell({
  step,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimaryPress,
  isPrimaryDisabled = false,
  secondaryLabel,
  onSecondaryPress,
  centered = false,
}: {
  step: number | null;
  title: string;
  subtitle?: string;
  children: ReactNode;
  primaryLabel: string;
  onPrimaryPress: () => void;
  isPrimaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  centered?: boolean;
}) {
  const router = useRouter();
  const backgroundColor = useThemeBackground();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 px-7 pt-4">
        {/* Aligné à gauche : c'est la convention iOS/Android, et surtout le
            côté d'où part le swipe de retour — bouton et geste désignent
            ainsi la même direction. */}
        {router.canGoBack() ? (
          <Pressable
            accessibilityLabel="Revenir à l’étape précédente"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
            className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f4]"
          >
            <Text className="text-[17px] leading-[20px] text-[#1a1a1a]">‹</Text>
          </Pressable>
        ) : null}

        {step === null ? null : (
          <View className="gap-2 pb-6">
            <View className="h-1 flex-row gap-1">
              {STEP_NUMBERS.map((stepNumber) => (
                <View
                  key={stepNumber}
                  className={`h-1 flex-1 rounded-full ${
                    stepNumber <= step ? 'bg-accent' : 'bg-[#e8e8e8]'
                  }`}
                />
              ))}
            </View>
            <Text className="text-[12.5px] text-[#9a9a9a]">
              Étape {step} sur {ONBOARDING_STEP_COUNT}
            </Text>
          </View>
        )}

        {centered ? (
          <View className="flex-1 justify-center gap-2">
            <Text className="text-center text-[24px] font-bold leading-7 text-[#1a1a1a]">
              {title}
            </Text>
            {subtitle ? (
              <Text className="px-2 text-center text-[14px] leading-5 text-[#6b6b6b]">
                {subtitle}
              </Text>
            ) : null}
            <View className="gap-6 pt-4">{children}</View>
          </View>
        ) : (
          <>
            <Text className="text-[24px] font-bold leading-7 text-[#1a1a1a]">
              {title}
            </Text>
            {subtitle ? (
              <Text className="pt-2 text-[14px] leading-5 text-[#6b6b6b]">
                {subtitle}
              </Text>
            ) : null}

            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-3 py-6"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </>
        )}

        <View className="gap-3 pb-2">
          <Button isDisabled={isPrimaryDisabled} onPress={onPrimaryPress}>
            <Button.Label>{primaryLabel}</Button.Label>
          </Button>

          {secondaryLabel && onSecondaryPress ? (
            <Pressable
              accessibilityRole="button"
              className="items-center py-2"
              onPress={onSecondaryPress}
            >
              <Text className="text-[14px] text-[#6b6b6b]">
                {secondaryLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

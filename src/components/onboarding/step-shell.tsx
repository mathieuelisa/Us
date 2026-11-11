import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';
import { SlideInText } from '@/components/onboarding/slide-in-text';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { ONBOARDING_STEP_COUNT } from '@/features/onboarding/constants';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

const STEP_NUMBERS = Array.from(
  { length: ONBOARDING_STEP_COUNT },
  (_, index) => index + 1,
);

/**
 * Police custom (Provicali, demande explicite) réservée aux titres
 * d'onboarding — chargée dans `src/app/_layout.tsx` via `useFonts`.
 *
 * ⚠️ Licence : `assets/fonts/Provicali.otf` est distribuée par Chequered
 * Ink Ltd. sous licence **Non-Commercial** (voir
 * `FSLA_NonCommercial_License.html` fourni avec le fichier). L'app a une
 * intention commerciale (paywall, module premium — DOCS/versions/MVP.md) :
 * une licence commerciale doit être achetée avant toute mise en
 * production, sans quoi l'usage de cette police enfreint la licence.
 */
const ONBOARDING_TITLE_FONT = 'Provicali';

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
 *
 * Habillage modernisé d'après une capture de référence de l'étape 1
 * (demande explicite) et appliqué à tout le parcours, l'ossature étant
 * commune : grand bouton retour rond, barre de progression plus épaisse,
 * titre en couleur d'encre souligné d'un trait d'accent, ronds décoratifs
 * en fond, action principale en `PillButton`. `illustration` (facultatif)
 * se pose en haut à droite, à côté du titre — qui se resserre alors pour
 * lui laisser la place.
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
  illustration,
  hero,
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
  illustration?: ReactNode;
  /**
   * Visuel posé **au-dessus** du titre dans la variante `centered`
   * (réassurance) : l'image ouvre l'écran, le titre vient ensuite.
   */
  hero?: ReactNode;
}) {
  const router = useRouter();
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  const underline = (
    <Svg width={120} height={10} viewBox="0 0 120 10">
      <Path
        d="M3 7 C 34 2, 80 1.5, 117 4"
        stroke={hexToRgba(accent, 0.5)}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <View className="flex-1 px-6 pt-4">
        {illustration ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 56, right: 8 }}
          >
            {illustration}
          </View>
        ) : null}

        {/* Aligné à gauche : c'est la convention iOS/Android, et surtout le
            côté d'où part le swipe de retour — bouton et geste désignent
            ainsi la même direction. */}
        {router.canGoBack() ? (
          <Pressable
            accessibilityLabel="Revenir à l’étape précédente"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
            className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Ionicons name="chevron-back" size={21} color={GLASS_TITLE_COLOR} />
          </Pressable>
        ) : null}

        {step === null ? null : (
          <View
            className="gap-2 pb-5"
            style={illustration ? { maxWidth: '62%' } : undefined}
          >
            <View className="h-1.5 flex-row gap-1.5">
              {STEP_NUMBERS.map((stepNumber) => (
                <View
                  key={stepNumber}
                  className="h-1.5 flex-1 rounded-full"
                  style={{
                    backgroundColor:
                      stepNumber <= step ? accent : hexToRgba(accent, 0.12),
                  }}
                />
              ))}
            </View>
            <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
              Étape {step} sur {ONBOARDING_STEP_COUNT}
            </Text>
          </View>
        )}

        {centered ? (
          <View className="flex-1 justify-center gap-2">
            {hero}
            <SlideInText direction="left">
              <View className="items-center gap-1.5">
                <Text
                  style={{
                    fontFamily: ONBOARDING_TITLE_FONT,
                    color: GLASS_TITLE_COLOR,
                  }}
                  className="text-center text-[25px] leading-[30px]"
                >
                  {title}
                </Text>
                {underline}
              </View>
            </SlideInText>
            {subtitle ? (
              <SlideInText direction="right">
                <Text
                  className="px-2 text-center text-[14px] leading-5"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {subtitle}
                </Text>
              </SlideInText>
            ) : null}
            <View className="gap-6 pt-4">{children}</View>
          </View>
        ) : (
          <>
            <SlideInText direction="left">
              <View
                className="gap-2"
                style={illustration ? { maxWidth: '66%' } : undefined}
              >
                <Text
                  style={{
                    fontFamily: ONBOARDING_TITLE_FONT,
                    color: GLASS_TITLE_COLOR,
                  }}
                  className="text-[26px] leading-[31px]"
                >
                  {title}
                </Text>
                {underline}
              </View>
            </SlideInText>
            {subtitle ? (
              <SlideInText direction="right" style={{ paddingTop: 8 }}>
                <Text
                  className="text-[14px] leading-5"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {subtitle}
                </Text>
              </SlideInText>
            ) : null}

            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-3 py-5"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </>
        )}

        <View className="gap-3 pb-2">
          <PillButton
            label={primaryLabel}
            isDisabled={isPrimaryDisabled}
            onPress={onPrimaryPress}
          />

          {secondaryLabel && onSecondaryPress ? (
            <Pressable
              accessibilityRole="button"
              className="items-center py-2"
              onPress={onSecondaryPress}
            >
              <Text
                className="text-[14.5px] font-semibold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {secondaryLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

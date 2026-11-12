import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import {
  LEGAL_DOCS,
  type LegalDocId,
  type LegalSection,
} from '@/features/legal/content';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

/** Surface « verre dépoli » des cartes, comme sur les autres écrans. */
const GLASS_SURFACE = {
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.95)',
} as const;

/**
 * Écran 10a — documents de la sous-section CONFIDENTIALITÉ des Réglages
 * (mentions légales, politique de confidentialité, conditions
 * d'utilisation). Un seul écran générique pour les 3 documents.
 *
 * Mise en page dans le style de l'app (demande explicite) : retour en
 * pastille, grande tuile d'icône, titre souligné, carte « En bref » teintée
 * d'accent, puis une carte « verre dépoli » par section (icône, titre,
 * paragraphes, puces).
 *
 * Le texte vit dans `features/legal/content.ts` — provisoire, à compléter
 * et à faire valider (voir l'avertissement de ce fichier).
 */
export default function LegalScreen() {
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  const entry = LEGAL_DOCS[doc as LegalDocId] ?? LEGAL_DOCS['legal-notice'];
  const shadow = {
    shadowColor: accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  } as const;

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-5 px-5 pb-12 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {router.canGoBack() ? (
          <Pressable
            accessibilityLabel="Revenir en arrière"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
            style={shadow}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="chevron-back" size={22} color={GLASS_TITLE_COLOR} />
          </Pressable>
        ) : null}

        {/* En-tête : tuile d'icône, titre souligné, sous-titre, date. */}
        <View className="gap-3">
          <View>
            <View
              className="h-16 w-16 items-center justify-center rounded-[22px]"
              style={[
                {
                  backgroundColor: hexToRgba(accent, 0.12),
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.9)',
                },
              ]}
            >
              <Ionicons name={entry.icon} size={30} color={accent} />
            </View>
            <SparkLines
              color={hexToRgba(accent, 0.55)}
              style={{ left: 54, top: -14, transform: [{ rotate: '10deg' }] }}
            />
          </View>

          <View className="gap-1.5">
            <Text
              className="text-[28px] font-extrabold leading-[34px]"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
            >
              {entry.title}
            </Text>
            <Svg width={120} height={10} viewBox="0 0 120 10">
              <Path
                d="M3 7 C 34 2, 80 1.5, 117 4"
                stroke={hexToRgba(accent, 0.5)}
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <Text
              className="text-[14.5px] leading-5"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {entry.subtitle}
            </Text>
          </View>

          <View
            className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5"
            style={{ backgroundColor: hexToRgba(accent, 0.1) }}
          >
            <Ionicons name="calendar-outline" size={14} color={accent} />
            <Text
              className="text-[12.5px] font-semibold"
              style={{ color: accent }}
            >
              Dernière mise à jour : {entry.updatedAt}
            </Text>
          </View>
        </View>

        {entry.summary ? (
          <View
            className="gap-3 rounded-[26px] p-4"
            style={{ backgroundColor: hexToRgba(accent, 0.09) }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="sparkles-outline" size={18} color={accent} />
              <Text className="text-[15px] font-bold" style={{ color: accent }}>
                En bref
              </Text>
            </View>
            {entry.summary.map((point) => (
              <View key={point} className="flex-row items-start gap-2.5">
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={accent}
                  style={{ marginTop: 1 }}
                />
                <Text
                  className="flex-1 text-[14px] leading-5"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  {point}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {entry.sections.map((section, index) => (
          <SectionCard
            key={section.title}
            section={section}
            number={index + 1}
            accent={accent}
            shadow={shadow}
          />
        ))}

        <DashedLoopDoodle color={accent} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** Une section : pastille d'icône, numéro et titre, puis texte et puces. */
function SectionCard({
  section,
  number,
  accent,
  shadow,
}: {
  section: LegalSection;
  number: number;
  accent: string;
  shadow: object;
}) {
  return (
    <View className="gap-3 rounded-[24px] p-4" style={[GLASS_SURFACE, shadow]}>
      <View className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: hexToRgba(accent, 0.1) }}
        >
          <Ionicons name={section.icon} size={19} color={accent} />
        </View>
        <View className="flex-1">
          <Text
            className="text-[11.5px] font-bold"
            style={{ color: hexToRgba(accent, 0.75), letterSpacing: 1 }}
          >
            {String(number).padStart(2, '0')}
          </Text>
          <Text
            className="text-[16px] font-bold leading-5"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {section.title}
          </Text>
        </View>
      </View>

      {section.paragraphs?.map((paragraph) => (
        <Text
          key={paragraph}
          className="text-[14px] leading-[21px]"
          style={{ color: GLASS_BODY_COLOR }}
        >
          {paragraph}
        </Text>
      ))}

      {section.bullets ? (
        <View className="gap-2">
          {section.bullets.map((bullet) => (
            <View key={bullet} className="flex-row items-start gap-2.5">
              <View
                className="mt-[7px] h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent }}
              />
              <Text
                className="flex-1 text-[14px] leading-[21px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {bullet}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import { AppointmentsTab } from '@/components/health/appointments-tab';
import { ContactsTab } from '@/components/health/contacts-tab';
import { ExercisesTab } from '@/components/health/exercises-tab';
import { JournalTab } from '@/components/health/journal-tab';
import { SegmentedTabs } from '@/components/health/segmented-tabs';
import { BlobFab } from '@/components/ui/blob-fab';
import {
  FeedbackBanner,
  useFeedbackBanner,
} from '@/components/ui/feedback-banner';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useMyHousehold } from '@/features/household/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

type HealthTab = 'journal' | 'appointments' | 'contacts' | 'exercises';

const HEALTH_TABS: HealthTab[] = [
  'journal',
  'appointments',
  'contacts',
  'exercises',
];

const HEADER_IMAGE = require('@/assets/images/Mother_with_calendar.png');
const HEART_PINK = '#e8739a';

/**
 * Sous-titre de l'en-tête, propre à l'onglet actif : une phrase simple qui
 * dit quoi faire ici (demande explicite : moderne mais compréhensible).
 */
const TAB_SUBTITLES: Record<HealthTab, string> = {
  journal: 'Sélectionnez la journée et les symptômes que vous ressentez.',
  appointments: 'Vos rendez-vous du mois et ceux à venir.',
  contacts: 'Les numéros utiles, à portée de main.',
  exercises: 'Bouger en douceur, à votre rythme.',
};

function isHealthTab(value: string | undefined): value is HealthTab {
  return HEALTH_TABS.includes(value as HealthTab);
}

/**
 * Écrans 4a/4b/4c/4f — pilier Suivi santé.
 *
 * ⚠️ Vue de la personne enceinte pour l'instant (demande explicite) ; la
 * vue du co-parent viendra dans une passe dédiée. La règle de visibilité la
 * plus sensible est toutefois **déjà appliquée** : l'onglet Journal
 * n'existe pas pour le co-parent — il est retiré de la liste, pas grisé.
 * C'est une donnée de santé, cette règle ne se rajoute pas « plus tard ».
 *
 * `?tab=` (facultatif) ouvre directement l'onglet demandé — utilisé par
 * « Nos prochains rendez-vous » du hub pour arriver sur Rendez-vous plutôt que sur le
 * premier onglet par défaut.
 */
export default function HealthScreen() {
  const router = useRouter();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const { data: household } = useMyHousehold();
  const role = useAtomValue(currentRoleAtom) ?? 'pregnant';
  const isPregnant = role === 'pregnant';

  const tabs = useMemo(() => {
    const journalTab = {
      value: 'journal' as const,
      label: 'Journal',
      icon: 'book-outline' as const,
    };
    const sharedTabs = [
      {
        value: 'appointments' as const,
        label: 'Rendez-vous',
        icon: 'calendar-outline' as const,
      },
      {
        value: 'contacts' as const,
        label: 'Contacts',
        icon: 'call-outline' as const,
      },
      {
        value: 'exercises' as const,
        label: 'Exercices',
        icon: 'barbell-outline' as const,
      },
    ];
    return isPregnant ? [journalTab, ...sharedTabs] : sharedTabs;
  }, [isPregnant]);

  const [activeTab, setActiveTab] = useState<HealthTab>(
    isHealthTab(tabParam) ? tabParam : isPregnant ? 'journal' : 'appointments',
  );

  // `tabParam` peut n'être résolu qu'après le tout premier rendu (Expo
  // Router web) : l'initialiseur de `useState` le rate parfois, cet effet
  // rattrape le changement dès qu'il arrive.
  useEffect(() => {
    if (isHealthTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [isAddingContact, setIsAddingContact] = useState(false);
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();
  const { feedback, showFeedback } = useFeedbackBanner();

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName={`gap-5 px-6 pt-4 ${
          activeTab === 'contacts' ? 'pb-28' : 'pb-10'
        }`}
        showsVerticalScrollIndicator={false}
      >
        {/* Hauteur minimale au-delà des 160 px de l'illustration : sans elle,
            un sous-titre court laissait remonter les onglets sous l'ourson
            (demande explicite de les descendre). */}
        <View style={{ minHeight: 184 }}>
          {/* Illustration en haut à droite, du niveau du bouton retour
              jusqu'au sous-titre, derrière le titre. */}
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, right: -12 }}
          >
            <View
              style={{
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: hexToRgba(accent, 0.1),
                top: 22,
                left: 8,
              }}
            />
            <Image
              source={HEADER_IMAGE}
              style={{ width: 140, height: 160 }}
              resizeMode="contain"
            />
            <Ionicons
              name="heart"
              size={18}
              color={HEART_PINK}
              style={{
                position: 'absolute',
                top: 30,
                left: -6,
                transform: [{ rotate: '-12deg' }],
              }}
            />
          </View>

          {router.canGoBack() ? (
            <Pressable
              accessibilityLabel="Revenir en arrière"
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => router.back()}
              style={{
                shadowColor: accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 4,
              }}
              className="h-12 w-12 items-center justify-center rounded-full bg-white"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={GLASS_TITLE_COLOR}
              />
            </Pressable>
          ) : null}

          <Ionicons
            name="heart-outline"
            size={30}
            color={hexToRgba(accent, 0.55)}
            style={{
              position: 'absolute',
              top: 18,
              left: '44%',
              transform: [{ rotate: '14deg' }],
            }}
          />

          <View className="mt-7 gap-2" style={{ maxWidth: '62%' }}>
            <Text
              className="text-[30px] font-extrabold leading-9"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
            >
              Suivi santé
            </Text>
            <Svg width={120} height={12} viewBox="0 0 120 12">
              <Path
                d="M4 8 C 36 3, 82 2, 116 5"
                stroke={hexToRgba(accent, 0.55)}
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <Text
              className="mt-1 text-[14.5px] leading-[21px]"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {TAB_SUBTITLES[activeTab]}
            </Text>
          </View>
        </View>

        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <View>
          {activeTab === 'journal' && isPregnant ? (
            <JournalTab
              household={household}
              feedback={feedback}
              onFeedback={showFeedback}
            />
          ) : null}
          {activeTab === 'appointments' ? (
            <AppointmentsTab household={household} />
          ) : null}
          {activeTab === 'contacts' ? (
            <ContactsTab
              household={household}
              isAdding={isAddingContact}
              onIsAddingChange={setIsAddingContact}
              onFeedback={showFeedback}
            />
          ) : null}
          {activeTab === 'exercises' ? (
            <ExercisesTab household={household} />
          ) : null}
        </View>
      </ScrollView>

      {activeTab === 'contacts' && !isAddingContact ? (
        <BlobFab
          icon="person-add"
          iconSize={26}
          accessibilityLabel="Ajouter un contact"
          onPress={() => setIsAddingContact(true)}
          className="absolute bottom-6 right-6"
        />
      ) : null}

      {/* Au niveau de l'écran (et non dans l'onglet, pris dans le
          défilement) pour rester en haut de l'écran. */}
      <FeedbackBanner
        message={feedback?.message ?? null}
        tone={feedback?.tone}
        accent={accent}
      />
    </SafeAreaView>
  );
}

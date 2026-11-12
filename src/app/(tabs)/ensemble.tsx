import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import { MoodPicker } from '@/components/together/mood-picker';
import { NeedNoteOverlay } from '@/components/together/need-note-overlay';
import { WeekMoodStrip } from '@/components/together/week-mood-strip';
import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useMyHousehold } from '@/features/household/hooks';
import type { MoodValue } from '@/features/hub/api';
import { MOOD_PRESENTATION } from '@/features/hub/constants';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { getCurrentWeekIsoDates } from '@/features/together/api';
import {
  useGestureOfTheDay,
  useMyWeekCheckins,
  useUpsertMoodCheckin,
} from '@/features/together/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';
import { hexToRgba, lightenHex } from '@/lib/color';
import { todayIso } from '@/lib/date';

const HEART_PINK = '#e8739a';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écran 3a/3g — pilier Ensemble.
 *
 * ⚠️ Interface volontairement symétrique pour l'instant (demande
 * explicite) : CONCEPT.md décrit une vue différente par rôle, mais
 * l'asymétrie complète est reportée à une passe dédiée. Le contenu (geste
 * du jour) reste personnalisé par rôle — même écran, pool de suggestions
 * différent — ce n'est pas encore « l'interface du co-parent ».
 *
 * Habillage modernisé (demande explicite), aligné sur les autres écrans :
 * grand bouton retour, titre souligné et sous-titre, intitulé de section à
 * icône, semaine dans une carte blanche à gélules (`WeekMoodStrip`), geste du
 * jour en carte illustrée (`GestureOfTheDayCard`).
 */
export default function TogetherScreen() {
  const router = useRouter();

  const { data: household } = useMyHousehold();
  const role = useAtomValue(currentRoleAtom) ?? 'pregnant';
  const weekDates = getCurrentWeekIsoDates();

  const { data: checkinsByDate = {} } = useMyWeekCheckins(household);
  const { data: gesture } = useGestureOfTheDay(role);
  const upsertCheckin = useUpsertMoodCheckin(household);
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  const today = todayIso();
  const todayMood = checkinsByDate[today] ?? null;

  const [pendingMood, setPendingMood] = useState<MoodValue | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // Le check-in se fait « en un tap » (CONCEPT.md) : persisté immédiatement,
  // avant même que l'overlay du besoin ne soit résolue. Sans quoi quitter
  // l'overlay sans répondre perdrait le check-in.
  const handleSelectMood = (mood: MoodValue) => {
    setPendingMood(mood);
    upsertCheckin.mutate({ mood });
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
    setPendingMood(null);
  };

  const submitNeed = (note: string) => {
    if (pendingMood) {
      upsertCheckin.mutate({ mood: pendingMood, needNote: note || null });
    }
    closeOverlay();
  };

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Revenir en arrière"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <Ionicons name="chevron-back" size={22} color={GLASS_TITLE_COLOR} />
        </Pressable>

        <View className="gap-1.5">
          <Text
            className="text-[32px] font-extrabold leading-[38px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.7 }}
          >
            Ensemble
          </Text>
          <Svg width={96} height={10} viewBox="0 0 96 10">
            <Path
              d="M3 7 C 27 2, 64 1.5, 93 4"
              stroke={hexToRgba(accent, 0.5)}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <Text className="text-[14.5px]" style={{ color: GLASS_BODY_COLOR }}>
            Prenez le pouls de votre journée, à deux.
          </Text>
        </View>

        <View className="gap-3.5">
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="heart-outline" size={24} color={HEART_PINK} />
            <Text
              className="text-[18px] font-bold"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              Comment vous sentez-vous aujourd’hui ?
            </Text>
          </View>
          <MoodPicker selectedMood={todayMood} onSelect={handleSelectMood} />
        </View>

        <WeekMoodStrip
          weekDates={weekDates}
          checkinsByDate={checkinsByDate}
          accent={accent}
        />

        {gesture ? (
          <GestureOfTheDayCard body={gesture.body} accent={accent} />
        ) : null}

        <DashedLoopDoodle color={accent} />
      </ScrollView>

      <NeedNoteOverlay
        visible={isOverlayOpen}
        moodEmoji={
          pendingMood ? MOOD_PRESENTATION[pendingMood].imgUrl : undefined
        }
        onSubmit={submitNeed}
        onSkip={closeOverlay}
      />
    </SafeAreaView>
  );
}

/** Lotus du geste du jour (illustration fournie, avec sa propre tuile). */
const GESTURE_ICON = require('@/assets/images/Icon_geste.png');

/**
 * Geste du jour en carte illustrée : lotus sur sa tuile (illustration
 * fournie, demande explicite — remplace l'émoji propre à chaque geste),
 * entouré d'un cœur et de petits traits, pastille « Geste du jour », texte
 * en grand, puis un rappel qu'il change chaque jour. Le même geste reste
 * affiché toute la journée (`pickGestureOfTheDay`).
 */
function GestureOfTheDayCard({
  body,
  accent,
}: {
  body: string;
  accent: string;
}) {
  return (
    <View
      className="gap-4 overflow-hidden rounded-[32px] px-5 pb-5 pt-5"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      {/* Tache décorative en haut à droite de la carte. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -50,
          top: -40,
          width: 170,
          height: 150,
          borderRadius: 85,
          backgroundColor: lightenHex(accent, 0.6),
          opacity: 0.35,
        }}
      />

      <View className="flex-row items-center gap-4">
        <View className="h-[84px] w-[84px] items-center justify-center">
          <Image
            source={GESTURE_ICON}
            style={{ width: 84, height: 84 }}
            resizeMode="contain"
          />
          <Ionicons
            name="heart"
            size={16}
            color={HEART_PINK}
            style={{
              position: 'absolute',
              right: -4,
              top: -2,
              transform: [{ rotate: '12deg' }],
            }}
          />
          <SparkLines
            color={hexToRgba(accent, 0.6)}
            style={{ left: -14, bottom: -6, transform: [{ rotate: '200deg' }] }}
          />
        </View>

        <View className="flex-1 items-start gap-2">
          <View
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: hexToRgba(accent, 0.1) }}
          >
            <Ionicons name="sparkles" size={13} color={accent} />
            <Text
              className="text-[11.5px] font-bold"
              style={{ color: accent, letterSpacing: 0.8 }}
            >
              GESTE DU JOUR
            </Text>
          </View>
          <Text className="text-[12.5px]" style={{ color: GLASS_BODY_COLOR }}>
            Une petite attention à offrir aujourd’hui
          </Text>
        </View>
      </View>

      <Text
        className="text-[18px] font-bold leading-6"
        style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.2 }}
      >
        {body}
      </Text>

      <View className="flex-row items-center gap-1.5">
        <Ionicons name="refresh" size={13} color="#a3a1b0" />
        <Text className="text-[12px]" style={{ color: '#a3a1b0' }}>
          Un nouveau geste vous attend demain.
        </Text>
      </View>
    </View>
  );
}

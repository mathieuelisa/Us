import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { MoodPicker } from '@/components/together/mood-picker';
import { NeedNoteOverlay } from '@/components/together/need-note-overlay';
import { WeekMoodStrip } from '@/components/together/week-mood-strip';
import { useMyHousehold } from '@/features/household/hooks';
import type { MoodValue } from '@/features/hub/api';
import { MOOD_PRESENTATION, ROLE_BACKGROUND } from '@/features/hub/constants';
import { getCurrentWeekIsoDates } from '@/features/together/api';
import { getGestureEmoji } from '@/features/together/constants';
import {
  useGestureOfTheDay,
  useMyWeekCheckins,
  useUpsertMoodCheckin,
} from '@/features/together/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';
import { todayIso } from '@/lib/date';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écran 3a/3g — pilier Ensemble.
 *
 * ⚠️ Interface volontairement symétrique pour l'instant (demande
 * explicite) : CONCEPT.md décrit une vue différente par rôle, mais
 * l'asymétrie complète est reportée à une passe dédiée. Le contenu (geste
 * du jour) reste personnalisé par rôle — même écran, pool de suggestions
 * différent — ce n'est pas encore « l'interface du co-parent ».
 */
export default function TogetherScreen() {
  const router = useRouter();
  const { data: household } = useMyHousehold();
  const role = useAtomValue(currentRoleAtom) ?? 'pregnant';
  const weekDates = getCurrentWeekIsoDates();

  const { data: checkinsByDate = {} } = useMyWeekCheckins(household);
  const { data: gesture } = useGestureOfTheDay(role);
  const upsertCheckin = useUpsertMoodCheckin(household);

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
      className="flex-1"
      style={{ backgroundColor: ROLE_BACKGROUND[role] }}
    >
      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {router.canGoBack() ? (
          <Pressable
            accessibilityLabel="Revenir en arrière"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-[17px] leading-[20px] text-[#1a1a1a]">‹</Text>
          </Pressable>
        ) : null}

        <Text className="text-[26px] font-bold text-[#1a1a1a]">Ensemble</Text>

        <View className="gap-3">
          <Text className="text-[15px] font-medium text-[#1a1a1a]">
            Comment vous sentez-vous aujourd’hui ?
          </Text>
          <MoodPicker selectedMood={todayMood} onSelect={handleSelectMood} />
        </View>

        <View className="gap-3">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            CETTE SEMAINE
          </Text>
          <WeekMoodStrip
            weekDates={weekDates}
            checkinsByDate={checkinsByDate}
          />
        </View>

        {gesture ? (
          <View className="gap-2 rounded-[16px] border border-[#ececec] bg-white px-4 py-4">
            <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
              GESTE DU JOUR
            </Text>
            <View className="flex-row items-start gap-3">
              <Text className="text-[26px]">
                {getGestureEmoji(gesture.body)}
              </Text>
              <Text className="flex-1 text-[15px] leading-5 text-[#1a1a1a]">
                {gesture.body}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <NeedNoteOverlay
        visible={isOverlayOpen}
        moodEmoji={pendingMood ? MOOD_PRESENTATION[pendingMood].emoji : ''}
        onSubmit={submitNeed}
        onSkip={closeOverlay}
      />
    </SafeAreaView>
  );
}

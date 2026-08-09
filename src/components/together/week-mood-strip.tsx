import { Text, View } from 'react-native';

import type { MoodValue } from '@/features/hub/api';
import { MOOD_PRESENTATION } from '@/features/hub/constants';
import { todayIso } from '@/lib/date';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * Tendance hebdomadaire **qualitative** : un emoji par jour, jamais un
 * chiffre ni une hauteur de barre — DOCS/02-ACTION-PLAN.md §1.4 corrige
 * explicitement la maquette sur ce point (graphique à barres à ne pas
 * reproduire). Un emoji par jour reste qualitatif ; une hauteur suggère une
 * échelle numérique sous-jacente.
 */
export function WeekMoodStrip({
  weekDates,
  checkinsByDate,
}: {
  weekDates: string[];
  checkinsByDate: Record<string, MoodValue>;
}) {
  const today = todayIso();

  return (
    <View className="flex-row justify-between">
      {weekDates.map((date, index) => {
        const mood = checkinsByDate[date];
        const isToday = date === today;

        return (
          <View key={date} className="items-center gap-1.5">
            <Text
              className={`text-[11px] font-medium ${isToday ? 'text-accent' : 'text-[#9a9a9a]'}`}
            >
              {DAY_LETTERS[index]}
            </Text>
            <View
              className={`h-9 w-9 items-center justify-center rounded-full ${
                isToday ? 'bg-accent/10' : 'bg-[#f4f4f4]'
              }`}
            >
              <Text className="text-[15px]">
                {mood ? MOOD_PRESENTATION[mood].emoji : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

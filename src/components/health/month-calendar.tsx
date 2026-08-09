import { Pressable, Text, View } from 'react-native';

import { formatMonthTitle } from '@/features/health/constants';
import { todayIso, toLocalIsoDate } from '@/lib/date';

// Les initiales se répètent (M pour mardi et mercredi) : chaque colonne
// porte donc sa propre clé, plutôt que de s'appuyer sur sa position.
const WEEK_DAYS = [
  { key: 'lundi', letter: 'L' },
  { key: 'mardi', letter: 'M' },
  { key: 'mercredi', letter: 'M' },
  { key: 'jeudi', letter: 'J' },
  { key: 'vendredi', letter: 'V' },
  { key: 'samedi', letter: 'S' },
  { key: 'dimanche', letter: 'D' },
];

type GridCell = { key: string; isoDate: string | null };

/**
 * Grille du mois, semaine commençant le lundi (convention française).
 * Renvoie 42 cases pour garder une hauteur stable d'un mois à l'autre —
 * sinon la liste en dessous sauterait à chaque changement de mois.
 *
 * Les clés sont produites ici plutôt que dans le rendu : les cases vides
 * n'ont pas de date pour les identifier, mais leur position dans la grille
 * d'un mois donné est stable.
 */
function getMonthGrid(year: number, month: number): GridCell[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const leadingBlanks = (firstDay + 6) % 7; // dimanche (0) → 6 blancs
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayNumber = index - leadingBlanks + 1;
    const isVisibleDay = dayNumber >= 1 && dayNumber <= daysInMonth;

    return {
      key: `${year}-${month}-${index}`,
      isoDate: isVisibleDay
        ? toLocalIsoDate(new Date(year, month - 1, dayNumber))
        : null,
    };
  });
}

export function MonthCalendar({
  year,
  month,
  markedDates = [],
  selectedDate,
  onSelectDate,
  onChangeMonth,
}: {
  year: number;
  month: number;
  markedDates?: string[];
  selectedDate?: string | null;
  onSelectDate?: (isoDate: string) => void;
  onChangeMonth: (delta: -1 | 1) => void;
}) {
  const grid = getMonthGrid(year, month);
  const today = todayIso();

  return (
    <View className="gap-3 rounded-[16px] bg-white px-4 py-4">
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityLabel="Mois précédent"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => onChangeMonth(-1)}
          className="h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4]"
        >
          <Text className="text-[16px] text-[#1a1a1a]">‹</Text>
        </Pressable>

        <Text className="text-[15px] font-semibold text-[#1a1a1a]">
          {formatMonthTitle(year, month)}
        </Text>

        <Pressable
          accessibilityLabel="Mois suivant"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => onChangeMonth(1)}
          className="h-8 w-8 items-center justify-center rounded-full bg-[#f4f4f4]"
        >
          <Text className="text-[16px] text-[#1a1a1a]">›</Text>
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEK_DAYS.map((day) => (
          <View key={day.key} className="flex-1 items-center">
            <Text className="text-[11px] font-medium text-[#9a9a9a]">
              {day.letter}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {grid.map(({ key, isoDate }) => {
          if (!isoDate) {
            return (
              <View
                key={key}
                className="h-10 items-center justify-center"
                style={{ width: `${100 / 7}%` }}
              />
            );
          }

          const dayNumber = Number(isoDate.slice(-2));
          const isToday = isoDate === today;
          const isSelected = isoDate === selectedDate;
          const isMarked = markedDates.includes(isoDate);

          return (
            <Pressable
              key={isoDate}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              disabled={!onSelectDate}
              onPress={() => onSelectDate?.(isoDate)}
              className="h-10 items-center justify-center"
              style={{ width: `${100 / 7}%` }}
            >
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  isSelected
                    ? 'bg-accent'
                    : isToday
                      ? 'bg-accent/10'
                      : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-[13px] ${
                    isSelected
                      ? 'font-medium text-accent-foreground'
                      : 'text-[#1a1a1a]'
                  }`}
                >
                  {dayNumber}
                </Text>
              </View>
              {isMarked ? (
                <View className="absolute bottom-0.5 h-1 w-1 rounded-full bg-accent" />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

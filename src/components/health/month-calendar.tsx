import { Ionicons } from '@expo/vector-icons';
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

/**
 * Couleurs du style « pastille teintée » (demande explicite), en variables
 * pour pouvoir les changer facilement : teinte de fond des jours avec
 * rendez-vous, et accent de leur chiffre.
 */
export const CALENDAR_TINT = '#D3EADF';
export const CALENDAR_ACCENT = '#1F4D40';
const INK = '#161616';
const HOVER_BG = '#F2F2F2';
const PILL_SIZE = 44;

const MONTH_NAMES = new Intl.DateTimeFormat('fr-FR', { month: 'long' });

/** « 16 novembre, 2 rendez-vous » ou « 13 novembre, aujourd'hui ». */
function dayAccessibilityLabel(
  isoDate: string,
  appointmentCount: number,
  isToday: boolean,
): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const parts = [
    `${day} ${MONTH_NAMES.format(new Date(year, month - 1, day))}`,
  ];
  if (isToday) parts.push('aujourd’hui');
  if (appointmentCount > 0) {
    parts.push(`${appointmentCount} rendez-vous`);
  }
  return parts.join(', ');
}

/**
 * Calendrier mensuel des rendez-vous, style « pastille teintée » (demande
 * explicite) : un jour avec rendez-vous est une pastille ronde vert clair
 * au chiffre vert foncé et gras, aujourd'hui est cerclé d'un trait fin
 * (par-dessus la pastille s'il a aussi un rendez-vous), les autres jours
 * restent sobres. Légende sous la grille.
 *
 * `markedDates` contient une date par rendez-vous : un jour qui y figure
 * deux fois a deux rendez-vous (libellé d'accessibilité).
 */
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
  const appointmentCounts = new Map<string, number>();
  for (const date of markedDates) {
    appointmentCounts.set(date, (appointmentCounts.get(date) ?? 0) + 1);
  }

  return (
    <View
      className="gap-3 rounded-[24px] bg-white px-4 py-4"
      style={{
        shadowColor: INK,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center justify-between">
        <MonthArrow direction="previous" onPress={() => onChangeMonth(-1)} />
        <Text className="text-[15px] font-semibold" style={{ color: INK }}>
          {formatMonthTitle(year, month)}
        </Text>
        <MonthArrow direction="next" onPress={() => onChangeMonth(1)} />
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
              <View key={key} style={{ width: `${100 / 7}%`, height: 56 }} />
            );
          }

          const dayNumber = Number(isoDate.slice(-2));
          const isToday = isoDate === today;
          const isSelected = isoDate === selectedDate;
          const appointmentCount = appointmentCounts.get(isoDate) ?? 0;
          const hasAppointment = appointmentCount > 0;

          return (
            <Pressable
              key={isoDate}
              accessibilityRole="button"
              accessibilityLabel={dayAccessibilityLabel(
                isoDate,
                appointmentCount,
                isToday,
              )}
              accessibilityState={{ selected: isSelected }}
              disabled={!onSelectDate}
              onPress={() => onSelectDate?.(isoDate)}
              className="items-center justify-center"
              style={{ width: `${100 / 7}%`, height: 56 }}
            >
              {(state) => {
                // `hovered` n'existe que sur le web (react-native-web).
                const isHovered = Boolean(
                  (state as { hovered?: boolean }).hovered,
                );
                return (
                  <View
                    className="items-center justify-center rounded-full"
                    style={{
                      width: PILL_SIZE,
                      height: PILL_SIZE,
                      backgroundColor: isSelected
                        ? CALENDAR_ACCENT
                        : hasAppointment
                          ? CALENDAR_TINT
                          : isHovered
                            ? HOVER_BG
                            : 'transparent',
                      borderWidth: isToday ? 1.5 : 0,
                      borderColor: INK,
                      opacity: state.pressed ? 0.7 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected
                          ? '#ffffff'
                          : hasAppointment
                            ? CALENDAR_ACCENT
                            : INK,
                        fontWeight:
                          hasAppointment || isSelected
                            ? '700'
                            : isToday
                              ? '600'
                              : '400',
                      }}
                    >
                      {dayNumber}
                    </Text>
                  </View>
                );
              }}
            </Pressable>
          );
        })}
      </View>

      <View className="h-px" style={{ backgroundColor: '#EFEFEF' }} />
      <View className="flex-row items-center gap-5 px-1">
        <View className="flex-row items-center gap-2">
          <View
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: CALENDAR_TINT }}
          />
          <Text className="text-[13px]" style={{ color: '#6B6B6B' }}>
            Rendez-vous
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className="h-3.5 w-3.5 rounded-full"
            style={{ borderWidth: 1.5, borderColor: INK }}
          />
          <Text className="text-[13px]" style={{ color: '#6B6B6B' }}>
            Aujourd’hui
          </Text>
        </View>
      </View>
    </View>
  );
}

/** Bouton rond de 44 px, fond gris clair, chevron en trait. */
function MonthArrow({
  direction,
  onPress,
}: {
  direction: 'previous' | 'next';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={
        direction === 'previous' ? 'Mois précédent' : 'Mois suivant'
      }
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
      style={{ backgroundColor: HOVER_BG }}
    >
      <Ionicons
        name={direction === 'previous' ? 'chevron-back' : 'chevron-forward'}
        size={20}
        color={INK}
      />
    </Pressable>
  );
}

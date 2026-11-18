import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import { formatMonthTitle } from '@/features/health/constants';
import { formatDayMonth, getWeekdayLetters } from '@/i18n/format';
import { useLocale } from '@/i18n/hooks';
import { hexToRgba } from '@/lib/color';
import { todayIso, toLocalIsoDate } from '@/lib/date';

const WEEK_DAY_KEYS = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
] as const;

const DAY_SIZE = 42;
/*
 * Rayons écrits en clair plutôt que `rounded-full` : Android perd le rayon
 * 99999 d'Uniwind quand le style d'une vue change (jour choisi).
 */
const DAY_RADIUS = DAY_SIZE / 2;
const ARROW_SIZE = 40;
const DISABLED_INK = '#cfcfd6';

type MonthRef = { year: number; month: number };

/**
 * Calendrier de **sélection** d'une date (demande explicite pour l'étape 3
 * de l'onboarding, « plus simple » que la molette, d'après une capture de
 * référence) : carte blanche, mois en titre entre deux flèches rondes,
 * jours L → D, le jour choisi en rond plein à la couleur du thème,
 * aujourd'hui cerclé. Les jours hors de `minDate` / `maxDate` sont
 * estompés et ne se touchent pas ; les flèches s'arrêtent aux mois
 * permis.
 *
 * Distinct de `MonthCalendar` (onglet Rendez-vous), qui marque des
 * rendez-vous avec sa légende plutôt que de choisir une date.
 */
export function DatePickerCalendar({
  value,
  onChange,
  accent,
  minDate,
  maxDate,
}: {
  value: string | null;
  onChange: (isoDate: string) => void;
  accent: string;
  minDate?: string;
  maxDate?: string;
}) {
  const locale = useLocale();
  const weekdayLetters = getWeekdayLetters(locale);
  const today = todayIso();
  // Mois affiché : celui de la date choisie, à défaut le mois en cours
  // (ramené dans les bornes).
  const [shown, setShown] = useState<MonthRef>(() =>
    clampMonth(toMonth(value ?? minDate ?? today), minDate, maxDate),
  );
  const minMonth = minDate ? toMonth(minDate) : null;
  const maxMonth = maxDate ? toMonth(maxDate) : null;
  const canGoBack = !minMonth || compareMonths(shown, minMonth) > 0;
  const canGoForward = !maxMonth || compareMonths(shown, maxMonth) < 0;

  const changeMonth = (delta: -1 | 1) =>
    setShown((current) => addMonths(current, delta));

  const weeks = getMonthWeeks(shown.year, shown.month);

  return (
    <View
      className="gap-3 px-3 pb-3 pt-4"
      style={{
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center justify-between px-1">
        <MonthArrow
          direction="previous"
          accent={accent}
          isDisabled={!canGoBack}
          onPress={() => changeMonth(-1)}
        />
        <Text
          accessibilityRole="header"
          className="text-[17px] font-bold"
          style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.2 }}
        >
          {formatMonthTitle(shown.year, shown.month, locale)}
        </Text>
        <MonthArrow
          direction="next"
          accent={accent}
          isDisabled={!canGoForward}
          onPress={() => changeMonth(1)}
        />
      </View>

      <View className="flex-row">
        {WEEK_DAY_KEYS.map((dayKey, index) => (
          <View key={dayKey} className="flex-1 items-center">
            <Text className="text-[12px] font-medium text-[#9a9aa3]">
              {weekdayLetters[index]}
            </Text>
          </View>
        ))}
      </View>

      <Animated.View
        key={`${shown.year}-${shown.month}`}
        entering={FadeIn.duration(180)}
        className="gap-1"
      >
        {weeks.map((week) => (
          <View key={week.key} className="flex-row">
            {week.days.map((cell) => {
              if (!cell.isoDate) {
                return <View key={cell.key} className="flex-1" />;
              }
              const isoDate = cell.isoDate;
              const isDisabled = Boolean(
                (minDate && isoDate < minDate) ||
                  (maxDate && isoDate > maxDate),
              );
              return (
                <DayCell
                  key={isoDate}
                  isoDate={isoDate}
                  accent={accent}
                  isSelected={isoDate === value}
                  isToday={isoDate === today}
                  isDisabled={isDisabled}
                  onPress={() => onChange(isoDate)}
                />
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function DayCell({
  isoDate,
  accent,
  isSelected,
  isToday,
  isDisabled,
  onPress,
}: {
  isoDate: string;
  accent: string;
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const [, , day] = isoDate.split('-').map(Number);
  const label = `${formatDayMonth(isoDate, locale)}${
    isToday ? `, ${t('health.calendar.today')}` : ''
  }`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      className="flex-1 items-center justify-center"
      style={{ height: DAY_SIZE + 6 }}
    >
      {(state) => {
        // `hovered` n'existe que sur le web (react-native-web).
        const isHovered = Boolean((state as { hovered?: boolean }).hovered);
        return (
          <View
            className="items-center justify-center"
            style={{
              width: DAY_SIZE,
              height: DAY_SIZE,
              borderRadius: DAY_RADIUS,
              backgroundColor: isSelected
                ? accent
                : isHovered && !isDisabled
                  ? hexToRgba(accent, 0.08)
                  : 'transparent',
              borderWidth: isToday && !isSelected ? 1.5 : 0,
              borderColor: hexToRgba(accent, 0.6),
              opacity: state.pressed ? 0.75 : 1,
              ...(isSelected
                ? {
                    shadowColor: accent,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 5,
                  }
                : null),
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: isSelected ? '800' : isToday ? '700' : '500',
                color: isSelected
                  ? '#ffffff'
                  : isDisabled
                    ? DISABLED_INK
                    : GLASS_TITLE_COLOR,
              }}
            >
              {day}
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}

/** Flèche ronde teintée ; estompée au bout de la plage permise. */
function MonthArrow({
  direction,
  accent,
  isDisabled,
  onPress,
}: {
  direction: 'previous' | 'next';
  accent: string;
  isDisabled: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityLabel={
        direction === 'previous'
          ? t('health.calendar.previousMonth')
          : t('health.calendar.nextMonth')
      }
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={6}
      onPress={onPress}
      className="items-center justify-center active:opacity-70"
      style={{
        width: ARROW_SIZE,
        height: ARROW_SIZE,
        borderRadius: ARROW_SIZE / 2,
        backgroundColor: hexToRgba(accent, 0.08),
        opacity: isDisabled ? 0.35 : 1,
      }}
    >
      <Ionicons
        name={direction === 'previous' ? 'chevron-back' : 'chevron-forward'}
        size={19}
        color={accent}
      />
    </Pressable>
  );
}

/**
 * Semaines du mois (lundi → dimanche), sans rangée vide à la fin : la carte
 * a 4 à 6 lignes selon le mois, comme la capture de référence.
 */
function getMonthWeeks(
  year: number,
  month: number,
): { key: string; days: { key: string; isoDate: string | null }[] }[] {
  const leadingBlanks = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cellCount = Math.ceil((leadingBlanks + daysInMonth) / 7) * 7;

  const cells = Array.from({ length: cellCount }, (_, index) => {
    const dayNumber = index - leadingBlanks + 1;
    return {
      key: `${year}-${month}-${index}`,
      isoDate:
        dayNumber >= 1 && dayNumber <= daysInMonth
          ? toLocalIsoDate(new Date(year, month - 1, dayNumber))
          : null,
    };
  });

  return Array.from({ length: cellCount / 7 }, (_, week) => ({
    key: `${year}-${month}-w${week}`,
    days: cells.slice(week * 7, week * 7 + 7),
  }));
}

function toMonth(isoDate: string): MonthRef {
  const [year, month] = isoDate.split('-').map(Number);
  return { year, month };
}

function compareMonths(a: MonthRef, b: MonthRef): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

function addMonths(ref: MonthRef, delta: number): MonthRef {
  const index = ref.year * 12 + (ref.month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

function clampMonth(ref: MonthRef, minDate?: string, maxDate?: string) {
  if (minDate && compareMonths(ref, toMonth(minDate)) < 0) {
    return toMonth(minDate);
  }
  if (maxDate && compareMonths(ref, toMonth(maxDate)) > 0) {
    return toMonth(maxDate);
  }
  return ref;
}

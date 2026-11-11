import { Ionicons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SPARKS_ABOVE,
  SparkLines,
} from '@/components/ui/glass-card';
import type { MoodValue } from '@/features/hub/api';
import { MOOD_PRESENTATION } from '@/features/hub/constants';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MUTED = '#8f8f99';
const FUTURE = '#c9c9cf';

/**
 * « Cette semaine » du pilier Ensemble.
 *
 * Tendance hebdomadaire **qualitative** : l'humeur reste une illustration
 * par jour, jamais un chiffre ni une hauteur de barre — DOCS/02-ACTION-PLAN.md
 * §1.4 corrige explicitement la maquette sur ce point (graphique à barres à
 * ne pas reproduire). Le numéro sous l'illustration est la date (repère
 * calendaire), pas une valeur d'humeur ; le compteur d'en-tête dit combien
 * de jours ont été notés, pas comment ils se sont passés.
 *
 * Habillage repris de la semaine du Journal (demande explicite, « moderne
 * et design ») : carte blanche, aujourd'hui en gélule d'accent surmontée de
 * petits traits, jours à venir estompés. Chaque jour noté montre l'ourson de
 * l'humeur choisie (mêmes illustrations que le choix du jour) ; un jour
 * passé sans check-in garde un rond en pointillés.
 */
export function WeekMoodStrip({
  weekDates,
  checkinsByDate,
  accent,
}: {
  weekDates: string[];
  checkinsByDate: Record<string, MoodValue>;
  accent: string;
}) {
  const notedDays = weekDates.filter((date) => checkinsByDate[date]).length;

  return (
    <View
      className="gap-4 rounded-[32px] px-3 pb-4 pt-4"
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
      <View className="flex-row items-center justify-between px-2">
        <View className="flex-row items-center gap-2.5">
          <View
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: hexToRgba(accent, 0.1) }}
          >
            <Ionicons name="calendar-outline" size={18} color={accent} />
          </View>
          <Text
            className="text-[17px] font-bold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            Cette semaine
          </Text>
        </View>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: hexToRgba(accent, 0.1) }}
        >
          <Text className="text-[12px] font-bold" style={{ color: accent }}>
            {notedDays} / 7 jours notés
          </Text>
        </View>
      </View>

      <View className="mt-3">
        <WeekMoodDays
          weekDates={weekDates}
          checkinsByDate={checkinsByDate}
          accent={accent}
        />
      </View>
    </View>
  );
}

/**
 * La rangée des 7 jours seule, sans carte ni titre — pour un écran qui a
 * déjà les siens (« Mon partenaire », dans son rose). Mêmes règles :
 * qualitatif, aujourd'hui en gélule d'accent, jours à venir estompés.
 */
export function WeekMoodDays({
  weekDates,
  checkinsByDate,
  accent,
}: {
  weekDates: string[];
  checkinsByDate: Record<string, MoodValue>;
  accent: string;
}) {
  const today = todayIso();

  return (
    <View className="flex-row justify-between">
      {weekDates.map((date, index) => (
        <DayColumn
          key={date}
          letter={DAY_LETTERS[index]}
          dayNumber={Number(date.slice(-2))}
          mood={checkinsByDate[date]}
          isToday={date === today}
          isFuture={date > today}
          accent={accent}
        />
      ))}
    </View>
  );
}

function DayColumn({
  letter,
  dayNumber,
  mood,
  isToday,
  isFuture,
  accent,
}: {
  letter: string;
  dayNumber: number;
  mood: MoodValue | undefined;
  isToday: boolean;
  isFuture: boolean;
  accent: string;
}) {
  const label = mood
    ? `${letter} ${dayNumber} : ${MOOD_PRESENTATION[mood].label}`
    : `${letter} ${dayNumber} : pas de check-in`;

  return (
    <View accessible accessibilityLabel={label} className="items-center">
      {isToday ? (
        <SparkLines
          color={hexToRgba(accent, 0.6)}
          sparks={SPARKS_ABOVE}
          style={{ top: -24, left: 7 }}
        />
      ) : null}
      <View
        className="h-[92px] w-10 items-center justify-between rounded-full py-2"
        style={
          isToday
            ? {
                backgroundColor: accent,
                shadowColor: accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6,
              }
            : undefined
        }
      >
        <Text
          className="text-[12px] font-medium"
          style={{
            color: isToday
              ? 'rgba(255, 255, 255, 0.85)'
              : isFuture
                ? FUTURE
                : MUTED,
          }}
        >
          {letter}
        </Text>

        {mood ? (
          <View
            className="h-9 w-9 items-center justify-center overflow-hidden rounded-full"
            style={{
              backgroundColor: isToday ? '#ffffff' : hexToRgba(accent, 0.08),
            }}
          >
            <Image
              source={MOOD_PRESENTATION[mood].imgUrl}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View
            className="h-9 w-9 rounded-full"
            style={{
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: isToday
                ? 'rgba(255, 255, 255, 0.7)'
                : isFuture
                  ? '#e4e4e8'
                  : '#d4d4da',
              backgroundColor: isFuture ? '#fafafb' : 'transparent',
            }}
          />
        )}

        <Text
          className="text-[13px]"
          style={{
            fontWeight: isToday ? '700' : '500',
            color: isToday ? '#ffffff' : isFuture ? FUTURE : GLASS_BODY_COLOR,
          }}
        >
          {dayNumber}
        </Text>
      </View>
    </View>
  );
}

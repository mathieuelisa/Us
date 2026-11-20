import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SPARKS_ABOVE,
  SparkLines,
} from '@/components/ui/glass-card';
import type { MoodValue } from '@/features/hub/api';
import { getMoodImage, MOOD_PRESENTATION } from '@/features/hub/constants';
import { PARTNER_PINK } from '@/features/partner/constants';
import { capitalizeFirst, getWeekdayLetters } from '@/i18n/format';
import { useLocale } from '@/i18n/hooks';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

const PINK = PARTNER_PINK;
const MUTED = '#8f8f99';
const FUTURE = '#c9c9cf';

/*
 * Rayons écrits en clair plutôt que `rounded-full` : Android perd le rayon
 * 99999 d'Uniwind quand le style d'une vue change (cf. semaine du Journal).
 */
const PILL_RADIUS = 20; // w-10
const BUBBLE_SIZE = 38;

const CARD_SHADOW = {
  shadowColor: PINK.accent,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 4,
} as const;

/**
 * « Son humeur cette semaine » (demande explicite du 2026-11-20) : même
 * principe que « Ses symptômes cette semaine » juste en dessous. Sept
 * colonnes L → D ; seuls les jours où l'autre parent a noté son humeur se
 * touchent. Le jour choisi passe en gélule rose et son détail s'ouvre sous
 * la rangée : l'ourson de l'humeur en grand (illustration de la semaine
 * trop petite pour bien la lire), le nom de l'humeur et une phrase
 * qualitative (« Camille semble au top », au passé pour un jour écoulé :
 * « Camille semblait être au top »), jamais un score.
 *
 * Par défaut, le jour choisi est le plus récent qui a une humeur.
 */
export function WeekMoodCard({
  weekDates,
  checkinsByDate,
  pronoun,
  partnerName,
}: {
  weekDates: string[];
  checkinsByDate: Record<string, MoodValue>;
  /** Pronom de l'autre parent : ours ou ourse (`getMoodImage`). */
  pronoun: string | null;
  partnerName: string | null;
}) {
  const { t } = useTranslation();
  const weekdayLetters = getWeekdayLetters(useLocale());
  const today = todayIso();
  const notedDates = weekDates.filter(
    (date) => date <= today && checkinsByDate[date],
  );
  const latestNoted = notedDates[notedDates.length - 1] ?? null;
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  // Le choix de l'utilisateur tant qu'il est valable, sinon le dernier jour
  // noté (les humeurs arrivent après le premier rendu).
  const selectedDate =
    pickedDate && checkinsByDate[pickedDate] ? pickedDate : latestNoted;
  const who = partnerName || t('partner.yourPartner');

  return (
    <View
      className="gap-4 px-3 pb-4 pt-4"
      style={[
        CARD_SHADOW,
        {
          borderRadius: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.95)',
        },
      ]}
    >
      <View className="flex-row justify-between pt-4">
        {weekDates.map((date, index) => (
          <DayColumn
            key={date}
            letter={weekdayLetters[index]}
            dayNumber={Number(date.slice(-2))}
            mood={checkinsByDate[date]}
            pronoun={pronoun}
            isSelected={date === selectedDate}
            isFuture={date > today}
            onPress={() => setPickedDate(date)}
          />
        ))}
      </View>

      <View className="mx-2 h-px" style={{ backgroundColor: PINK.line }} />

      {selectedDate ? (
        <Animated.View key={selectedDate} entering={FadeIn.duration(220)}>
          <DayDetail
            date={selectedDate}
            mood={checkinsByDate[selectedDate]}
            pronoun={pronoun}
            who={who}
          />
        </Animated.View>
      ) : (
        <View
          className="mx-2 flex-row items-center gap-3 px-3.5 py-3"
          style={{
            borderRadius: 20,
            backgroundColor: hexToRgba(PINK.accent, 0.04),
          }}
        >
          <Text style={{ fontSize: 22 }}>🌱</Text>
          <Text
            className="flex-1 text-[13.5px] leading-[19px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {t('partner.moodWeekEmpty', { name: who })}
          </Text>
        </View>
      )}
    </View>
  );
}

function DayColumn({
  letter,
  dayNumber,
  mood,
  pronoun,
  isSelected,
  isFuture,
  onPress,
}: {
  letter: string;
  dayNumber: number;
  mood: MoodValue | undefined;
  pronoun: string | null;
  isSelected: boolean;
  isFuture: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const label = mood
    ? t('together.week.dayMood', {
        day: `${letter} ${dayNumber}`,
        mood: t(MOOD_PRESENTATION[mood].labelKey),
      })
    : t('together.week.noCheckIn', { day: `${letter} ${dayNumber}` });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected, disabled: !mood }}
      disabled={!mood}
      onPress={onPress}
      hitSlop={4}
      className="items-center"
    >
      {isSelected ? (
        <SparkLines
          color={hexToRgba(PINK.accent, 0.6)}
          sparks={SPARKS_ABOVE}
          style={{ top: -24, left: 7 }}
        />
      ) : null}
      <View
        className="h-[96px] w-10 items-center justify-between py-2"
        style={
          isSelected
            ? {
                borderRadius: PILL_RADIUS,
                backgroundColor: PINK.accent,
                shadowColor: PINK.accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6,
              }
            : { borderRadius: PILL_RADIUS }
        }
      >
        <Text
          className="text-[12px] font-medium"
          style={{
            color: isSelected
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
            className="items-center justify-center overflow-hidden"
            style={{
              width: BUBBLE_SIZE,
              height: BUBBLE_SIZE,
              borderRadius: BUBBLE_SIZE / 2,
              backgroundColor: isSelected ? '#ffffff' : PINK.soft,
            }}
          >
            <Image
              source={getMoodImage(mood, pronoun)}
              style={{ width: BUBBLE_SIZE - 2, height: BUBBLE_SIZE - 2 }}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View
            style={{
              width: BUBBLE_SIZE - 2,
              height: BUBBLE_SIZE - 2,
              borderRadius: (BUBBLE_SIZE - 2) / 2,
              borderWidth: 1.5,
              borderStyle: 'dashed',
              borderColor: isFuture ? '#e4e4e8' : '#d4d4da',
              backgroundColor: isFuture ? '#fafafb' : 'transparent',
            }}
          />
        )}

        <Text
          className="text-[13px]"
          style={{
            fontWeight: isSelected ? '700' : '500',
            color: isSelected
              ? '#ffffff'
              : isFuture
                ? FUTURE
                : GLASS_BODY_COLOR,
          }}
        >
          {dayNumber}
        </Text>
      </View>
    </Pressable>
  );
}

/** Détail du jour choisi : ourson en grand, humeur et petite phrase. */
function DayDetail({
  date,
  mood,
  pronoun,
  who,
}: {
  date: string;
  mood: MoodValue;
  pronoun: string | null;
  who: string;
}) {
  const { t } = useTranslation();
  const locale = useLocale();
  const presentation = MOOD_PRESENTATION[mood];

  return (
    <View className="flex-row items-center gap-4 px-2">
      <View
        className="h-[96px] w-[96px] items-center justify-center overflow-hidden"
        style={{
          backgroundColor: PINK.soft,
          borderTopLeftRadius: 42,
          borderTopRightRadius: 32,
          borderBottomRightRadius: 44,
          borderBottomLeftRadius: 30,
        }}
      >
        <Image
          source={getMoodImage(mood, pronoun)}
          style={{ width: 84, height: 84 }}
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 gap-1.5">
        <Text className="text-[13px] font-semibold" style={{ color: MUTED }}>
          {formatDayTitle(date, locale)}
        </Text>
        <View
          className="self-start px-2.5 py-1"
          style={{ borderRadius: 12, backgroundColor: PINK.tag }}
        >
          <Text
            className="text-[12.5px] font-bold"
            style={{ color: PINK.tagText }}
          >
            {t(presentation.labelKey)}
          </Text>
        </View>
        <Text
          className="text-[15px] font-semibold leading-[21px]"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {/* Au passé pour un jour déjà écoulé (demande explicite). */}
          {`${who} ${t(
            date < todayIso()
              ? presentation.pastPhraseKey
              : presentation.phraseKey,
          )}`}
        </Text>
      </View>
    </View>
  );
}

/** « Mardi 17 novembre », « Tuesday 17 November », « Martes, 17 de noviembre ». */
function formatDayTitle(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return capitalizeFirst(
    new Date(year, month - 1, day).toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    locale,
  );
}

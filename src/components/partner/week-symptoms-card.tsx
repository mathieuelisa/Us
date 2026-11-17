import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SPARKS_ABOVE,
  SparkLines,
} from '@/components/ui/glass-card';
import {
  getSymptomLabel,
  getSymptomVisual,
  NO_SYMPTOM,
  withoutNoSymptom,
} from '@/features/health/constants';
import { getSymptomTips } from '@/features/health/symptom-tips';
import { PARTNER_PINK } from '@/features/partner/constants';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

const PINK = PARTNER_PINK;
const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const WEEKDAYS = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
];
const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];
const MUTED = '#8f8f99';
const FUTURE = '#c9c9cf';
/** À partir de combien de jours un symptôme « revient souvent ». */
const RECURRING_MIN_DAYS = 3;

/*
 * Rayons écrits en clair plutôt que `rounded-full` : Android perd le rayon
 * 99999 d'Uniwind quand le style d'une vue change (cf. semaine du Journal).
 */
const PILL_RADIUS = 20; // w-10
const BUBBLE_RADIUS = 18; // h-9 w-9

const CARD_SHADOW = {
  shadowColor: PINK.accent,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 4,
} as const;

/**
 * « Ses symptômes cette semaine » (demande explicite) : le co-parent voit,
 * jour par jour, les symptômes notés par la personne enceinte dans son
 * Journal — en lecture seule, avec le geste d'aide qui va avec.
 *
 * Même vocabulaire que la semaine des humeurs juste au-dessus : sept
 * colonnes L → D, le jour choisi en gélule rose surmontée de petits traits,
 * jours à venir estompés. Chaque jour noté montre l'émoji de son premier
 * symptôme sur sa teinte (+N s'il y en a d'autres), un sourire pour « Pas
 * de symptômes », un rond en pointillés si rien n'a été noté.
 *
 * Toucher un jour ouvre son détail sous la rangée : les symptômes en
 * pastilles, puis les conseils « pour l'aider » du hub
 * (`getSymptomTips`, version co-parent). Rien de chiffré au-delà du
 * nombre de jours (même parti pris qualitatif que l'humeur) : au plus,
 * « Revient souvent » quand un symptôme a été noté 3 jours ou plus.
 */
export function WeekSymptomsCard({
  weekDates,
  symptomsByDate,
  partnerName,
}: {
  weekDates: string[];
  symptomsByDate: Record<string, string[]>;
  /** Prénom de la personne enceinte, s'il est connu. */
  partnerName: string | null;
}) {
  const today = todayIso();
  const [selectedDate, setSelectedDate] = useState(today);
  const recurring = getRecurringSymptom(weekDates, symptomsByDate);
  const who = partnerName || 'Elle';

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
      {recurring ? <RecurringPill {...recurring} /> : null}

      <View className="flex-row justify-between pt-4">
        {weekDates.map((date, index) => (
          <DayColumn
            key={date}
            letter={DAY_LETTERS[index]}
            dayNumber={Number(date.slice(-2))}
            symptoms={symptomsByDate[date]}
            isSelected={date === selectedDate}
            isFuture={date > today}
            onPress={() => setSelectedDate(date)}
          />
        ))}
      </View>

      <View className="mx-2 h-px" style={{ backgroundColor: PINK.line }} />

      <Animated.View key={selectedDate} entering={FadeIn.duration(220)}>
        <DayDetail
          date={selectedDate}
          symptoms={symptomsByDate[selectedDate]}
          who={who}
        />
      </Animated.View>
    </View>
  );
}

function DayColumn({
  letter,
  dayNumber,
  symptoms,
  isSelected,
  isFuture,
  onPress,
}: {
  letter: string;
  dayNumber: number;
  symptoms: string[] | undefined;
  isSelected: boolean;
  isFuture: boolean;
  onPress: () => void;
}) {
  const realSymptoms = symptoms ? withoutNoSymptom(symptoms) : [];
  const isSymptomFree = Boolean(symptoms?.includes(NO_SYMPTOM));
  const label =
    realSymptoms.length > 0
      ? `${letter} ${dayNumber} : ${realSymptoms.map(getSymptomLabel).join(', ')}`
      : isSymptomFree
        ? `${letter} ${dayNumber} : pas de symptômes`
        : `${letter} ${dayNumber} : rien de noté`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected, disabled: isFuture }}
      disabled={isFuture}
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
        className="h-[92px] w-10 items-center justify-between py-2"
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

        <DayBubble
          symptoms={realSymptoms}
          isSymptomFree={isSymptomFree}
          isSelected={isSelected}
          isFuture={isFuture}
        />

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

/** Rond du jour : premier symptôme (+N), sourire, ou pointillés. */
function DayBubble({
  symptoms,
  isSymptomFree,
  isSelected,
  isFuture,
}: {
  symptoms: string[];
  isSymptomFree: boolean;
  isSelected: boolean;
  isFuture: boolean;
}) {
  if (symptoms.length === 0 && !isSymptomFree) {
    return (
      <View
        className="h-9 w-9"
        style={{
          borderRadius: BUBBLE_RADIUS,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: isSelected
            ? 'rgba(255, 255, 255, 0.7)'
            : isFuture
              ? '#e4e4e8'
              : '#d4d4da',
          backgroundColor: isFuture ? '#fafafb' : 'transparent',
        }}
      />
    );
  }

  const visual = getSymptomVisual(symptoms[0] ?? NO_SYMPTOM);
  const extra = symptoms.length - 1;

  return (
    <View>
      <View
        className="h-9 w-9 items-center justify-center"
        style={{
          borderRadius: BUBBLE_RADIUS,
          backgroundColor: isSelected ? '#ffffff' : visual.tint,
        }}
      >
        <Text style={{ fontSize: 17 }}>{visual.emoji}</Text>
      </View>
      {extra > 0 ? (
        <View
          className="absolute h-[18px] min-w-[18px] items-center justify-center px-1"
          style={{
            right: -6,
            bottom: -4,
            borderRadius: 9,
            backgroundColor: isSelected ? '#ffffff' : PINK.accent,
            borderWidth: 1.5,
            borderColor: isSelected ? PINK.accent : '#ffffff',
          }}
        >
          <Text
            className="text-[9.5px] font-extrabold"
            style={{ color: isSelected ? PINK.accent : '#ffffff' }}
          >
            +{extra}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Détail du jour choisi : pastilles de symptômes, puis gestes d'aide. */
function DayDetail({
  date,
  symptoms,
  who,
}: {
  date: string;
  symptoms: string[] | undefined;
  who: string;
}) {
  const realSymptoms = symptoms ? withoutNoSymptom(symptoms) : [];
  const isSymptomFree = Boolean(symptoms?.includes(NO_SYMPTOM));
  const tips = getSymptomTips(realSymptoms, 'partner');

  return (
    <View className="gap-3 px-2">
      <View className="flex-row items-center justify-between gap-3">
        <Text
          className="text-[16px] font-bold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {formatDayTitle(date)}
        </Text>
        {realSymptoms.length > 0 ? (
          <View
            className="px-2.5 py-1"
            style={{ borderRadius: 12, backgroundColor: PINK.tag }}
          >
            <Text
              className="text-[12px] font-bold"
              style={{ color: PINK.tagText }}
            >
              {realSymptoms.length} symptôme
              {realSymptoms.length > 1 ? 's' : ''}
            </Text>
          </View>
        ) : null}
      </View>

      {realSymptoms.length > 0 ? (
        <>
          <View className="flex-row flex-wrap gap-2">
            {realSymptoms.map((symptom) => {
              const visual = getSymptomVisual(symptom);
              return (
                <View
                  key={symptom}
                  className="flex-row items-center gap-1.5 py-1.5 pl-1.5 pr-3"
                  style={{
                    borderRadius: 18,
                    backgroundColor: hexToRgba(PINK.accent, 0.05),
                    borderWidth: 1,
                    borderColor: PINK.line,
                  }}
                >
                  <View
                    className="h-7 w-7 items-center justify-center"
                    style={{ borderRadius: 14, backgroundColor: visual.tint }}
                  >
                    <Text style={{ fontSize: 14 }}>{visual.emoji}</Text>
                  </View>
                  <Text
                    className="text-[13.5px] font-semibold"
                    style={{ color: GLASS_TITLE_COLOR }}
                  >
                    {getSymptomLabel(symptom)}
                  </Text>
                </View>
              );
            })}
          </View>

          {tips.map((tip) => (
            <View
              key={tip.symptom}
              className="flex-row gap-3 px-3.5 py-3"
              style={{
                borderRadius: 20,
                backgroundColor: hexToRgba(PINK.accent, 0.06),
              }}
            >
              <View
                className="h-9 w-9 items-center justify-center bg-white"
                style={{ borderRadius: 18 }}
              >
                <Ionicons name="heart-outline" size={17} color={PINK.accent} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text
                  className="text-[11px] font-bold"
                  style={{ color: PINK.tagText, letterSpacing: 1 }}
                >
                  POUR L’AIDER · {getSymptomLabel(tip.symptom).toUpperCase()}
                </Text>
                <Text
                  className="text-[13.5px] leading-[19px]"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  {tip.text}
                </Text>
              </View>
            </View>
          ))}
        </>
      ) : (
        <View
          className="flex-row items-center gap-3 px-3.5 py-3"
          style={{
            borderRadius: 20,
            backgroundColor: isSymptomFree
              ? hexToRgba('#3f9b5a', 0.07)
              : hexToRgba(PINK.accent, 0.04),
          }}
        >
          <Text style={{ fontSize: 22 }}>{isSymptomFree ? '😊' : '📝'}</Text>
          <Text
            className="flex-1 text-[13.5px] leading-[19px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {isSymptomFree
              ? `${who} a noté une journée sans symptôme.`
              : `${who} n’a rien noté ce jour-là.`}
          </Text>
        </View>
      )}
    </View>
  );
}

/** « Revient souvent : 😴 Fatigue · 4 jours », en tête de carte. */
function RecurringPill({ symptom, days }: { symptom: string; days: number }) {
  const visual = getSymptomVisual(symptom);
  return (
    <View
      className="flex-row items-center gap-2 self-start py-1.5 pl-2 pr-3"
      style={{ borderRadius: 16, backgroundColor: PINK.tag }}
    >
      <Ionicons name="repeat" size={14} color={PINK.tagText} />
      <Text className="text-[12.5px]" style={{ color: PINK.tagText }}>
        Revient souvent :{' '}
        <Text className="font-bold">
          {visual.emoji} {getSymptomLabel(symptom)}
        </Text>{' '}
        · {days} jours
      </Text>
    </View>
  );
}

/** Symptôme noté le plus de jours, s'il l'a été au moins 3 jours. */
function getRecurringSymptom(
  weekDates: string[],
  symptomsByDate: Record<string, string[]>,
): { symptom: string; days: number } | null {
  const counts = new Map<string, number>();
  for (const date of weekDates) {
    for (const symptom of withoutNoSymptom(symptomsByDate[date] ?? [])) {
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1);
    }
  }
  let best: { symptom: string; days: number } | null = null;
  for (const [symptom, days] of counts) {
    if (days >= RECURRING_MIN_DAYS && (!best || days > best.days)) {
      best = { symptom, days };
    }
  }
  return best;
}

/** « Mardi 17 novembre ». */
function formatDayTitle(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${weekday} ${day} ${MONTHS[month - 1]}`;
}

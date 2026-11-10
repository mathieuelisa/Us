import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  DashedLoopDoodle,
  GLASS_TITLE_COLOR,
  SPARKS_ABOVE,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { SYMPTOM_OPTIONS } from '@/features/health/constants';
import {
  useSaveSymptoms,
  useSymptomDates,
  useSymptomsForDate,
} from '@/features/health/hooks';
import type { Household } from '@/features/household/api';
import { useThemeAccent } from '@/features/settings/hooks';
import { getCurrentWeekIsoDates } from '@/features/together/api';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const HEART_PINK = '#e8739a';
const MUTED = '#8f8f99';
const FUTURE = '#c9c9cf';

/**
 * Pictogramme et teinte de fond de chaque symptôme : ils rendent la liste
 * lisible d'un coup d'œil. Purement visuel — la valeur stockée reste celle
 * de `SYMPTOM_OPTIONS`. Repli neutre pour un symptôme ajouté sans entrée ici.
 */
const SYMPTOM_VISUALS: Record<string, { emoji: string; tint: string }> = {
  vomissements: { emoji: '🤮', tint: '#e3f3e4' },
  vertiges: { emoji: '😵‍💫', tint: '#ece6f7' },
  mal_de_dos: { emoji: '🦴', tint: '#fbe5d6' },
  fatigue: { emoji: '😴', tint: '#e3ecf8' },
  reflux_gastrique: { emoji: '🔥', tint: '#fde6d8' },
  bouffees_de_chaleur: { emoji: '🌡️', tint: '#fbe0e4' },
  insomnies: { emoji: '🛌', tint: '#e6e7f8' },
  nausees: { emoji: '🤢', tint: '#e0f2ec' },
};
const FALLBACK_VISUAL = { emoji: '•', tint: '#f0f0f3' };

const CARD_SHADOW_TINTED = (accent: string) =>
  ({
    shadowColor: accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  }) as const;

/**
 * Écran 4a — Journal des symptômes.
 *
 * Habillage d'après une capture de référence (demande explicite, « moderne
 * mais simple à comprendre ») : semaine dans une carte blanche où le jour
 * choisi devient une gélule d'accent surmontée de petits traits, symptômes
 * en pastilles illustrées (pictogramme sur rond teinté), grand bouton
 * « Enregistrer » en gélule.
 *
 * Donnée de santé : cet onglet n'est monté que pour la personne enceinte
 * (cf. `sante.tsx`), et la RLS refuse de toute façon l'écriture au
 * co-parent. Deux barrières indépendantes, volontairement.
 */
export function JournalTab({
  household,
}: {
  household: Household | null | undefined;
}) {
  const accent = useThemeAccent();
  const weekDates = getCurrentWeekIsoDates();
  const today = todayIso();
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: savedSymptoms } = useSymptomsForDate(household, selectedDate);
  const { data: markedDates = [] } = useSymptomDates(household, weekDates);
  const saveSymptoms = useSaveSymptoms(household);

  const [selected, setSelected] = useState<string[]>([]);

  // Resynchronise à chaque changement de jour ou d'arrivée des données :
  // sans ça, passer du mardi au mercredi garderait les cases du mardi.
  useEffect(() => {
    setSelected(savedSymptoms ?? []);
  }, [savedSymptoms]);

  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );

  const isDirty =
    JSON.stringify([...selected].sort()) !==
    JSON.stringify([...(savedSymptoms ?? [])].sort());
  const isSaveDisabled = !isDirty || saveSymptoms.isPending;

  return (
    <View className="gap-7">
      <View
        className="flex-row justify-between rounded-[32px] px-3 py-4"
        style={[
          CARD_SHADOW_TINTED(accent),
          { backgroundColor: 'rgba(255, 255, 255, 0.92)' },
        ]}
      >
        {weekDates.map((date, index) => (
          <DayPill
            key={date}
            letter={DAY_LETTERS[index]}
            dayNumber={Number(date.slice(-2))}
            isSelected={date === selectedDate}
            // On ne déclare pas un état à venir : les jours après
            // aujourd'hui sont grisés et non sélectionnables (dates ISO →
            // comparaison lexicographique fiable).
            isFuture={date > today}
            hasSymptoms={markedDates.includes(date)}
            accent={accent}
            onPress={() => setSelectedDate(date)}
          />
        ))}
      </View>

      <View className="gap-4">
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="heart-outline" size={24} color={HEART_PINK} />
          <Text
            className="text-[18px] font-bold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            Des symptômes{' '}
            {selectedDate === today ? 'aujourd’hui' : 'ce jour-là'} ?
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2.5">
          {SYMPTOM_OPTIONS.map((option) => (
            <SymptomChip
              key={option.value}
              label={option.label}
              visual={SYMPTOM_VISUALS[option.value] ?? FALLBACK_VISUAL}
              isSelected={selected.includes(option.value)}
              accent={accent}
              onPress={() => toggle(option.value)}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <PillButton
          label={saveSymptoms.isPending ? 'Enregistrement…' : 'Enregistrer'}
          icon="save-outline"
          isDisabled={isSaveDisabled}
          onPress={() =>
            saveSymptoms.mutate({ logDate: selectedDate, symptoms: selected })
          }
        />

        {saveSymptoms.isError ? (
          <Text className="text-center text-[12.5px] text-red-600">
            Impossible d’enregistrer pour le moment.
          </Text>
        ) : null}
      </View>

      <DashedLoopDoodle color={accent} />
    </View>
  );
}

/**
 * Un jour de la semaine. Au repos : lettre au-dessus d'un rond gris. Choisi :
 * une gélule d'accent qui englobe lettre et numéro, surmontée de petits
 * traits. Un point sous le jour signale des symptômes déjà notés.
 */
function DayPill({
  letter,
  dayNumber,
  isSelected,
  isFuture,
  hasSymptoms,
  accent,
  onPress,
}: {
  letter: string;
  dayNumber: number;
  isSelected: boolean;
  isFuture: boolean;
  hasSymptoms: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${letter} ${dayNumber}`}
      accessibilityState={{ selected: isSelected, disabled: isFuture }}
      disabled={isFuture}
      onPress={onPress}
      className="items-center gap-1.5"
    >
      {isSelected ? (
        <SparkLines
          color={hexToRgba(accent, 0.6)}
          sparks={SPARKS_ABOVE}
          style={{ top: -24, left: 7 }}
        />
      ) : null}
      <View
        className="h-[70px] w-10 items-center justify-center gap-1.5 rounded-full"
        style={
          isSelected
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
            color: isSelected
              ? 'rgba(255, 255, 255, 0.85)'
              : isFuture
                ? FUTURE
                : MUTED,
          }}
        >
          {letter}
        </Text>
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: isSelected
              ? 'transparent'
              : isFuture
                ? '#f7f7f9'
                : '#f0f0f3',
          }}
        >
          <Text
            className="text-[16px]"
            style={{
              fontWeight: isSelected ? '700' : '500',
              color: isSelected
                ? '#ffffff'
                : isFuture
                  ? FUTURE
                  : GLASS_TITLE_COLOR,
            }}
          >
            {dayNumber}
          </Text>
        </View>
      </View>
      <View
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hasSymptoms ? accent : 'transparent' }}
      />
    </Pressable>
  );
}

/**
 * Pastille de symptôme : pictogramme sur rond teinté + libellé. Choisie,
 * elle prend un contour et un fond d'accent, et une coche vient confirmer
 * la sélection sur le pictogramme — l'état reste lisible sans couleur.
 */
function SymptomChip({
  label,
  visual,
  isSelected,
  accent,
  onPress,
}: {
  label: string;
  visual: { emoji: string; tint: string };
  isSelected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4"
      style={{
        backgroundColor: isSelected
          ? hexToRgba(accent, 0.1)
          : 'rgba(255, 255, 255, 0.92)',
        borderWidth: 1.5,
        borderColor: isSelected ? accent : 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: visual.tint }}
      >
        <Text style={{ fontSize: 20 }}>{visual.emoji}</Text>
        {isSelected ? (
          <View
            className="absolute -right-1 -top-1 h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white"
            style={{ backgroundColor: accent }}
          >
            <Ionicons name="checkmark" size={10} color="#ffffff" />
          </View>
        ) : null}
      </View>
      <Text
        className="text-[14.5px]"
        style={{
          color: isSelected ? accent : GLASS_TITLE_COLOR,
          fontWeight: isSelected ? '700' : '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

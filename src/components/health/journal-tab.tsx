import { Button } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SYMPTOM_OPTIONS } from '@/features/health/constants';
import {
  useSaveSymptoms,
  useSymptomDates,
  useSymptomsForDate,
} from '@/features/health/hooks';
import type { Household } from '@/features/household/api';
import { getCurrentWeekIsoDates } from '@/features/together/api';
import { todayIso } from '@/lib/date';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

/**
 * Écran 4a — Journal des symptômes.
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
  const weekDates = getCurrentWeekIsoDates();
  const [selectedDate, setSelectedDate] = useState(todayIso());

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

  return (
    <View className="gap-5">
      <View className="flex-row justify-between rounded-[16px] bg-white px-3 py-3">
        {weekDates.map((date, index) => {
          const isSelected = date === selectedDate;
          const hasSymptoms = markedDates.includes(date);
          const dayNumber = Number(date.slice(-2));

          return (
            <Pressable
              key={date}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setSelectedDate(date)}
              className="items-center gap-1"
            >
              <Text className="text-[11px] text-[#9a9a9a]">
                {DAY_LETTERS[index]}
              </Text>
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  isSelected ? 'bg-accent' : 'bg-[#f4f4f4]'
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
              <View
                className={`h-1 w-1 rounded-full ${
                  hasSymptoms ? 'bg-accent' : 'bg-transparent'
                }`}
              />
            </Pressable>
          );
        })}
      </View>

      <View className="gap-3">
        <Text className="text-[15px] font-medium text-[#1a1a1a]">
          Des symptômes{' '}
          {selectedDate === todayIso() ? 'aujourd’hui' : 'ce jour-là'} ?
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {SYMPTOM_OPTIONS.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => toggle(option.value)}
                className={`rounded-full border px-3.5 py-2 ${
                  isSelected
                    ? 'border-accent bg-[#eaf5f0]'
                    : 'border-[#e0e0e0] bg-white'
                }`}
              >
                <Text
                  className={`text-[13px] ${
                    isSelected ? 'font-medium text-accent' : 'text-[#1a1a1a]'
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Button
          isDisabled={!isDirty || saveSymptoms.isPending}
          onPress={() =>
            saveSymptoms.mutate({ logDate: selectedDate, symptoms: selected })
          }
        >
          <Button.Label>
            {saveSymptoms.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button.Label>
        </Button>

        {saveSymptoms.isError ? (
          <Text className="text-center text-[12.5px] text-red-600">
            Impossible d’enregistrer pour le moment.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

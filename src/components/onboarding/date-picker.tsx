import { Pressable, ScrollView, Text, View } from 'react-native';

const MONTH_LABELS = [
  'janv.',
  'févr.',
  'mars',
  'avril',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

function daysInMonth(year: number, month: number): number {
  // `month` est 1-indexé ; le jour 0 du mois suivant = dernier jour du mois.
  return new Date(year, month, 0).getDate();
}

function toIsoDate(year: number, month: number, day: number): string {
  const clampedDay = Math.min(day, daysInMonth(year, month));
  return `${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
}

function parseIsoDate(value: string | null): {
  year: number;
  month: number;
  day: number;
} {
  const today = new Date();
  if (value) {
    const [year, month, day] = value.split('-').map(Number);
    if (year && month && day) return { year, month, day };
  }
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
}

function WheelColumn<T extends number>({
  values,
  selected,
  onSelect,
  format,
}: {
  values: T[];
  selected: T;
  onSelect: (value: T) => void;
  format: (value: T) => string;
}) {
  return (
    <ScrollView
      horizontal
      className="flex-1"
      contentContainerClassName="gap-1.5 px-1"
      showsHorizontalScrollIndicator={false}
    >
      {values.map((value) => {
        const isSelected = value === selected;
        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(value)}
            className={`min-w-[52px] items-center rounded-[10px] px-3 py-2 ${
              isSelected ? 'bg-accent' : 'bg-[#f4f4f4]'
            }`}
          >
            <Text
              className={`text-[14px] ${
                isSelected ? 'font-medium text-white' : 'text-[#1a1a1a]'
              }`}
            >
              {format(value)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/**
 * Sélecteur jour / mois / année. Les maquettes montrent trois molettes
 * iOS ; à défaut d'un picker natif commun aux trois plateformes (l'app
 * tourne aussi en web pour la vérification), on garde la même structure en
 * trois colonnes, mais défilables horizontalement.
 */
export function OnboardingDatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (isoDate: string) => void;
}) {
  const { year, month, day } = parseIsoDate(value);
  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: 4 },
    (_, index) => currentYear - 1 + index,
  );
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const days = Array.from(
    { length: daysInMonth(year, month) },
    (_, index) => index + 1,
  );

  return (
    <View className="gap-2.5">
      <WheelColumn
        values={days}
        selected={day}
        onSelect={(nextDay) => onChange(toIsoDate(year, month, nextDay))}
        format={(dayValue) => String(dayValue)}
      />
      <WheelColumn
        values={months}
        selected={month}
        onSelect={(nextMonth) => onChange(toIsoDate(year, nextMonth, day))}
        format={(monthValue) => MONTH_LABELS[monthValue - 1]}
      />
      <WheelColumn
        values={years}
        selected={year}
        onSelect={(nextYear) => onChange(toIsoDate(nextYear, month, day))}
        format={(yearValue) => String(yearValue)}
      />
    </View>
  );
}

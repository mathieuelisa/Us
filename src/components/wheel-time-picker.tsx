import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

import {
  WHEEL_SIZES,
  WheelColumn,
  type WheelItem,
} from '@/components/wheel-date-picker';
import { CARD_SHADOW } from '@/features/hub/constants';

/** Pas des minutes : les rendez-vous se prennent au quart d'heure, à 5 min près. */
const MINUTE_STEP = 5;

const HOUR_ITEMS: WheelItem[] = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: String(hour).padStart(2, '0'),
}));

function minuteItems(current: number): WheelItem[] {
  const values = Array.from(
    { length: 60 / MINUTE_STEP },
    (_, index) => index * MINUTE_STEP,
  );
  // Une heure saisie avant la molette (10:32) garde sa minute exacte.
  if (!values.includes(current)) {
    values.push(current);
    values.sort((a, b) => a - b);
  }
  return values.map((minute) => ({
    value: minute,
    label: String(minute).padStart(2, '0'),
  }));
}

/** « 10:30 » → { hours: 10, minutes: 30 } ; valeur absente → 9 h 00. */
function parseTime(value: string): { hours: number; minutes: number } {
  const [hours, minutes] = value.split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes)
    ? { hours, minutes }
    : { hours: 9, minutes: 0 };
}

/**
 * Sélecteur d'heure en deux molettes (heures / minutes), jumeau de
 * `WheelDatePicker` (demande explicite d'un défilement plutôt qu'une
 * saisie au clavier) : même carte, même bandeau de sélection, mêmes lignes
 * inclinées. Valeur au format `HH:MM`.
 */
export function WheelTimePicker({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (time: string) => void;
  compact?: boolean;
}) {
  const size = compact ? WHEEL_SIZES.compact : WHEEL_SIZES.regular;
  const wheelHeight = size.itemHeight * size.visibleItems;
  const wheelPadding = (wheelHeight - size.itemHeight) / 2;
  const { hours, minutes } = parseTime(value);

  // Dernière heure choisie, lue au moment du choix : chaque molette
  // remonte sa valeur après un court délai, avec la fonction du rendu où le
  // geste a commencé. Sans ce relais, tourner les heures puis aussitôt les
  // minutes renvoyait les minutes avec l'ancienne heure.
  const latestRef = useRef({ hours, minutes });
  useEffect(() => {
    latestRef.current = { hours, minutes };
  }, [hours, minutes]);

  const select = (patch: { hours?: number; minutes?: number }) => {
    const next = { ...latestRef.current, ...patch };
    latestRef.current = next;
    onChange(
      `${String(next.hours).padStart(2, '0')}:${String(next.minutes).padStart(2, '0')}`,
    );
  };

  return (
    <View
      style={CARD_SHADOW}
      className="overflow-hidden rounded-[20px] bg-[#ffffff] px-2 py-1"
    >
      <View style={{ height: wheelHeight }}>
        <View
          pointerEvents="none"
          style={{ top: wheelPadding, height: size.itemHeight }}
          className="absolute inset-x-1 rounded-[12px] bg-accent/10"
        />
        <View className="flex-1 flex-row items-center">
          <WheelColumn
            items={HOUR_ITEMS}
            selected={hours}
            onSelect={(nextHours) => select({ hours: nextHours })}
            accessibilityLabel="Heures"
            flex={1}
            size={size}
          />
          <Text
            className="font-semibold text-[#1a1a1a]"
            style={{ fontSize: size.fontSize }}
          >
            h
          </Text>
          <WheelColumn
            items={minuteItems(minutes)}
            selected={minutes}
            onSelect={(nextMinutes) => select({ minutes: nextMinutes })}
            accessibilityLabel="Minutes"
            flex={1}
            size={size}
          />
        </View>
      </View>
    </View>
  );
}

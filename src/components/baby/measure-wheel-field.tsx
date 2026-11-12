import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { WHEEL_SIZES, WheelColumn } from '@/components/wheel-date-picker';
import type { BabyMeasureWheel } from '@/features/baby/constants';
import { CARD_SHADOW } from '@/features/hub/constants';
import { hexToRgba } from '@/lib/color';

const SIZE = WHEEL_SIZES.compact;
const WHEEL_HEIGHT = SIZE.itemHeight * SIZE.visibleItems;
const WHEEL_PADDING = (WHEEL_HEIGHT - SIZE.itemHeight) / 2;

/**
 * Mesure saisie à la molette (poids, taille, quantité d'un biberon —
 * demandes explicites) : une colonne pour la partie entière, une pour la
 * partie décimale quand la mesure en a, comme le sélecteur de date de la
 * même modale.
 *
 * Une mesure reste facultative (on ne pèse pas forcément le bébé le jour
 * où on le mesure) : tant que la molette n'a pas bougé, le champ est
 * « Non renseigné » et la molette estompée. Faire défiler la retient ; la
 * coche de l'en-tête la retient telle quelle (utile quand la position de
 * départ est déjà la bonne) ou la retire.
 *
 * La molette démarre sur la dernière mesure connue, à défaut sur
 * `wheel.defaultValue` : la nouvelle mesure en est rarement loin.
 */
export function MeasureWheelField({
  label,
  unit,
  wheel,
  value,
  startValue,
  onChange,
  accent,
}: {
  label: string;
  unit: string;
  wheel: BabyMeasureWheel;
  /** Valeur retenue, normalisée avec un point ; `null` si non renseignée. */
  value: string | null;
  startValue: number;
  onChange: (value: string | null) => void;
  accent: string;
}) {
  const [position, setPosition] = useState(() =>
    splitMeasure(startValue, wheel),
  );
  const hasFraction = wheel.fractionDigits > 0;
  const integerStep = wheel.integerStep ?? 1;
  const scale = 10 ** wheel.fractionDigits;

  const integerItems = Array.from(
    { length: Math.floor((wheel.max - wheel.min) / integerStep) + 1 },
    (_, index) => {
      const integer = wheel.min + index * integerStep;
      return { value: integer, label: String(integer) };
    },
  );
  const fractionItems = hasFraction
    ? Array.from({ length: scale / wheel.fractionStep }, (_, index) => {
        const fraction = index * wheel.fractionStep;
        return {
          value: fraction,
          label: String(fraction).padStart(wheel.fractionDigits, '0'),
        };
      })
    : [];

  function select(integer: number, fraction: number) {
    setPosition({ integer, fraction });
    onChange(joinMeasure(integer, fraction, wheel));
  }

  const display = hasFraction
    ? `${position.integer},${String(position.fraction).padStart(
        wheel.fractionDigits,
        '0',
      )} ${unit}`
    : `${position.integer} ${unit}`;

  return (
    <WheelFieldShell
      label={label}
      display={display}
      isSet={value !== null}
      emptyLabel="Non renseigné"
      onToggle={() =>
        value !== null
          ? onChange(null)
          : onChange(joinMeasure(position.integer, position.fraction, wheel))
      }
      accent={accent}
    >
      <WheelColumn
        items={integerItems}
        selected={position.integer}
        onSelect={(integer) => select(integer, position.fraction)}
        accessibilityLabel={`${label}, ${unit}`}
        flex={1}
        size={SIZE}
      />
      {hasFraction ? (
        <>
          <Text
            className="text-[16px] font-semibold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            ,
          </Text>
          <WheelColumn
            items={fractionItems}
            selected={position.fraction}
            onSelect={(fraction) => select(position.integer, fraction)}
            accessibilityLabel={`${label}, décimales`}
            flex={wheel.fractionDigits > 1 ? 1.15 : 0.8}
            size={SIZE}
          />
        </>
      ) : null}
      <Text
        className="pr-1.5 text-[13px] font-medium"
        style={{ color: GLASS_BODY_COLOR }}
      >
        {unit}
      </Text>
    </WheelFieldShell>
  );
}

const HOUR_ITEMS = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: String(hour).padStart(2, '0'),
}));
const MINUTE_ITEMS = Array.from({ length: 60 }, (_, minute) => ({
  value: minute,
  label: String(minute).padStart(2, '0'),
}));

/**
 * Heure saisie à la molette (heures / minutes — demande explicite sur
 * « Ajouter un biberon », appliquée aux 3 suivis qui ont une heure puisque
 * la modale est commune). Facultative comme une mesure : « Non
 * renseignée » tant que la molette n'a pas bougé ni la coche été touchée.
 *
 * Démarre sur `startTime` : l'heure de l'entrée en modification, l'heure
 * actuelle en ajout — un biberon se note le plus souvent juste après.
 */
export function TimeWheelField({
  value,
  startTime,
  onChange,
  accent,
}: {
  /** `HH:MM`, ou `null` si non renseignée. */
  value: string | null;
  /** `HH:MM`. */
  startTime: string;
  onChange: (value: string | null) => void;
  accent: string;
}) {
  const [position, setPosition] = useState(() => {
    const [hour, minute] = startTime.split(':').map(Number);
    return { hour: hour || 0, minute: minute || 0 };
  });

  function select(hour: number, minute: number) {
    setPosition({ hour, minute });
    onChange(formatTime(hour, minute));
  }

  return (
    <WheelFieldShell
      label="Heure"
      display={`${String(position.hour).padStart(2, '0')}h${String(
        position.minute,
      ).padStart(2, '0')}`}
      isSet={value !== null}
      emptyLabel="Non renseignée"
      onToggle={() =>
        value !== null
          ? onChange(null)
          : onChange(formatTime(position.hour, position.minute))
      }
      accent={accent}
    >
      <WheelColumn
        items={HOUR_ITEMS}
        selected={position.hour}
        onSelect={(hour) => select(hour, position.minute)}
        accessibilityLabel="Heure, heures"
        flex={1}
        size={SIZE}
      />
      <Text
        className="text-[16px] font-semibold"
        style={{ color: GLASS_TITLE_COLOR }}
      >
        h
      </Text>
      <WheelColumn
        items={MINUTE_ITEMS}
        selected={position.minute}
        onSelect={(minute) => select(position.hour, minute)}
        accessibilityLabel="Heure, minutes"
        flex={1}
        size={SIZE}
      />
    </WheelFieldShell>
  );
}

/**
 * En-tête à coche (libellé, valeur retenue ou « Non renseigné ») et carte
 * de molette à bandeau de sélection, communs aux molettes de mesure et
 * d'heure.
 */
function WheelFieldShell({
  label,
  display,
  isSet,
  emptyLabel,
  onToggle,
  accent,
  children,
}: {
  label: string;
  display: string;
  isSet: boolean;
  emptyLabel: string;
  onToggle: () => void;
  accent: string;
  children: ReactNode;
}) {
  return (
    <View className="flex-1 gap-1.5">
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSet }}
        accessibilityLabel={`${label} : ${isSet ? display : emptyLabel.toLowerCase()}`}
        onPress={onToggle}
        className="flex-row items-center justify-between gap-2 px-1"
      >
        <View className="flex-1">
          <Text
            className="text-[14px] font-semibold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {label}
          </Text>
          <Text
            numberOfLines={1}
            className="text-[12px]"
            style={{ color: isSet ? accent : GLASS_BODY_COLOR }}
          >
            {isSet ? display : emptyLabel}
          </Text>
        </View>
        <Ionicons
          name={isSet ? 'checkmark-circle' : 'ellipse-outline'}
          size={22}
          color={isSet ? accent : '#c4c2cc'}
        />
      </Pressable>

      <View
        style={[CARD_SHADOW, { opacity: isSet ? 1 : 0.55 }]}
        className="overflow-hidden rounded-[20px] bg-white px-1.5 py-1"
      >
        <View style={{ height: WHEEL_HEIGHT }}>
          {/* Bandeau de sélection, transparent aux gestes. */}
          <View
            pointerEvents="none"
            style={{
              top: WHEEL_PADDING,
              height: SIZE.itemHeight,
              backgroundColor: hexToRgba(accent, 0.1),
            }}
            className="absolute inset-x-0.5 rounded-[12px]"
          />

          <View className="flex-1 flex-row items-center">{children}</View>
        </View>
      </View>
    </View>
  );
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Découpe une mesure en partie entière et partie décimale (exprimée en
 * unités de `fractionDigits`, ex. 690 pour 5,690 kg), arrondie au pas de la
 * molette et ramenée dans ses bornes.
 */
function splitMeasure(
  measure: number,
  wheel: BabyMeasureWheel,
): { integer: number; fraction: number } {
  if (wheel.fractionDigits === 0) {
    const step = wheel.integerStep ?? 1;
    const snapped = wheel.min + Math.round((measure - wheel.min) / step) * step;
    return {
      integer: Math.min(Math.max(snapped, wheel.min), wheel.max),
      fraction: 0,
    };
  }

  const scale = 10 ** wheel.fractionDigits;
  const snapped =
    Math.round((measure * scale) / wheel.fractionStep) * wheel.fractionStep;
  const total = Math.min(
    Math.max(snapped, wheel.min * scale),
    wheel.max * scale + scale - wheel.fractionStep,
  );
  return { integer: Math.floor(total / scale), fraction: total % scale };
}

/** « 5.690 », « 52.5 » ou « 54 » : même forme qu'une saisie au clavier. */
function joinMeasure(
  integer: number,
  fraction: number,
  wheel: BabyMeasureWheel,
): string {
  if (fraction === 0) return String(integer);
  return `${integer}.${String(fraction).padStart(wheel.fractionDigits, '0')}`;
}

import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import type { BabyEntryInput } from '@/features/baby/api';
import {
  type BabyEntry,
  formatSleepDuration,
  isSleepOngoing,
} from '@/features/baby/constants';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

/** Heure actuelle en `HH:MM`. */
function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes(),
  ).padStart(2, '0')}`;
}

/** Instant du coucher d'une entrée (date et heure locales). */
function bedTimestamp(entry: BabyEntry): number {
  const [year, month, day] = entry.date.split('-').map(Number);
  const [hours, minutes] = (entry.time ?? '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).getTime();
}

/**
 * Sieste ou nuit selon l'heure du coucher : la nuit de 19h à 7h. Un simple
 * point de départ — le type se corrige en rouvrant l'entrée.
 */
function guessSleepType(): 'Sieste' | 'Nuit' {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 7 ? 'Nuit' : 'Sieste';
}

/**
 * Saisie « en direct » du sommeil (demande explicite du 2026-11-15) :
 * « Bébé dort » note le coucher maintenant, « Bébé est réveillé » note le
 * réveil et la durée réelle. Le sommeil en cours est une entrée sans heure
 * de réveil : les deux parents la voient (Realtime) et l'un peut noter le
 * réveil d'un sommeil commencé par l'autre.
 */
export function SleepNowCard({
  entries,
  accent,
  isSaving,
  onSave,
}: {
  entries: BabyEntry[];
  accent: string;
  isSaving: boolean;
  onSave: (id: string | null, input: BabyEntryInput) => Promise<void>;
}) {
  // Liste triée du plus récent au plus ancien : le premier sommeil sans
  // réveil est celui en cours.
  const ongoing = entries.find(isSleepOngoing) ?? null;

  // Rafraîchit la durée affichée, sans compter les secondes.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!ongoing) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [ongoing]);

  function startSleep() {
    onSave(null, {
      date: todayIso(),
      time: nowTime(),
      segment: guessSleepType(),
      values: {},
      comment: null,
    });
  }

  function endSleep() {
    if (!ongoing) return;
    // Durée réelle depuis le coucher, même au-delà de minuit.
    const seconds = Math.max(
      60,
      Math.round((Date.now() - bedTimestamp(ongoing)) / 1000),
    );
    onSave(ongoing.id, {
      date: ongoing.date,
      time: ongoing.time,
      segment: ongoing.segment,
      values: {
        ...ongoing.values,
        wakeTime: nowTime(),
        duration: String(seconds),
      },
      comment: ongoing.comment,
    });
  }

  const elapsed = ongoing
    ? formatSleepDuration(Math.max(0, (now - bedTimestamp(ongoing)) / 1000))
    : null;

  return (
    <View
      className="gap-3 rounded-[28px] p-4"
      style={{
        backgroundColor: ongoing
          ? hexToRgba(accent, 0.12)
          : 'rgba(255, 255, 255, 0.92)',
        borderWidth: 1,
        borderColor: ongoing
          ? hexToRgba(accent, 0.25)
          : 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: hexToRgba(accent, 0.16) }}
        >
          <Ionicons
            name={ongoing ? 'moon' : 'moon-outline'}
            size={22}
            color={accent}
          />
        </View>
        <View className="flex-1 gap-0.5">
          <Text
            className="text-[16px] font-extrabold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {ongoing
              ? `${ongoing.segment ?? 'Sommeil'} en cours`
              : 'Bébé s’endort ?'}
          </Text>
          <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
            {ongoing
              ? `Depuis ${ongoing.time?.replace(':', 'h')} · ${elapsed}`
              : 'Notez le coucher en un tap, le réveil ensuite.'}
          </Text>
        </View>
      </View>

      <PillButton
        size="compact"
        icon={ongoing ? 'sunny-outline' : 'moon-outline'}
        label={ongoing ? 'Bébé est réveillé' : 'Bébé dort'}
        isDisabled={isSaving}
        onPress={ongoing ? endSleep : startSleep}
      />
    </View>
  );
}

import AsyncStorage from '@react-native-async-storage/async-storage';

import { toLocalIsoDate } from '@/lib/date';

/**
 * Créneaux du rappel d'humeur dans l'app (demande explicite du
 * 2026-11-15) : 9h–14h, 14h–19h, 19h–minuit — « toutes les 5 h », jamais la
 * nuit. Le toast s'affiche au plus une fois par créneau.
 */
const SLOT_START_HOURS = [9, 14, 19];

/**
 * Créneau en cours, sous la forme `2026-11-15@14`, ou `null` avant 9h (pas
 * de rappel la nuit).
 */
export function currentMoodNudgeSlot(now: Date = new Date()): string | null {
  const hour = now.getHours();
  const start = [...SLOT_START_HOURS].reverse().find((h) => hour >= h);
  if (start === undefined) return null;
  return `${toLocalIsoDate(now)}@${start}`;
}

const storageKey = (userId: string) => `us:mood-nudge:${userId}`;

/**
 * Réserve le créneau en cours pour cet utilisateur : `true` la première
 * fois (le toast peut s'afficher), `false` s'il a déjà été montré dans ce
 * créneau. Mémorisé sur le téléphone : c'est un simple confort, une perte
 * de stockage ne fait que remontrer un toast.
 */
export async function claimMoodNudgeSlot(
  userId: string,
  slot: string,
): Promise<boolean> {
  try {
    const lastSlot = await AsyncStorage.getItem(storageKey(userId));
    if (lastSlot === slot) return false;
    await AsyncStorage.setItem(storageKey(userId), slot);
    return true;
  } catch {
    return true;
  }
}

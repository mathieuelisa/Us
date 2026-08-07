import type { MoodValue } from '@/features/hub/api';
import type { HouseholdRole } from '@/lib/atoms/role';
import { pickForToday, todayIso, toLocalIsoDate } from '@/lib/date';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type GestureSuggestion =
  Database['public']['Tables']['gesture_suggestions']['Row'];

/**
 * Les 7 dates ISO (lundi → dimanche) de la semaine contenant `referenceIso`
 * — convention française du calendrier hebdomadaire (écrans 3a/3g : « L M
 * M J V S D »).
 */
export function getCurrentWeekIsoDates(
  referenceIso: string = todayIso(),
): string[] {
  const [year, month, day] = referenceIso.split('-').map(Number);
  const reference = new Date(year, month - 1, day);
  const dayOfWeek = reference.getDay(); // 0 (dim.) .. 6 (sam.)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return Array.from({ length: 7 }, (_, index) =>
    toLocalIsoDate(new Date(year, month - 1, day + mondayOffset + index)),
  );
}

export async function fetchMyWeekCheckins(
  householdId: string,
  userId: string,
  weekDates: string[],
): Promise<Record<string, MoodValue>> {
  const { data, error } = await supabase
    .from('mood_checkins')
    .select('checkin_date, mood')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .in('checkin_date', weekDates);

  if (error) throw error;

  return Object.fromEntries(
    (data ?? []).map((row) => [row.checkin_date, row.mood]),
  );
}

/**
 * Un seul enregistrement par jour (contrainte unique en base) : appelée une
 * première fois au tap sur l'humeur (`needNote` omis, donc préservé s'il
 * existait déjà), puis une seconde fois si l'utilisateur renseigne un
 * besoin dans l'overlay qui suit.
 */
export async function upsertMoodCheckin(input: {
  householdId: string;
  userId: string;
  date: string;
  mood: MoodValue;
  needNote?: string | null;
}) {
  const { error } = await supabase.from('mood_checkins').upsert(
    {
      household_id: input.householdId,
      user_id: input.userId,
      checkin_date: input.date,
      mood: input.mood,
      ...(input.needNote !== undefined ? { need_note: input.needNote } : {}),
    },
    { onConflict: 'household_id,user_id,checkin_date' },
  );

  if (error) throw error;
}

export async function fetchGestureSuggestions(
  role: HouseholdRole,
): Promise<GestureSuggestion[]> {
  const { data, error } = await supabase
    .from('gesture_suggestions')
    .select('*')
    .eq('target_role', role)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/** Cf. `pickForToday` : même geste toute la journée pour un rôle donné. */
export function pickGestureOfTheDay(
  gestures: GestureSuggestion[],
): GestureSuggestion | null {
  return pickForToday(gestures);
}

/**
 * Point d'extension pour le déclenchement comportemental du geste du jour
 * (DOCS/02-ACTION-PLAN.md §1.4 : « peut être déclenché comportementalement
 * — plusieurs jours consécutifs d'humeur difficile détectés »). Le
 * déclenchement réel (notification) est câblé en Phase 4 ; cette fonction
 * ne fait qu'exposer le signal à partir de l'historique déjà chargé par
 * l'écran — pas de requête dédiée.
 */
export function countTrailingDifficultMoodDays(
  checkinsByDate: Record<string, MoodValue>,
  fromDateIso: string = todayIso(),
): number {
  const DIFFICULT: MoodValue[] = ['bad', 'terrible'];
  let count = 0;
  let cursor = fromDateIso;

  while (checkinsByDate[cursor] && DIFFICULT.includes(checkinsByDate[cursor])) {
    count += 1;
    const [year, month, day] = cursor.split('-').map(Number);
    cursor = toLocalIsoDate(new Date(year, month - 1, day - 1));
  }

  return count;
}

import { todayIso } from '@/lib/date';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Household = Database['public']['Tables']['households']['Row'];

export type MoodValue =
  Database['public']['Tables']['mood_checkins']['Row']['mood'];

/**
 * Ce que le hub a besoin de savoir pour afficher un **état contextuel** par
 * pilier plutôt qu'une description figée (CONCEPT.md).
 */
export type HubSummary = {
  proceduresTodo: number;
  hasCheckedInToday: boolean;
  partnerFirstName: string | null;
  partnerMood: { mood: MoodValue; needNote: string | null } | null;
  nextAppointment: { title: string; date: string } | null;
};

/** L'autre membre du foyer, ou null tant que le co-parent n'a pas rejoint. */
export function getPartnerUserId(
  household: Household,
  userId: string,
): string | null {
  return household.pregnant_user_id === userId
    ? household.partner_user_id
    : household.pregnant_user_id;
}

export async function fetchHubSummary(
  household: Household,
  userId: string,
): Promise<HubSummary> {
  const today = todayIso();
  const partnerUserId = getPartnerUserId(household, userId);

  const [procedures, moods, appointments, partnerProfile] = await Promise.all([
    supabase
      .from('household_procedures')
      .select('status')
      .eq('household_id', household.id),
    supabase
      .from('mood_checkins')
      .select('user_id, mood, need_note')
      .eq('household_id', household.id)
      .eq('checkin_date', today),
    // Les rendez-vous non partagés sont déjà filtrés par la RLS selon le
    // rôle : rien à refaire côté client.
    supabase
      .from('appointments')
      .select('title, appointment_date')
      .eq('household_id', household.id)
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true })
      .limit(1),
    partnerUserId
      ? supabase
          .from('profiles')
          .select('first_name')
          .eq('id', partnerUserId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const firstError =
    procedures.error ??
    moods.error ??
    appointments.error ??
    partnerProfile.error;
  if (firstError) throw firstError;

  const partnerCheckin = moods.data?.find(
    (checkin) => checkin.user_id === partnerUserId,
  );
  const nextAppointment = appointments.data?.[0];

  return {
    proceduresTodo:
      procedures.data?.filter((row) => row.status !== 'fait').length ?? 0,
    hasCheckedInToday:
      moods.data?.some((checkin) => checkin.user_id === userId) ?? false,
    // Le prénom du profil fait foi dès que le co-parent a un compte ; sinon
    // on retombe sur celui saisi pendant l'onboarding.
    partnerFirstName:
      partnerProfile.data?.first_name ?? household.partner_first_name ?? null,
    partnerMood: partnerCheckin
      ? { mood: partnerCheckin.mood, needNote: partnerCheckin.need_note }
      : null,
    nextAppointment: nextAppointment
      ? {
          title: nextAppointment.title,
          date: nextAppointment.appointment_date,
        }
      : null,
  };
}

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type BabySize = Database['public']['Tables']['baby_size_by_week']['Row'];

// ---------------------------------------------------------------- Journal

/**
 * Symptômes d'une journée. Donnée de santé : l'écriture est réservée à la
 * personne enceinte par la RLS (`symptoms_log_insert_pregnant_only`), la
 * lecture est ouverte aux deux membres — le co-parent y accédera via « Mon
 * partenaire », jamais via l'onglet Journal.
 */
export async function fetchSymptomsForDate(
  householdId: string,
  userId: string,
  logDate: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('symptoms_log')
    .select('symptoms')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .maybeSingle();

  if (error) throw error;
  return data?.symptoms ?? [];
}

/** Dates de la période ayant au moins un symptôme, pour pastiller le calendrier. */
export async function fetchSymptomDates(
  householdId: string,
  userId: string,
  dates: string[],
): Promise<string[]> {
  const { data, error } = await supabase
    .from('symptoms_log')
    .select('log_date, symptoms')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .in('log_date', dates);

  if (error) throw error;
  return (data ?? [])
    .filter((row) => row.symptoms.length > 0)
    .map((row) => row.log_date);
}

export async function saveSymptoms(input: {
  householdId: string;
  userId: string;
  logDate: string;
  symptoms: string[];
}): Promise<void> {
  const { error } = await supabase.from('symptoms_log').upsert(
    {
      household_id: input.householdId,
      user_id: input.userId,
      log_date: input.logDate,
      symptoms: input.symptoms,
    },
    { onConflict: 'household_id,user_id,log_date' },
  );

  if (error) throw error;
}

// ----------------------------------------------------------- Rendez-vous

/**
 * La RLS filtre déjà selon le rôle : la personne enceinte voit tous ses
 * rendez-vous, le co-parent uniquement ceux marqués partagés. Rien à
 * refiltrer côté client — et surtout rien à y ajouter, sous peine de faire
 * diverger la règle de visibilité de son unique source de vérité.
 */
export async function fetchAppointments(
  householdId: string,
): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('household_id', householdId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true, nullsFirst: true });

  if (error) throw error;
  return data;
}

export async function createAppointment(input: {
  householdId: string;
  userId: string;
  title: string;
  appointmentDate: string;
  appointmentTime: string | null;
  address: string | null;
  isShared: boolean;
}): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      household_id: input.householdId,
      created_by: input.userId,
      title: input.title,
      appointment_date: input.appointmentDate,
      appointment_time: input.appointmentTime,
      address: input.address,
      is_shared: input.isShared,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw error;
}

// -------------------------------------------------------------- Contacts

export async function fetchContacts(householdId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('household_id', householdId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createContact(input: {
  householdId: string;
  name: string;
  roleLabel: string | null;
  address: string | null;
  phone: string | null;
  isEmergency: boolean;
  sortOrder: number;
}): Promise<Contact> {
  const { data, error } = await supabase
    .from('contacts')
    .insert({
      household_id: input.householdId,
      name: input.name,
      role_label: input.roleLabel,
      address: input.address,
      phone: input.phone,
      is_emergency: input.isEmergency,
      sort_order: input.sortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderContacts(
  items: { id: string; sort_order: number }[],
): Promise<void> {
  const results = await Promise.all(
    items.map((item) =>
      supabase
        .from('contacts')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
}

// ------------------------------------------------------ Contenu statique

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('trimester', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Le référentiel n'a qu'une entrée toutes les 4 semaines : on prend la plus
 * récente atteinte, pas une correspondance exacte qui ne renverrait rien 3
 * semaines sur 4.
 */
export async function fetchBabySize(week: number): Promise<BabySize | null> {
  const { data, error } = await supabase
    .from('baby_size_by_week')
    .select('*')
    .lte('week', week)
    .order('week', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

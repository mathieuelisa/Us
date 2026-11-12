import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type { NameGender } from './catalog';

export type NameSwipe = Database['public']['Tables']['name_swipes']['Row'];
export type NameFavorite =
  Database['public']['Tables']['name_favorites']['Row'];

/**
 * Tous les choix du foyer, des deux parents : il faut ceux de l'autre pour
 * calculer les matchs. RLS : `name_swipes_select_members`.
 */
export async function fetchNameSwipes(
  householdId: string,
): Promise<NameSwipe[]> {
  const { data, error } = await supabase
    .from('name_swipes')
    .select('*')
    .eq('household_id', householdId);

  if (error) throw error;
  return data;
}

/**
 * Enregistre (ou remplace) son choix sur un prénom : gardé (`liked`) ou
 * écarté. RLS : uniquement ses propres choix.
 */
export async function recordNameSwipe(input: {
  householdId: string;
  userId: string;
  gender: NameGender;
  name: string;
  liked: boolean;
}): Promise<void> {
  const { error } = await supabase.from('name_swipes').upsert(
    {
      household_id: input.householdId,
      user_id: input.userId,
      gender: input.gender,
      name: input.name,
      liked: input.liked,
    },
    { onConflict: 'household_id,user_id,gender,name' },
  );

  if (error) throw error;
}

/** Ses favoris, et seulement les siens (RLS : `name_favorites_select_own`). */
export async function fetchMyNameFavorites(
  householdId: string,
): Promise<NameFavorite[]> {
  const { data, error } = await supabase
    .from('name_favorites')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addNameFavorite(input: {
  householdId: string;
  userId: string;
  gender: NameGender;
  name: string;
}): Promise<void> {
  const { error } = await supabase.from('name_favorites').upsert(
    {
      household_id: input.householdId,
      user_id: input.userId,
      gender: input.gender,
      name: input.name,
    },
    { onConflict: 'household_id,user_id,gender,name', ignoreDuplicates: true },
  );

  if (error) throw error;
}

export async function removeNameFavorite(input: {
  householdId: string;
  userId: string;
  gender: NameGender;
  name: string;
}): Promise<void> {
  const { error } = await supabase
    .from('name_favorites')
    .delete()
    .eq('household_id', input.householdId)
    .eq('user_id', input.userId)
    .eq('gender', input.gender)
    .eq('name', input.name);

  if (error) throw error;
}

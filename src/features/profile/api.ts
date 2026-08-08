import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export async function fetchMyProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMyProfile(
  userId: string,
  patch: { first_name: string },
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fonction séparée plutôt qu'un `updateMyProfile` généralisé : le prénom et
 * le thème ont des flux d'écriture différents (le prénom se valide avant
 * envoi, le thème s'applique instantanément au tap) — pas de raison de les
 * faire transiter par la même signature.
 */
export async function updateMyTheme(
  userId: string,
  theme: string,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ theme })
    .eq('id', userId);

  if (error) throw error;
}

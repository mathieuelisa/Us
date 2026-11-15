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

/** `null` revient à l'initiale du prénom. RLS : `profiles_update_own`. */
export async function updateMyAvatar(
  userId: string,
  avatar: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Inscrit comme partenaire ou non (`profiles.is_partner`) : sert seulement à
 * l'aiguillage onboarding / « Rejoindre l'espace », jamais à une
 * autorisation. RLS : `profiles_update_own`.
 */
export async function updateMyIsPartner(
  userId: string,
  isPartner: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_partner: isPartner })
    .eq('id', userId);

  if (error) throw error;
}

/** Comment parler de la personne : accorde les textes de l'app. */
export type ProfilePronoun = 'il' | 'elle' | 'neutre';

/**
 * « Faisons connaissance » du parcours partenaire : prénom et façon d'en
 * parler, et `is_partner` confirmé (un compte Google arrive ici sans avoir
 * choisi son rôle à l'inscription). RLS : `profiles_update_own`.
 */
export async function updateMyPartnerIntro(
  userId: string,
  intro: { firstName: string; pronoun: ProfilePronoun },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: intro.firstName,
      pronoun: intro.pronoun,
      is_partner: true,
    })
    .eq('id', userId);

  if (error) throw error;
}

/** Interrupteurs de notifications de Réglages (`profiles.notify_*`). */
export type NotificationPreferences = Pick<
  Profile,
  'notify_appointments' | 'notify_procedures' | 'notify_partner'
>;

/**
 * Lues par l'app (rappels locaux) et par la base (`enqueue_partner_notification`
 * pour les push de l'autre parent). RLS : `profiles_update_own`.
 */
export async function updateMyNotificationPreferences(
  userId: string,
  patch: Partial<NotificationPreferences>,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId);

  if (error) throw error;
}

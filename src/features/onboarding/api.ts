import type { OnboardingDraft } from '@/lib/atoms/onboarding';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type Household = Database['public']['Tables']['households']['Row'];

/**
 * Écrit tout l'onboarding d'un coup, en fin de parcours. Le créateur du
 * foyer est toujours le parent porteur (CONCEPT.md : « Le premier parent
 * (la mère) crée l'espace »), le co-parent arrive ensuite par invitation.
 *
 * Le trigger `on_household_created` seede les 8 démarches automatiquement,
 * et `handle_new_user` a déjà créé la ligne `profiles` à l'inscription : on
 * ne fait que la compléter avec le prénom.
 */
export async function completeOnboarding(
  userId: string,
  draft: OnboardingDraft,
): Promise<Household> {
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ first_name: draft.firstName.trim() })
    .eq('id', userId);

  if (profileError) throw profileError;

  const { data, error } = await supabase
    .from('households')
    .insert({
      pregnant_user_id: userId,
      accompaniment_type: draft.accompanimentType,
      partner_uses_app: draft.partnerUsesApp,
      partner_first_name: draft.partnerFirstName.trim() || null,
      professional_status: draft.professionalStatus,
      priorities: draft.priorities,
      reminder_frequency: draft.reminderFrequency,
      due_date: draft.dueDate,
      is_first_child: draft.isFirstChild,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Invite le co-parent. Deux effets distincts :
 *  1. une ligne `household_invites` — c'est elle qui fait autorité pour le
 *     rattachement, via `accept_household_invite()` ;
 *  2. un email de lien magique envoyé à cette adresse.
 *
 * ⚠️ Limite MVP : l'email envoyé est le template « lien de connexion »
 * standard de Supabase, pas un email d'invitation personnalisé au nom du
 * premier parent. Un vrai email d'invitation suppose une Edge Function
 * (clé service_role) — hors périmètre de la Phase 1.2, à traiter quand le
 * SMTP du projet sera configuré.
 */
export async function invitePartner(
  householdId: string,
  email: string,
): Promise<void> {
  const invitedEmail = email.trim().toLowerCase();

  const { error: inviteError } = await supabase
    .from('household_invites')
    .insert({ household_id: householdId, invited_email: invitedEmail });

  if (inviteError) throw inviteError;

  const { error: mailError } = await supabase.auth.signInWithOtp({
    email: invitedEmail,
  });

  if (mailError) throw mailError;
}

/**
 * Rattache l'utilisateur courant au foyer qui l'a invité, s'il y en a un.
 * Toute la logique (et les garde-fous) vit dans la fonction SQL
 * `security definer` — le client n'envoie aucun paramètre, le matching se
 * fait sur l'email vérifié du JWT.
 *
 * Renvoie l'id du foyer rejoint, ou null s'il n'y avait pas d'invitation.
 */
export async function acceptHouseholdInvite(): Promise<string | null> {
  const { data, error } = await supabase.rpc('accept_household_invite');

  if (error) throw error;
  return data;
}

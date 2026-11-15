import { shouldInvitePartner } from '@/features/onboarding/constants';
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

  // Une seule règle décide s'il y a un co-parent (« Seul·e » l'exclut,
  // quelle que soit la réponse à « Le co-parent utilisera-t-il l'app ? ») :
  // la même que celle qui pilote les écrans de l'onboarding. La base le
  // vérifie aussi (contrainte `households_solo_without_partner`).
  const hasPartner = shouldInvitePartner(
    draft.accompanimentType,
    draft.partnerUsesApp,
  );

  const { data, error } = await supabase
    .from('households')
    .insert({
      pregnant_user_id: userId,
      accompaniment_type: draft.accompanimentType,
      partner_uses_app: hasPartner,
      partner_first_name: hasPartner
        ? draft.partnerFirstName.trim() || null
        : null,
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

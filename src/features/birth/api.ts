import type { Household } from '@/features/household/api';
import { supabase } from '@/lib/supabase/client';

/**
 * Écrit la date de naissance réelle sur le foyer (écran 7a — « J'ai
 * accouché »). C'est l'**événement pivot** du MVP : `households.birth_date`
 * restait `null` jusqu'ici, et c'est lui qui fait passer la déclaration de
 * naissance d'une échéance informative (« 5 jours à partir de la
 * naissance ») à une date précise — cf. `formatDeadlineLabel()`.
 *
 * Une seule colonne à écrire, donc pas de RPC ni de transaction : les
 * échéances ne sont pas stockées, elles se recalculent à l'affichage à
 * partir de cette date. Rien d'autre n'est à mettre à jour côté base.
 *
 * La policy `households_update_members` autorise déjà les deux membres du
 * foyer — aucune migration n'est nécessaire pour cet écran.
 */
export async function declareBirth(
  householdId: string,
  birthDate: string,
): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .update({ birth_date: birthDate })
    .eq('id', householdId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

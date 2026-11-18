import i18n from '@/i18n';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type Household = Database['public']['Tables']['households']['Row'];
export type HouseholdInfoItem =
  Database['public']['Tables']['household_info_items']['Row'];

/** RLS already scopes this to the caller's own household (0 or 1 row). */
export async function fetchMyHousehold(): Promise<Household | null> {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Corrige la date du terme (Profil, demande explicite : en cas d'erreur à
 * l'onboarding). RLS `households_update_members` : seuls les membres de
 * l'espace peuvent la modifier ; l'écran ne la propose qu'à la personne
 * enceinte. Aucune donnée de santé nouvelle : c'est le champ saisi à
 * l'onboarding.
 */
export async function updateDueDate(
  householdId: string,
  dueDate: string,
): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .update({ due_date: dueDate })
    .eq('id', householdId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchInfoItems(
  householdId: string,
): Promise<HouseholdInfoItem[]> {
  const { data, error } = await supabase
    .from('household_info_items')
    .select('*')
    .eq('household_id', householdId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Crée une ou plusieurs informations d'un coup (plusieurs points de
 * vigilance cochés ensemble) : une seule requête, rangées à la suite de
 * `firstSortOrder`. RLS : `household_info_items_all_members`.
 */
export async function createInfoItems(
  householdId: string,
  inputs: { label: string; value: string | null; category: string | null }[],
  firstSortOrder: number,
): Promise<HouseholdInfoItem[]> {
  const { data, error } = await supabase
    .from('household_info_items')
    .insert(
      inputs.map((input, index) => ({
        household_id: householdId,
        label: input.label,
        value: input.value,
        category: input.category,
        sort_order: firstSortOrder + index,
      })),
    )
    .select();

  if (error) throw error;
  return data;
}

export async function updateInfoItem(
  id: string,
  patch: Partial<
    Pick<HouseholdInfoItem, 'label' | 'value' | 'category' | 'sort_order'>
  >,
): Promise<HouseholdInfoItem> {
  const { data, error } = await supabase
    .from('household_info_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteInfoItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('household_info_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Rejoint, comme partenaire, l'espace dont on a reçu le code (saisi ou lu
 * dans le QR code). RPC `join_household_by_code` (`security definer`) :
 * rattache l'appelant seulement, et refuse code inconnu, place prise,
 * espace « Seul·e » ou compte déjà dans un espace.
 */
export async function joinHouseholdByCode(code: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_household_by_code', {
    p_code: code,
  });
  if (error) throw error;
  return data;
}

/**
 * Code temporaire pour inviter le ou la partenaire (demande explicite d'un
 * « code secure temporaire ») : valable 30 minutes, à usage unique. RPC
 * `create_household_join_code` — réservée à la personne enceinte, elle
 * reprend le code en cours s'il lui reste plus de 5 minutes.
 */
export async function createHouseholdJoinCode(): Promise<{
  code: string;
  expiresAt: string;
}> {
  const { data, error } = await supabase.rpc('create_household_join_code');
  if (error) throw error;
  const row = data[0];
  if (!row) throw new Error('No join code returned');
  return { code: row.code, expiresAt: row.expires_at };
}

const JOIN_ERROR_CODES = [
  'invalid_code',
  'expired_code',
  'household_full',
  'household_solo',
  'already_in_household',
] as const;

export function getJoinErrorMessage(error: unknown): string {
  const message = (error as { message?: string } | null)?.message ?? '';
  const code = JOIN_ERROR_CODES.find((c) => message.includes(c));
  if (code) return i18n.t(`hub.invite.joinErrors.${code}`);
  if (/network|fetch/i.test(message)) {
    return i18n.t('hub.invite.joinErrors.network');
  }
  return i18n.t('hub.invite.joinErrors.unknown');
}

/** Longueur du code d'espace (`generate_household_join_code`). */
export const JOIN_CODE_LENGTH = 6;

/**
 * Code d'espace extrait d'une saisie ou du contenu d'un QR code : le QR
 * contient un lien `…/rejoindre?code=XXXXXX`, la saisie le code seul (tirets
 * et espaces tolérés). `null` si rien d'exploitable.
 */
export function parseJoinCode(raw: string): string | null {
  const fromLink = raw.match(/[?&]code=([A-Za-z0-9]{6})/);
  const candidate = (fromLink ? fromLink[1] : raw)
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();
  return candidate.length === JOIN_CODE_LENGTH ? candidate : null;
}

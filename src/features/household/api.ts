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

export async function createInfoItem(
  householdId: string,
  input: { label: string; value: string | null; category: string | null },
  sortOrder: number,
): Promise<HouseholdInfoItem> {
  const { data, error } = await supabase
    .from('household_info_items')
    .insert({
      household_id: householdId,
      label: input.label,
      value: input.value,
      category: input.category,
      sort_order: sortOrder,
    })
    .select()
    .single();

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

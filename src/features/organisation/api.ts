import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ChecklistItemTemplate =
  Database['public']['Tables']['checklist_item_templates']['Row'];

export type ChecklistItem = {
  id: string;
  checklistSlug: string;
  label: string;
  sortOrder: number;
  checked: boolean;
};

/**
 * `household_checklist_items` est auto-peuplée par trigger à la création du
 * foyer (cf. migration), même parti pris que `household_procedures` : le
 * client ne fait jamais d'INSERT, seulement lecture et mise à jour de
 * `checked`.
 */
export async function fetchChecklistItems(
  householdId: string,
): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from('household_checklist_items')
    .select('id, checked, checklist_item_templates(*)')
    .eq('household_id', householdId)
    .order('sort_order', { referencedTable: 'checklist_item_templates' });

  if (error) throw error;

  return data
    .filter((row) => row.checklist_item_templates !== null)
    .map((row) => {
      const template = row.checklist_item_templates as ChecklistItemTemplate;
      return {
        id: row.id,
        checklistSlug: template.checklist_slug,
        label: template.label,
        sortOrder: template.sort_order,
        checked: row.checked,
      };
    });
}

export async function updateChecklistItemChecked(
  householdChecklistItemId: string,
  checked: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('household_checklist_items')
    .update({ checked })
    .eq('id', householdChecklistItemId);

  if (error) throw error;
}

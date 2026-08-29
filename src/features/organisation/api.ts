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
  category: string | null;
  /**
   * Article ajouté par le foyer (`household_custom_checklist_items`) plutôt
   * qu'issu du catalogue partagé. Détermine la table à mettre à jour, le
   * rangement en fin de sous-section, et la possibilité de le supprimer.
   */
  isCustom: boolean;
};

/**
 * Les articles du catalogue vivent dans `household_checklist_items`,
 * auto-peuplée par trigger à la création du foyer (cf. migration) : le
 * client n'y fait jamais d'INSERT, seulement lecture et mise à jour de
 * `checked`. Les articles personnalisés vivent à part, dans
 * `household_custom_checklist_items` — la seule table que le client
 * insère et supprime ici.
 *
 * Les deux sources sont fusionnées en une liste unique : l'écran n'a pas à
 * savoir d'où vient un article, seulement à le ranger (`isCustom` le place
 * en fin de sous-section, cf. `sortChecklistItems`).
 */
export async function fetchChecklistItems(
  householdId: string,
): Promise<ChecklistItem[]> {
  const [templated, custom] = await Promise.all([
    supabase
      .from('household_checklist_items')
      .select('id, checked, checklist_item_templates(*)')
      .eq('household_id', householdId)
      .order('sort_order', { referencedTable: 'checklist_item_templates' }),
    supabase
      .from('household_custom_checklist_items')
      .select('id, checked, checklist_slug, category, label, sort_order')
      .eq('household_id', householdId)
      .order('sort_order'),
  ]);

  if (templated.error) throw templated.error;
  if (custom.error) throw custom.error;

  const templatedItems = templated.data
    .filter((row) => row.checklist_item_templates !== null)
    .map((row) => {
      const template = row.checklist_item_templates as ChecklistItemTemplate;
      return {
        id: row.id,
        checklistSlug: template.checklist_slug,
        label: template.label,
        sortOrder: template.sort_order,
        checked: row.checked,
        category: template.category,
        isCustom: false,
      };
    });

  const customItems = custom.data.map((row) => ({
    id: row.id,
    checklistSlug: row.checklist_slug,
    label: row.label,
    sortOrder: row.sort_order,
    checked: row.checked,
    category: row.category,
    isCustom: true,
  }));

  return [...templatedItems, ...customItems];
}

export async function updateChecklistItemChecked(
  itemId: string,
  checked: boolean,
  isCustom: boolean,
): Promise<void> {
  const { error } = await supabase
    .from(
      isCustom
        ? 'household_custom_checklist_items'
        : 'household_checklist_items',
    )
    .update({ checked })
    .eq('id', itemId);

  if (error) throw error;
}

export async function createCustomChecklistItem(input: {
  householdId: string;
  checklistSlug: string;
  category: string | null;
  label: string;
  sortOrder: number;
}): Promise<void> {
  const { error } = await supabase
    .from('household_custom_checklist_items')
    .insert({
      household_id: input.householdId,
      checklist_slug: input.checklistSlug,
      category: input.category,
      label: input.label,
      sort_order: input.sortOrder,
    });

  if (error) throw error;
}

export async function deleteCustomChecklistItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('household_custom_checklist_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
}

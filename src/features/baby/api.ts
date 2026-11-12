import { supabase } from '@/lib/supabase/client';
import type { Database, Json } from '@/lib/supabase/database.types';
import type { BabyEntry, BabyModuleSlug } from './constants';

type BabyEntryRow = Database['public']['Tables']['baby_entries']['Row'];

/** Ce que le formulaire saisit — tout sauf l'identifiant. */
export type BabyEntryInput = Omit<BabyEntry, 'id'>;

/**
 * Entrées d'un module pour le foyer, de la plus récente à la plus ancienne
 * (demande explicite) : date, puis heure, puis saisie la plus récente à
 * moment égal. RLS : `baby_entries_select_members`.
 */
export async function fetchBabyEntries(
  householdId: string,
  module: BabyModuleSlug,
): Promise<BabyEntry[]> {
  const { data, error } = await supabase
    .from('baby_entries')
    .select('*')
    .eq('household_id', householdId)
    .eq('module', module)
    .order('entry_date', { ascending: false })
    .order('entry_time', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(rowToEntry);
}

/**
 * `created_by` est rempli par défaut avec `auth.uid()` côté base, et la
 * policy d'insertion l'exige : le client n'a pas à l'envoyer.
 */
export async function createBabyEntry(
  householdId: string,
  module: BabyModuleSlug,
  input: BabyEntryInput,
): Promise<BabyEntry> {
  const { data, error } = await supabase
    .from('baby_entries')
    .insert({ household_id: householdId, module, ...inputToColumns(input) })
    .select()
    .single();

  if (error) throw error;
  return rowToEntry(data);
}

/** Seules les colonnes du formulaire sont modifiables (droits par colonne). */
export async function updateBabyEntry(
  id: string,
  input: BabyEntryInput,
): Promise<BabyEntry> {
  const { data, error } = await supabase
    .from('baby_entries')
    .update({ ...inputToColumns(input), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToEntry(data);
}

/** RLS : `baby_entries_delete_members` — l'un ou l'autre parent. */
export async function deleteBabyEntry(id: string): Promise<void> {
  const { error } = await supabase.from('baby_entries').delete().eq('id', id);

  if (error) throw error;
}

function inputToColumns(input: BabyEntryInput) {
  return {
    entry_date: input.date,
    entry_time: input.time,
    segment: input.segment,
    measures: input.values as Json,
    comment: input.comment,
  };
}

function rowToEntry(row: BabyEntryRow): BabyEntry {
  return {
    id: row.id,
    date: row.entry_date,
    // Postgres renvoie `HH:MM:SS` ; l'app manipule `HH:MM`.
    time: row.entry_time ? row.entry_time.slice(0, 5) : null,
    segment: row.segment,
    values: measuresToValues(row.measures),
    comment: row.comment,
  };
}

/** `measures` est un objet JSON de chaînes ; tout le reste est ignoré. */
function measuresToValues(measures: Json): Record<string, string> {
  if (!measures || typeof measures !== 'object' || Array.isArray(measures)) {
    return {};
  }
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(measures)) {
    if (typeof value === 'string' || typeof value === 'number') {
      values[key] = String(value);
    }
  }
  return values;
}

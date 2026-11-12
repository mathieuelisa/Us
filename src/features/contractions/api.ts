import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';
import type { Contraction, ContractionSession } from './rules';

type SessionRow = Database['public']['Tables']['contraction_sessions']['Row'];
type ContractionRow = Database['public']['Tables']['contractions']['Row'];

/** Violation d'unicité Postgres (suivi ou contraction déjà ouverts). */
export const UNIQUE_VIOLATION = '23505';

/**
 * Dernier suivi du foyer avec ses contractions, ou `null`. RLS :
 * `contraction_sessions_select_members` / `contractions_select_members`.
 */
export async function fetchLatestContractionSession(
  householdId: string,
): Promise<ContractionSession | null> {
  const { data, error } = await supabase
    .from('contraction_sessions')
    .select('*, contractions(*)')
    .eq('household_id', householdId)
    .order('started_at', { ascending: false })
    .order('started_at', { referencedTable: 'contractions', ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return rowToSession(data, data.contractions);
}

/**
 * Ouvre un suivi. Un seul suivi ouvert par foyer (index unique partiel) :
 * si l'autre parent vient d'en ouvrir un, l'erreur `23505` remonte et
 * l'appelant reprend le suivi existant.
 */
export async function createContractionSession(
  householdId: string,
  startedAt: string,
): Promise<ContractionSession> {
  const { data, error } = await supabase
    .from('contraction_sessions')
    .insert({ household_id: householdId, started_at: startedAt })
    .select()
    .single();

  if (error) throw error;
  return rowToSession(data, []);
}

export async function startContraction(
  session: { id: string; householdId: string },
  startedAt: string,
): Promise<Contraction> {
  const { data, error } = await supabase
    .from('contractions')
    .insert({
      session_id: session.id,
      household_id: session.householdId,
      started_at: startedAt,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToContraction(data);
}

/** Seule la fin est modifiable (droits par colonne). */
export async function endContraction(
  id: string,
  endedAt: string,
): Promise<void> {
  const { error } = await supabase
    .from('contractions')
    .update({ ended_at: endedAt })
    .eq('id', id);

  if (error) throw error;
}

export async function endContractionSession(
  id: string,
  endedAt: string,
): Promise<void> {
  const { error } = await supabase
    .from('contraction_sessions')
    .update({ ended_at: endedAt })
    .eq('id', id);

  if (error) throw error;
}

/** Corrige un appui de trop. RLS : l'un ou l'autre parent. */
export async function deleteContraction(id: string): Promise<void> {
  const { error } = await supabase.from('contractions').delete().eq('id', id);

  if (error) throw error;
}

function rowToSession(
  row: SessionRow,
  contractions: ContractionRow[],
): ContractionSession {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    contractions: contractions.map(rowToContraction),
  };
}

function rowToContraction(row: ContractionRow): Contraction {
  return { id: row.id, startedAt: row.started_at, endedAt: row.ended_at };
}

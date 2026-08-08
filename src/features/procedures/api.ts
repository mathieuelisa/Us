import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type ProcedureTemplate =
  Database['public']['Tables']['procedure_templates']['Row'];
type HouseholdProcedureStatus =
  Database['public']['Tables']['household_procedures']['Row']['status'];

export type ProcedureWithStatus = ProcedureTemplate & {
  householdProcedureId: string;
  status: HouseholdProcedureStatus;
  reminderEnabled: boolean;
};

/**
 * `household_procedures` est auto-peuplée par trigger à la création du
 * foyer (cf. migrations) : le client n'a jamais besoin d'y insérer,
 * seulement de lire et modifier le statut.
 */
export async function fetchProcedures(
  householdId: string,
): Promise<ProcedureWithStatus[]> {
  const { data, error } = await supabase
    .from('household_procedures')
    .select('id, status, reminder_enabled, procedure_templates(*)')
    .eq('household_id', householdId)
    .order('sort_order', { referencedTable: 'procedure_templates' });

  if (error) throw error;

  return data
    .filter((row) => row.procedure_templates !== null)
    .map((row) => ({
      ...(row.procedure_templates as ProcedureTemplate),
      householdProcedureId: row.id,
      status: row.status,
      reminderEnabled: row.reminder_enabled,
    }));
}

export async function updateProcedureStatus(
  householdProcedureId: string,
  status: HouseholdProcedureStatus,
): Promise<void> {
  const { error } = await supabase
    .from('household_procedures')
    .update({ status })
    .eq('id', householdProcedureId);

  if (error) throw error;
}

export async function updateProcedureReminder(
  householdProcedureId: string,
  reminderEnabled: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('household_procedures')
    .update({ reminder_enabled: reminderEnabled })
    .eq('id', householdProcedureId);

  if (error) throw error;
}

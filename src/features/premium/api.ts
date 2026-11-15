import { FunctionsHttpError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

export type HouseholdEntitlement =
  Database['public']['Tables']['household_entitlements']['Row'];

/**
 * Clé publiable Stripe (`pk_test_…` en développement, `pk_live_…` en
 * production). Sans elle, le bouton d'achat reste désactivé.
 */
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
export const isStripeConfigured = STRIPE_PUBLISHABLE_KEY.startsWith('pk_');

/** Droit premium du foyer (RLS : membres du foyer, lecture seule). */
export async function fetchEntitlement(
  householdId: string,
): Promise<HouseholdEntitlement | null> {
  const { data, error } = await supabase
    .from('household_entitlements')
    .select('*')
    .eq('household_id', householdId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Erreur renvoyée par `stripe-create-payment`, avec son code. */
export class PremiumPaymentError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

/**
 * PaymentIntent du premium pour le foyer de l'appelant (Edge Function
 * `stripe-create-payment`), à présenter dans le formulaire Stripe natif.
 */
export async function createPaymentSheetIntent(): Promise<{
  clientSecret: string;
}> {
  const { data, error } = await supabase.functions.invoke(
    'stripe-create-payment',
    { method: 'POST' },
  );
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      throw new PremiumPaymentError(payload?.error ?? 'unknown');
    }
    throw error;
  }
  return data as { clientSecret: string };
}

const ERROR_MESSAGES: Record<string, string> = {
  already_premium: 'Votre foyer a déjà le premium.',
  no_household: 'Aucun foyer trouvé pour ce compte.',
  not_authenticated: 'Reconnectez-vous puis réessayez.',
  server_misconfigured: 'Le paiement est momentanément indisponible.',
  stripe_error: 'Le paiement n’a pas pu démarrer. Réessayez.',
};

export function getPremiumPaymentErrorMessage(error: unknown): string {
  if (error instanceof PremiumPaymentError) {
    return ERROR_MESSAGES[error.code] ?? 'Le paiement n’a pas pu démarrer.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Le paiement n’a pas abouti.';
}

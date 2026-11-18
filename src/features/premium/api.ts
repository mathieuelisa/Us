import { FunctionsHttpError } from '@supabase/supabase-js';

import i18n from '@/i18n';
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

const ERROR_CODES = [
  'already_premium',
  'no_household',
  'not_authenticated',
  'server_misconfigured',
  'stripe_error',
] as const;

type PaymentErrorCode = (typeof ERROR_CODES)[number];

export function getPremiumPaymentErrorMessage(error: unknown): string {
  if (error instanceof PremiumPaymentError) {
    return (ERROR_CODES as readonly string[]).includes(error.code)
      ? i18n.t(`payment.errors.${error.code as PaymentErrorCode}`)
      : i18n.t('payment.errors.couldNotStart');
  }
  if (error instanceof Error && error.message) return error.message;
  return i18n.t('payment.errors.failed');
}

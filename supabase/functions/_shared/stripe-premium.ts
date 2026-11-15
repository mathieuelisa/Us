// Code commun aux Edge Functions Stripe du premium (paiement dans l'app,
// choix du 2026-11-15).

/** Offre affichée par `PremiumOffer` : 14,99 €, paiement unique. */
export const PREMIUM_OFFER = {
  product: 'premium_lifetime',
  amount: 1499,
  currency: 'eur',
  name: 'US Premium — suivi complet de bébé',
} as const;

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

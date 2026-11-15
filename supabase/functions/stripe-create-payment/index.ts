// Crée le paiement Stripe du premium pour le foyer de l'appelant, à
// présenter dans le formulaire Stripe natif de l'app (PaymentSheet) —
// parcours retenu le 2026-11-15 (demande explicite). Renvoie le
// `client_secret` du PaymentIntent.
//
// Moyens de paiement dynamiques : tous ceux activés dans le tableau de bord
// Stripe (carte, PayPal…) apparaissent sans changer ce code.
//
// Le droit premium n'est **jamais** accordé ici : seul `stripe-webhook` le
// crée, une fois le paiement confirmé par Stripe. Le foyer voyage dans les
// métadonnées du PaymentIntent, et vient du jeton de l'appelant — l'app ne
// peut pas payer pour un autre foyer.
//
// Déployée avec `verify_jwt = true`.
// Secret requis : `STRIPE_SECRET_KEY`.

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

import { corsHeaders, json, PREMIUM_OFFER } from '../_shared/stripe-premium.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }

  const authorization = req.headers.get('Authorization');
  if (!authorization) {
    return json({ error: 'not_authenticated' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!supabaseUrl || !anonKey || !stripeSecretKey) {
    return json({ error: 'server_misconfigured' }, 500);
  }

  // Toutes les lectures passent par le jeton de l'appelant : la RLS limite
  // déjà `households` et `household_entitlements` à son propre foyer.
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();
  if (userError || !user) {
    return json({ error: 'not_authenticated' }, 401);
  }

  const { data: household, error: householdError } = await userClient
    .from('households')
    .select('id')
    .maybeSingle();
  if (householdError) {
    return json({ error: 'household_lookup_failed' }, 500);
  }
  if (!household) {
    return json({ error: 'no_household' }, 400);
  }

  const { data: entitlement } = await userClient
    .from('household_entitlements')
    .select('household_id')
    .eq('household_id', household.id)
    .maybeSingle();
  if (entitlement) {
    return json({ error: 'already_premium' }, 409);
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PREMIUM_OFFER.amount,
      currency: PREMIUM_OFFER.currency,
      automatic_payment_methods: { enabled: true },
      description: PREMIUM_OFFER.name,
      receipt_email: user.email ?? undefined,
      metadata: {
        household_id: household.id,
        user_id: user.id,
        product: PREMIUM_OFFER.product,
      },
    });
    return json({ clientSecret: paymentIntent.client_secret }, 200);
  } catch (error) {
    console.error('stripe_error', error);
    return json({ error: 'stripe_error' }, 502);
  }
});

// Webhook Stripe : seule source du droit premium (`household_entitlements`).
//
//   - `payment_intent.succeeded` : couvre les deux parcours (Checkout pose
//     les mêmes métadonnées sur son PaymentIntent) ; accorde le premium au
//     foyer indiqué dans les métadonnées, posées par `stripe-create-payment`
//     à partir du jeton de l'acheteur ;
//   - `charge.refunded` : un remboursement total retire le droit.
//
// La signature Stripe est vérifiée avant toute lecture : sans elle,
// n'importe qui pourrait s'offrir le premium en appelant cette URL.
// Idempotent : Stripe peut renvoyer un événement plusieurs fois.
//
// Déployée avec `verify_jwt = false` (Stripe n'a pas de jeton Supabase).
// Secrets requis : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (`whsec_…`).

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@17';

import { PREMIUM_OFFER } from '../_shared/stripe-premium.ts';

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('method_not_allowed', { status: 405 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !webhookSecret) {
    return new Response('server_misconfigured', { status: 500 });
  }

  const signature = req.headers.get('Stripe-Signature');
  if (!signature) {
    return new Response('missing_signature', { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch {
    return new Response('invalid_signature', { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const householdId = paymentIntent.metadata?.household_id;
    if (
      !householdId ||
      paymentIntent.metadata?.product !== PREMIUM_OFFER.product
    ) {
      // Paiement sans rapport avec le premium : rien à faire.
      return new Response('ignored', { status: 200 });
    }

    // `ignoreDuplicates` : un foyer déjà premium garde son premier achat.
    const { error } = await admin.from('household_entitlements').upsert(
      {
        household_id: householdId,
        product: PREMIUM_OFFER.product,
        source: 'stripe',
        provider_ref: paymentIntent.id,
        livemode: event.livemode,
        purchased_at: new Date(paymentIntent.created * 1000).toISOString(),
      },
      { onConflict: 'household_id', ignoreDuplicates: true },
    );
    if (error) {
      console.error('entitlement_upsert_failed', error);
      // 500 : Stripe réessaiera plus tard.
      return new Response('entitlement_upsert_failed', { status: 500 });
    }
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (charge.refunded && paymentIntentId) {
      const { error } = await admin
        .from('household_entitlements')
        .delete()
        .eq('provider_ref', paymentIntentId);
      if (error) {
        console.error('entitlement_delete_failed', error);
        return new Response('entitlement_delete_failed', { status: 500 });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

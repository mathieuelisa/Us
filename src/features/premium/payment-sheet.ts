import {
  initPaymentSheet,
  initStripe,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import * as Linking from 'expo-linking';

import { STRIPE_PUBLISHABLE_KEY } from './api';

/** Le formulaire Stripe natif existe sur iOS et Android, pas sur le web. */
export const isPaymentSheetSupported = true;

let stripeReady: Promise<void> | null = null;

/**
 * Ouvre le formulaire de paiement Stripe (PaymentSheet) pour un
 * PaymentIntent déjà créé côté serveur. `canceled` si la personne ferme le
 * formulaire sans payer.
 *
 * Le SDK est initialisé à la première utilisation plutôt qu'avec un
 * `StripeProvider` à la racine : il ne sert qu'à l'achat du premium.
 */
export async function payWithPaymentSheet(
  clientSecret: string,
): Promise<'paid' | 'canceled'> {
  stripeReady ??= initStripe({ publishableKey: STRIPE_PUBLISHABLE_KEY });
  await stripeReady;

  const init = await initPaymentSheet({
    merchantDisplayName: 'US',
    paymentIntentClientSecret: clientSecret,
    // Retour dans l'app après une méthode qui passe par une redirection
    // (3D Secure, banque…).
    returnURL: Linking.createURL('stripe-redirect'),
  });
  if (init.error) throw new Error(init.error.message);

  const result = await presentPaymentSheet();
  if (result.error) {
    if (result.error.code === 'Canceled') return 'canceled';
    throw new Error(result.error.message);
  }
  return 'paid';
}

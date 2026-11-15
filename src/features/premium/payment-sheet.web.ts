/**
 * Le SDK Stripe React Native n'existe pas sur le web : le formulaire natif
 * n'est proposé que sur iOS et Android. Ce fichier évite que le bundle web
 * importe le module natif.
 */
export const isPaymentSheetSupported = false;

export async function payWithPaymentSheet(
  _clientSecret: string,
): Promise<'paid' | 'canceled'> {
  throw new Error('Le paiement dans l’app n’est disponible que sur mobile.');
}

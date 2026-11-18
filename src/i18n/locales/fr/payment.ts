/** Erreurs du paiement premium (Stripe). */
export const payment = {
  errors: {
    already_premium: 'Votre foyer a déjà le premium.',
    no_household: 'Aucun foyer trouvé pour ce compte.',
    not_authenticated: 'Reconnectez-vous puis réessayez.',
    server_misconfigured: 'Le paiement est momentanément indisponible.',
    stripe_error: 'Le paiement n’a pas pu démarrer. Réessayez.',
    couldNotStart: 'Le paiement n’a pas pu démarrer.',
    failed: 'Le paiement n’a pas abouti.',
    mobileOnly: 'Le paiement dans l’app n’est disponible que sur mobile.',
  },
};

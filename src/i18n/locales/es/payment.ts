import type { Messages } from '../fr';

export const payment: Messages['payment'] = {
  errors: {
    already_premium: 'Tu hogar ya tiene el premium.',
    no_household: 'No se ha encontrado ningún hogar para esta cuenta.',
    not_authenticated: 'Vuelve a iniciar sesión e inténtalo de nuevo.',
    server_misconfigured: 'El pago no está disponible por el momento.',
    stripe_error: 'No se ha podido iniciar el pago. Inténtalo de nuevo.',
    couldNotStart: 'No se ha podido iniciar el pago.',
    failed: 'El pago no se ha completado.',
    mobileOnly: 'El pago en la app solo está disponible en el móvil.',
  },
};

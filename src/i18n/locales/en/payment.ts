import type { Messages } from '../fr';

export const payment: Messages['payment'] = {
  errors: {
    already_premium: 'Your household already has Premium.',
    no_household: 'No household found for this account.',
    not_authenticated: 'Sign in again, then try again.',
    server_misconfigured: 'Payment is temporarily unavailable.',
    stripe_error: 'Payment couldn’t start. Try again.',
    couldNotStart: 'Payment couldn’t start.',
    failed: 'Payment didn’t go through.',
    mobileOnly: 'In-app payment is only available on mobile.',
  },
};

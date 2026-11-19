import type { Messages } from '../fr';

export const auth: Messages['auth'] = {
  mode: {
    signIn: {
      title: 'Welcome back',
      subtitle: 'Sign in to get back to your shared space.',
    },
    signUp: {
      title: 'Welcome to US',
      subtitle: 'Create your account in a few seconds.',
    },
  },
  toggle: {
    signIn: 'Sign in',
    signUp: 'Sign up',
  },
  accountCreated:
    'Account created! Confirm your address with the link we emailed you, then sign in.',
  enterEmailFirst: 'Enter your email above first to receive the link.',
  resetSent:
    'If an account exists for this email, a reset link is on its way. It signs you in: then choose a new password in Settings.',
  passwordMismatch: 'The two passwords don’t match.',
  hidePassword: 'Hide password',
  showPassword: 'Show password',
  youAre: 'You are…',
  role: {
    pregnantTitle: 'I’m expecting a baby',
    pregnantSubtitle: 'I create our space',
    partnerTitle: 'I’m the partner',
    partnerSubtitle: 'I join with a code',
  },
  emailPlaceholder: 'your@email.com',
  password: 'Password',
  confirmPassword: 'Confirm password',
  forgotPassword: 'Forgot your password?',
  creating: 'Creating…',
  signingIn: 'Signing in…',
  createAccount: 'Create my account',
  signIn: 'Sign in',
  or: 'or',
  openingGoogle: 'Opening Google…',
  continueWithGoogle: 'Continue with Google',
  strength: {
    tooShort: 'Too short',
    weak: 'Weak password',
    fair: 'Fair password',
    good: 'Good password',
    strong: 'Strong password',
    a11y: 'Password strength: {{label}}',
    criteria: {
      length: '{{count}} characters min.',
      case: 'Upper and lower case',
      digit: 'Number',
      symbol: 'Symbol',
    },
  },
  errors: {
    invalidCredentials: 'Incorrect email or password.',
    emailNotConfirmed: 'Confirm your address first: we’ve emailed you a link.',
    userExists: 'An account already exists with this email. Sign in instead.',
    weakPassword:
      'Password too weak: at least {{count}} characters, mix letters and numbers.',
    wrongCurrentPassword: 'Current password is incorrect.',
    samePassword: 'The new password must be different from the current one.',
    googleDisabled: 'Signing in with Google isn’t enabled yet.',
    invalidEmail: 'This email address isn’t valid.',
    rateLimit: 'Too many attempts. Try again in a few minutes.',
    signupDisabled: 'Sign-ups are closed for now.',
    reauthNeeded: 'Sign in again before changing your password.',
    network: 'Can’t connect. Check your network.',
    unknown: 'Something went wrong. Try again.',
  },
};

import type { Messages } from '../fr';

export const settings: Messages['settings'] = {
  title: 'Settings',
  subtitleSolo: 'Just for you.',
  subtitle: 'Just for you — not shared with your partner.',
  account: {
    section: 'Account',
    noAccount: 'DEV mode — no account signed in',
    signInToManage: 'Sign in to manage your account.',
    viaGoogleOrPassword: 'Signed in with Google or password',
    viaGoogle: 'Signed in with Google',
    viaPassword: 'Signed in with email and password',
    changePassword: 'Change password',
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    deleteAccount: 'Delete my account',
  },
  notifications: {
    section: 'Notifications',
    appointments: 'Appointments',
    appointmentsHint: 'The day before at 7 pm, then 1 hour before',
    procedures: 'Paperwork',
    proceduresHint: 'Those with “Remind me” turned on',
    vaccines: 'Baby’s vaccines',
    vaccinesHint: '7 days before and on the day, at 9 am',
    mood: 'Today’s mood',
    moodHint:
      'A gentle in-app reminder at 9 am, 2 pm and 7 pm if it’s not filled in',
    partner: 'Your partner',
    partnerHint: 'Mood, symptoms, shared appointment, birth',
    toggleLabel: 'Notifications: {{label}}',
    webOnly: 'Notifications only work on a phone.',
    blocked: 'Notifications are blocked on this phone.',
    openSettings: 'Open settings',
    enablePrompt: 'Get your reminders and news from the other parent.',
    enable: 'Turn on',
  },
  appearance: {
    section: 'Appearance',
    themeLabel: '{{label}} theme',
    themes: {
      sauge: 'Sage',
      corail: 'Coral',
      lavande: 'Lavender',
      ocre: 'Ochre',
    },
  },
  language: {
    label: 'Language',
    a11y: 'Language: {{value}}',
    sheetTitle: 'App language',
    sheetHint:
      'Just for you: your partner keeps their own language. Paperwork and some content are still in French for now.',
  },
  tour: {
    label: 'Replay the guided tour',
    a11y: 'Replay the guided tour of the home screen',
    hint: 'Rediscover the home screen in a few steps',
  },
  share: {
    titleBefore: 'Share',
    description: 'Someone close expecting a baby? Introduce them to the app.',
    button: 'Share the app',
    message:
      'I recommend US, the app for going through pregnancy and baby’s first months together.',
    unavailable: 'Sharing isn’t available on this device.',
  },
  privacy: {
    section: 'Privacy',
    privacyPolicy: 'Privacy policy',
    terms: 'Terms of use',
    legalNotice: 'Legal notice',
  },
  password: {
    title: 'Change password',
    confirmCurrent: 'For your security, first confirm your current password.',
    fromResetLink:
      'You came from a reset link: choose your new password straight away.',
    updated: 'Password updated.',
    current: 'Current password',
    resetSent: 'A reset link has been sent to {{email}}.',
    forgot: 'Forgot your password?',
    new: 'New password',
    confirm: 'Confirm password',
    minLength: 'At least {{count}} characters.',
    sameAsCurrent: 'The new password must be different from the current one.',
    mismatch: 'The two passwords don’t match.',
  },
  deleteAccount: {
    title: 'Delete your account?',
    pregnant:
      'Your shared space will be deleted with all its data — journal, appointments, paperwork, bags, information — including for your partner.',
    partner:
      'Your moods, your appointments and your access to the shared space will be deleted. The space and its data stay with the other parent.',
    final: 'This is permanent: nothing can be recovered.',
    confirm: 'Delete permanently',
    failed: 'Deletion failed. Check your connection and try again.',
  },
};

import type { Messages } from '../fr';

export const onboarding: Messages['onboarding'] = {
  next: 'Next',
  start: 'Get started',
  finish: 'Finish',
  backToLogin: 'Back to sign-in',
  previousStep: 'Previous step',
  backToPreviousStep: 'Back to the previous step',
  quitToLogin: 'Leave setup and go back to sign-in',
  slides: {
    welcome: {
      title: 'Welcome to US',
      description:
        'The app designed for couples expecting a child. Make everyday life simpler, together, from the first trimester to the first months.',
    },
    feelings: {
      title: 'Share your feelings',
      description:
        'With US, you’ll know how your partner feels day to day — with a simple tap, stay connected despite tiredness and stress.',
    },
    together: {
      title: 'Follow the pregnancy together',
      description:
        'Appointments, symptoms, baby’s size week by week: all the key information in one place, shared by the two of you.',
    },
    paperwork: {
      title: 'Never miss any paperwork',
      description:
        'Family allowance, health insurance, birth registration… US reminds you what to do and when, so nothing is forgotten after baby arrives.',
    },
  },
  intro: {
    title: 'Let’s get to know each other',
    subtitle:
      'Your first name and how to refer to you: they’re only used to personalise the app for the two of you.',
    howToRefer: 'How should we refer to you?',
    pronouns: {
      il: {
        label: 'He',
        description: 'E.g. “Bram is doing great, he…”',
      },
      elle: {
        label: 'She',
        description: 'E.g. “Camille is doing great, she…”',
      },
      neutre: {
        label: 'Just my first name',
        description: 'No “he” or “she”',
      },
    },
    saveError: 'Can’t save right now. Check your connection, then try again.',
  },
  firstName: 'Your first name',
  firstNameRequired: 'Your first name is required.',
  accompaniment: {
    title: 'Who’s with you on this journey?',
    options: {
      couple: 'As a couple',
      coparentalite: 'Co-parenting without living together',
      seul: 'On my own',
    },
    partnerUsesApp: 'Will your partner use the app too?',
  },
  names: {
    title: 'Little by little, let’s get acquainted',
    subtitle:
      'These first names are only used to personalise your space — never to identify you.',
    partnerFirstName: 'Your partner’s first name',
    partnerFirstNameRequired: 'Your partner’s first name is required.',
  },
  dueDate: {
    title: 'What’s the due date?',
    mustBeFuture: 'The due date must be today or later.',
    firstChild: 'Is this your first child?',
    today: 'It’s today 💗',
    daysLeft_one: 'Just one day until you meet 💗',
    daysLeft_other: 'Just {{count}} days until you meet 💗',
    weeks_one: 'You’re {{count}} week since your last period.',
    weeks_other: 'You’re {{count}} weeks since your last period.',
  },
  status: {
    title: 'What’s your work status?',
    subtitle: 'To tailor your paperwork',
    options: {
      salarie_prive: 'Private-sector employee',
      fonctionnaire: 'Civil servant',
      independant: 'Self-employed',
      sans_emploi: 'Currently not working',
    },
  },
  priorities: {
    title: 'What are your priorities?',
    subtitle: 'Choose as many as you like',
    options: {
      demarches: 'Administrative paperwork',
      sante: 'Health tracking',
      partage: 'Sharing with your partner',
      rendez_vous: 'Key dates and appointments',
    },
  },
  reminders: {
    title: 'How often would you like reminders?',
    options: {
      realtime: {
        label: 'As things happen',
        description: 'A notification at each step',
      },
      weekly: {
        label: 'Weekly summary',
        description: 'A recap every week',
      },
    },
  },
  reassurance: {
    title: 'You’ve made the right choice',
    subtitle:
      'Thousands of parents already use US to go through this stage with peace of mind',
    done: 'Setup complete',
    downloadsValue: '50,000+',
    downloads: 'Downloads',
    ratingValue: '4.8',
    rating: 'Average rating',
  },
  join: {
    title: 'Join your partner’s space',
    subtitle:
      'Enter the 6-character code shown in their app, or scan their QR code.',
    joining: 'Joining…',
    join: 'Join',
    createOwn: 'I’m expecting: I’ll create my own space',
    switchError: 'Couldn’t switch paths. Try again.',
    codeTitle: 'SPACE CODE',
    codeLabel: 'Space code',
    scanQr: 'Scan a QR code',
  },
  signOut: 'Sign out',
  finalising: {
    failed: 'Creating your space failed',
    failedHint:
      'Your answers are saved. Check your connection, then try again.',
    preparing: 'We’re preparing your space…',
  },
  leave: {
    signOutError: 'Couldn’t sign you out. Try again.',
    title: 'Go back to sign-in?',
    body: 'You’ll be signed out. Your account is kept: when you sign back in, you’ll restart setup from the beginning.',
    stay: 'Stay',
    signingOut: 'Signing out…',
    deleteAccount: 'Delete my account',
    deleteTitle: 'Delete your account?',
    deleteBody:
      'Your account and profile will be erased. You can create a new account later with the same email address.',
    final: 'This is permanent: nothing can be recovered.',
    deleteFailed: 'Deletion failed. Check your connection and try again.',
    deleting: 'Deleting…',
    deleteConfirm: 'Delete permanently',
  },
  qr: {
    title: 'Scan the QR code',
    close: 'Close the scanner',
    aim: 'Point at the QR code shown in your partner’s app.',
    cameraAccess: 'Camera access',
    denied:
      'Access was denied. Allow it in your phone’s settings, or enter the code by hand.',
    why: 'US needs it to read your partner’s QR code. Nothing is recorded.',
    allow: 'Allow camera',
  },
  stepOf: 'Step {{step}} of {{total}}',
};

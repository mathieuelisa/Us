import type { Messages } from '../fr';

export const premium: Messages['premium'] = {
  features: {
    names: 'Baby Name Match',
    contractions: 'Contractions & Hospital Departure Assistant',
    feeding: 'Feeding & Routines (breastfeeding log, bottles & stats)',
    sleepRhythm: 'Baby’s sleep rhythm tracking',
    growth: 'Growth Record (weight/height charts)',
    dailyCare: 'Sleep, Bath & Daily Care log',
    vaccines: 'Health Space & Vaccine Reminder Calendar',
  },
  paywall: {
    title: 'Unlock complete baby tracking',
    oneTime: 'One payment, lifetime access',
    price: '€14.99 — one-time payment',
    noSubscription: 'No subscription, no renewal',
    forBoth: 'Valid for both of you',
    partnerFree: ': your partner has nothing to pay.',
    unlockLater: 'Unlock it from your space',
    later: 'Later',
  },
  benefits: {
    title: 'Your Premium benefits',
    subtitle: 'Enjoy all the exclusive features.',
    active: 'ACTIVE',
    hero: 'Unlimited access to all the essential features for your pregnancy.',
    baby: 'Your baby',
    babySubtitle: 'Growth, bottles, breastfeeding, sleep',
    names: 'Baby name match',
    namesSubtitleSolo: 'Find the perfect name',
    namesSubtitle: 'Find the perfect name together',
    contractions: 'Contractions & Hospital Departure Assistant',
    contractionsSubtitle: 'Time them, we’ll tell you when to go',
    openA11y: 'Open {{title}}, included in your Premium',
    included: 'Included',
  },
  locked: {
    unlockA11y: 'Unlock with Premium',
  },
  teaser: {
    badge: 'Premium',
  },
  purchase: {
    pending:
      'Payment received. Premium activates for both of you in a few moments.',
    canceled: 'Payment cancelled. You can try again whenever you like.',
    active: 'Premium active',
    mobileOnly: 'Purchase available in the mobile app',
    processing: 'Processing payment…',
    unlock: 'Unlock — €14.99',
  },
};

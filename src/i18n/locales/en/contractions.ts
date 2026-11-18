import type { Messages } from '../fr';

export const contractions: Messages['contractions'] = {
  description:
    'Time your contractions together, follow their rhythm and know when to head to the maternity unit.',
  descriptionSolo:
    'Time your contractions, follow their rhythm and know when to head to the maternity unit.',
  lockedTitle: 'Contractions assistant',
  unlock: 'Unlock the contractions assistant',
  title: 'Contractions & departure',
  errors: {
    end: 'The end of the contraction wasn’t saved.',
    start: 'The contraction wasn’t saved.',
    finish: 'The session couldn’t be ended.',
    delete: 'The contraction couldn’t be deleted.',
  },
  loading: 'Loading…',
  hint: {
    stop: 'Tap again when the contraction stops.',
    next: 'Tap as soon as the next contraction starts.',
    first: 'Tap as soon as a contraction starts:{{br}}tracking begins with it.',
  },
  stats: {
    count: 'Contractions',
    avgDuration: 'Avg. length',
    avgInterval: 'Avg. interval',
  },
  session: {
    ongoing: 'TRACKING IN PROGRESS',
    last: 'LAST SESSION',
    none: 'NO TRACKING IN PROGRESS',
    summary_one: '{{duration}} · {{count}} contraction',
    summary_other: '{{duration}} · {{count}} contractions',
    startsWithFirst: 'It starts with the first contraction',
    finishA11y: 'End contraction tracking',
    finish: 'End',
  },
  button: {
    endA11y: 'End of contraction, ongoing for {{duration}}',
    startA11y: 'Contraction start',
    end: 'End',
    start: 'Contraction{{br}}starts',
    endCaps: 'CONTRACTION',
  },
  rule: {
    text: 'Contractions every {{interval}} or less for {{window}}{{who}}.',
    firstChild: ' (first baby)',
    nextChild: ' (later babies)',
    title: 'When to leave for the maternity unit?',
    timeToGo: 'It’s time to go.',
    regularFor: 'Regular for {{duration}}',
    notRegular: 'No regular rhythm yet',
    see: 'View',
  },
  history: {
    ongoing: 'Ongoing',
    first: 'First contraction',
    after: '{{duration}} after the previous one',
    delete: 'Delete contraction {{number}}',
    title: 'HISTORY',
  },
  departure: {
    title: 'It’s time to leave{{br}}for the maternity unit',
    every: 'Your contractions come about every {{duration}}',
    regular: 'Your contractions are regular',
    since: 'for {{duration}}',
    lasting: 'and last {{duration}} on average.',
    advice:
      'Head off calmly and let the maternity unit know if you were asked to.',
    bagA11y: 'Maternity bag, {{checked}} of {{total}} ready',
    bag: 'Maternity bag',
    checkBag: 'Check nothing is missing',
    bagProgress: '{{checked}} of {{total}} ready',
    understood: 'Got it',
    disclaimer:
      'For guidance only: it doesn’t replace the advice of your midwife or the maternity unit.',
  },
};

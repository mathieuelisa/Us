import type { Messages } from '../fr';

export const together: Messages['together'] = {
  title: 'Together',
  subtitleSolo: 'Take the pulse of your day.',
  subtitle: 'Take the pulse of your day, together.',
  howDoYouFeel: 'How are you feeling today?',
  gesture: {
    badge: 'TODAY’S GESTURE',
    subtitle: 'A small kindness to offer today',
    tomorrow: 'A new gesture awaits you tomorrow.',
  },
  need: {
    prompt: 'Tell us what you need,{{br}}we’re here for you ✨',
    title: 'Anything in particular?',
    placeholder: 'Or write your own need…',
  },
  week: {
    title: 'This week',
    dayMood: '{{day}}: {{mood}}',
    noCheckIn: '{{day}}: no check-in',
    noted: '{{count}} / 7 days noted',
  },
  needs: {
    sommeil: 'Sleep',
    calin: 'A hug',
    parler: 'Just talk',
    massage: 'Massage',
    coup_de_main: 'A practical hand',
    calme: 'Some quiet',
    rassurée: 'Reassurance',
    attention: 'A little attention',
    moment_a_deux: 'Time together',
  },
};

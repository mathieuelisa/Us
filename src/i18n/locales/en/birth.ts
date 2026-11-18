import type { Messages } from '../fr';

export const birth: Messages['birth'] = {
  birthDate: 'Date of birth',
  whatChanges: 'What this changes',
  otherProcedures: 'Your other paperwork',
  realigned:
    'Milestones and reminders realigned to the chosen date, for both of you.',
  allUpdated:
    'All your paperwork dates and deadlines will update automatically based on this date.',
  correctDate: 'Correct the date',
  confirmBirth: 'Confirm the birth',
  saveFailed: 'Saving failed. Check your connection and try again.',
  chooseDate: 'Choose the date to continue',
  reviewBeforeSave: 'You’ll review the date before it’s saved',
  editBirthDate: 'Edit the date of birth',
  declared: 'Birth declared',
  gaveBirth: 'I’ve given birth',
  congrats: 'Congratulations — everything’s up to date on your side.',
  bigDay: 'The big day is here!',
  legalDeadline: 'Legal deadline',
  birthDateCaps: 'DATE OF BIRTH',
  doNow: 'TO DO NOW',
  confirm: {
    title: 'Confirm this date?',
    body: 'Your paperwork deadlines will be recalculated from it.',
    canCorrect: 'You can correct it from this screen if you make a mistake.',
    yes: 'Yes, baby is here',
    edit: 'Change the date',
  },
  saving: 'Saving…',
  issues: {
    future:
      'This date is in the future — the birth is declared once baby has arrived.',
    tooOld: 'This date is more than a year ago, check the year you chose.',
  },
  since: {
    today: 'Since today',
    yesterday: 'Since yesterday',
    days: '{{count}} days ago',
    weeks: '{{count}} weeks ago',
    months_one: '{{count}} month ago',
    months_other: '{{count}} months ago',
  },
};

import type { Messages } from '../fr';

export const household: Messages['household'] = {
  categories: {
    blood_type: {
      picker: 'Blood type',
      section: 'Blood type',
      labelPlaceholder: 'Who — e.g. Mum',
      valuePlaceholder: 'Blood type',
    },
    vigilance: {
      picker: 'Thing to watch',
      section: 'Things to watch — mum',
      valuePlaceholder: 'e.g. gestational diabetes, high blood pressure',
    },
    allergy: {
      picker: 'Allergy',
      section: 'Allergies',
      valuePlaceholder: 'e.g. penicillin, peanuts',
    },
    phone: {
      picker: 'Phone',
      section: 'Phones',
      labelPlaceholder: 'Who — e.g. Midwife',
      valuePlaceholder: 'Phone number',
    },
    address: {
      picker: 'Address',
      section: 'Addresses',
      labelPlaceholder: 'What — e.g. Maternity unit',
    },
    date: {
      picker: 'Date',
      section: 'Key dates',
      labelPlaceholder: 'What — e.g. Due date',
    },
    social_security: {
      picker: 'Social security no.',
      section: 'Social security',
      labelPlaceholder: 'Who — e.g. Mum',
      valuePlaceholder: '15-digit number',
    },
  },
  title: 'Important information',
  subtitleSolo: 'Your important information, close at hand.',
  subtitle: 'Shared and editable by both of you.',
  loading: 'Loading…',
  others: 'Other',
  addInfo: 'Add information',
  empty: {
    title: 'No information yet',
    hint: 'Add blood type, allergies, useful numbers…',
    shared: 'They’ll be shared with your partner.',
    suggestions: 'Suggestions',
    addNamed: 'Add: {{label}}',
  },
  suggestions: {
    blood_type: 'Blood type',
    allergy: 'Allergies',
    phone: 'Useful numbers',
    vigilance: 'Things to watch',
  },
  form: {
    whatToAdd: 'What would you like to add?',
    selectCategory: 'Select the category you’d like to add information to.',
    changeCategory: 'Change category',
    editTitle: 'Edit — {{category}}',
    addTitle: 'Add — {{category}}',
    labelTaken:
      '“{{label}}” is already filled in: edit the existing item rather than adding another.',
    street: 'Street and number',
    city: 'City',
    postalCode: 'Postcode',
    addAllergies: 'Add {{count}} allergies',
    addPoints: 'Add {{count}} items',
    addItems: 'Add {{count}} items',
    add: 'Add',
  },
};

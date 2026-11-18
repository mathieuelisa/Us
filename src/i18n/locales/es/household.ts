import type { Messages } from '../fr';

export const household: Messages['household'] = {
  categories: {
    blood_type: {
      picker: 'Grupo sanguíneo',
      section: 'Grupo sanguíneo',
      labelPlaceholder: 'Quién — ej.: mamá',
      valuePlaceholder: 'Grupo sanguíneo',
    },
    vigilance: {
      picker: 'Punto de atención',
      section: 'Puntos de atención — mamá',
      valuePlaceholder: 'ej.: diabetes gestacional, hipertensión',
    },
    allergy: {
      picker: 'Alergia',
      section: 'Alergias',
      valuePlaceholder: 'ej.: penicilina, cacahuetes',
    },
    phone: {
      picker: 'Teléfono',
      section: 'Teléfonos',
      labelPlaceholder: 'Quién — ej.: matrona',
      valuePlaceholder: 'Número de teléfono',
    },
    address: {
      picker: 'Dirección',
      section: 'Direcciones',
      labelPlaceholder: 'Qué — ej.: maternidad',
    },
    date: {
      picker: 'Fecha',
      section: 'Fechas importantes',
      labelPlaceholder: 'Qué — ej.: fecha prevista',
    },
    social_security: {
      picker: 'N.º de la seguridad social',
      section: 'Seguridad social',
      labelPlaceholder: 'Quién — ej.: mamá',
      valuePlaceholder: 'Número de 15 cifras',
    },
  },
  title: 'Información importante',
  subtitleSolo: 'Tu información importante, siempre a mano.',
  subtitle: 'Compartida y editable por los dos.',
  loading: 'Cargando…',
  others: 'Otros',
  addInfo: 'Añadir información',
  empty: {
    title: 'Aún no hay información',
    hint: 'Añade grupo sanguíneo, alergias, números útiles…',
    shared: 'Se compartirán con tu pareja.',
    suggestions: 'Sugerencias',
    addNamed: 'Añadir: {{label}}',
  },
  suggestions: {
    blood_type: 'Grupo sanguíneo',
    allergy: 'Alergias',
    phone: 'Números útiles',
    vigilance: 'Puntos de atención',
  },
  form: {
    whatToAdd: '¿Qué quieres añadir?',
    selectCategory:
      'Selecciona la categoría a la que quieres añadir información.',
    changeCategory: 'Cambiar de categoría',
    editTitle: 'Editar — {{category}}',
    addTitle: 'Añadir — {{category}}',
    labelTaken:
      '«{{label}}» ya está indicado: edita el elemento existente en lugar de añadir otro.',
    street: 'Calle y número',
    city: 'Ciudad',
    postalCode: 'Código postal',
    addAllergies: 'Añadir {{count}} alergias',
    addPoints: 'Añadir {{count}} puntos',
    addItems: 'Añadir {{count}} elementos',
    add: 'Añadir',
  },
};

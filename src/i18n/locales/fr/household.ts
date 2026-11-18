/** Informations importantes (groupe sanguin, allergies, numéros…). */
export const household = {
  categories: {
    blood_type: {
      picker: 'Groupe sanguin',
      section: 'Groupe sanguin',
      labelPlaceholder: 'Qui — ex. Maman',
      valuePlaceholder: 'Groupe sanguin',
    },
    vigilance: {
      picker: 'Point de vigilance',
      section: 'Points de vigilance — maman',
      valuePlaceholder: 'ex. Diabète gestationnel, hypertension',
    },
    allergy: {
      picker: 'Allergie',
      section: 'Allergies',
      valuePlaceholder: 'ex. Pénicilline, arachides',
    },
    phone: {
      picker: 'Téléphone',
      section: 'Téléphones',
      labelPlaceholder: 'Qui — ex. Sage-femme',
      valuePlaceholder: 'Numéro de téléphone',
    },
    address: {
      picker: 'Adresse',
      section: 'Adresses',
      labelPlaceholder: 'Quoi — ex. Maternité',
    },
    date: {
      picker: 'Date',
      section: 'Dates importantes',
      labelPlaceholder: 'Quoi — ex. Terme',
    },
    social_security: {
      picker: 'N° sécurité sociale',
      section: 'Sécurité sociale',
      labelPlaceholder: 'Qui — ex. Maman',
      valuePlaceholder: 'Numéro à 15 chiffres',
    },
  },
  title: 'Informations importantes',
  subtitleSolo: 'Vos informations importantes, à portée de main.',
  subtitle: 'Partagées et modifiables par vous deux.',
  loading: 'Chargement…',
  others: 'Autres',
  addInfo: 'Ajouter une information',
  empty: {
    title: 'Aucune information pour l’instant',
    hint: 'Ajoutez groupe sanguin, allergies, numéros utiles…',
    shared: 'Elles seront partagées avec votre partenaire.',
    suggestions: 'Suggestions',
    addNamed: 'Ajouter : {{label}}',
  },
  suggestions: {
    blood_type: 'Groupe sanguin',
    allergy: 'Allergies',
    phone: 'Numéros utiles',
    vigilance: 'Points de vigilance',
  },
  form: {
    whatToAdd: 'Que voulez-vous ajouter ?',
    selectCategory:
      'Sélectionnez la catégorie à laquelle vous souhaitez ajouter une information.',
    changeCategory: 'Changer de catégorie',
    editTitle: 'Modifier — {{category}}',
    addTitle: 'Ajouter — {{category}}',
    labelTaken:
      '« {{label}} » est déjà renseigné : modifiez l’élément existant plutôt que d’en ajouter un autre.',
    street: 'Rue et numéro',
    city: 'Ville',
    postalCode: 'Code postal',
    addAllergies: 'Ajouter {{count}} allergies',
    addPoints: 'Ajouter {{count}} points',
    addItems: 'Ajouter {{count}} éléments',
    add: 'Ajouter',
  },
};

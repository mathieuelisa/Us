import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type InfoCategory =
  | 'blood_type'
  | 'vigilance'
  | 'allergy'
  | 'phone'
  | 'address'
  | 'date'
  | 'social_security';

/**
 * Ordre d'affichage des sections — le plus utile en urgence en premier
 * (demande explicite : "un visuel rapide des informations importantes") : le
 * groupe sanguin conditionne une transfusion, donc avant même la vigilance
 * et les allergies. L'administratif (n° sécurité sociale) reste en dernier.
 */
export const INFO_CATEGORY_ORDER: InfoCategory[] = [
  'blood_type',
  'vigilance',
  'allergy',
  'phone',
  'address',
  'date',
  'social_security',
];

export const INFO_CATEGORIES = new Set<string>(INFO_CATEGORY_ORDER);

export function isInfoCategory(value: string | null): value is InfoCategory {
  return value !== null && INFO_CATEGORIES.has(value);
}

export const INFO_CATEGORY_META: Record<
  InfoCategory,
  {
    icon: IoniconName;
    pickerLabel: string;
    sectionTitle: string;
    color: string;
    tint: string;
    needsLabel: boolean;
    labelPlaceholder: string;
    labelSuggestions: string[];
    /**
     * Libellés qui ne peuvent exister qu'une fois dans la catégorie (casse
     * ignorée) : une fois saisis, la suggestion disparaît et l'ajout est
     * bloqué — on modifie l'élément existant.
     */
    uniqueLabels?: string[];
    defaultLabel: string;
    valuePlaceholder: string;
    valueKeyboardType?: 'default' | 'phone-pad' | 'number-pad';
    multilineValue?: boolean;
    isDate?: boolean;
    isChip?: boolean;
    /** Valeur choisie parmi une liste fermée plutôt que saisie libre. */
    valueOptions?: string[];
    /**
     * Exemples à toucher sous le champ libre : remplissent la valeur, qui
     * reste modifiable (contrairement à `valueOptions`).
     */
    valueSuggestions?: string[];
  }
> = {
  blood_type: {
    icon: 'water-outline',
    pickerLabel: 'Groupe sanguin',
    sectionTitle: 'Groupe sanguin',
    color: '#BE123C',
    tint: '#FFE4E6',
    needsLabel: true,
    labelPlaceholder: 'Qui — ex. Maman',
    labelSuggestions: ['Maman', 'Partenaire'],
    defaultLabel: '',
    valuePlaceholder: 'Groupe sanguin',
    valueOptions: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
  },
  vigilance: {
    icon: 'medkit-outline',
    pickerLabel: 'Point de vigilance',
    sectionTitle: 'Points de vigilance — maman',
    color: '#DC2626',
    tint: '#FEE2E2',
    needsLabel: false,
    labelPlaceholder: '',
    labelSuggestions: [],
    defaultLabel: 'Point de vigilance',
    valuePlaceholder: 'ex. Diabète gestationnel, hypertension',
    // Exemples fréquents (demande explicite), simples raccourcis de saisie —
    // l'app n'en tire aucune conséquence médicale.
    valueSuggestions: [
      'Diabète gestationnel',
      'Hypertension',
      'Anémie',
      'Rhésus négatif',
      'Placenta bas',
      'Grossesse gémellaire',
      'Césarienne antérieure',
      'Asthme',
    ],
    isChip: true,
  },
  allergy: {
    icon: 'alert-circle-outline',
    pickerLabel: 'Allergie',
    sectionTitle: 'Allergies',
    color: '#D97706',
    tint: '#FEF3C7',
    needsLabel: false,
    labelPlaceholder: '',
    labelSuggestions: [],
    defaultLabel: 'Allergie',
    valuePlaceholder: 'ex. Pénicilline, arachides',
    // Allergies fréquentes (demande explicite), à cocher à plusieurs comme
    // les points de vigilance — simples raccourcis de saisie.
    valueSuggestions: [
      'Pénicilline',
      'Aspirine',
      'Ibuprofène',
      'Latex',
      'Arachides',
      'Fruits à coque',
      'Lait',
      'Œufs',
      'Gluten',
      'Fruits de mer',
      'Pollen',
      'Iode',
    ],
    isChip: true,
  },
  phone: {
    icon: 'call-outline',
    pickerLabel: 'Téléphone',
    sectionTitle: 'Téléphones',
    color: '#2563EB',
    tint: '#DBEAFE',
    needsLabel: true,
    labelPlaceholder: 'Qui — ex. Sage-femme',
    labelSuggestions: ['Sage-femme', 'Maternité', 'Médecin', 'Urgences'],
    defaultLabel: '',
    valuePlaceholder: 'Numéro de téléphone',
    valueKeyboardType: 'phone-pad',
  },
  address: {
    icon: 'location-outline',
    pickerLabel: 'Adresse',
    sectionTitle: 'Adresses',
    color: '#059669',
    tint: '#D1FAE5',
    needsLabel: true,
    labelPlaceholder: 'Quoi — ex. Maternité',
    labelSuggestions: ['Maternité', 'Cabinet médecin', 'Domicile'],
    defaultLabel: '',
    // Saisie en trois champs (rue, ville, code postal) dans
    // `InfoItemFormModal` — voir `formatAddress`.
    valuePlaceholder: '',
  },
  date: {
    icon: 'calendar-outline',
    pickerLabel: 'Date',
    sectionTitle: 'Dates importantes',
    color: '#7C3AED',
    tint: '#EDE9FE',
    needsLabel: true,
    labelPlaceholder: 'Quoi — ex. Terme',
    labelSuggestions: ['Terme', 'Début de grossesse'],
    // Une seule date de terme et de début par grossesse (demande explicite) :
    // si elle change, on modifie l'existante.
    uniqueLabels: ['Terme', 'Début de grossesse'],
    defaultLabel: '',
    valuePlaceholder: '',
    isDate: true,
  },
  social_security: {
    icon: 'card-outline',
    pickerLabel: 'N° sécurité sociale',
    sectionTitle: 'Sécurité sociale',
    color: '#4338CA',
    tint: '#E0E7FF',
    needsLabel: true,
    labelPlaceholder: 'Qui — ex. Maman',
    labelSuggestions: ['Maman', 'Partenaire'],
    defaultLabel: '',
    valuePlaceholder: 'Numéro à 15 chiffres',
    valueKeyboardType: 'number-pad',
  },
};

/** "1 99 08 75 123 456 78" — groupée pour rester lisible, jamais validée strictement. */
export function formatSocialSecurityNumber(digits: string): string {
  const clean = digits.replace(/\D/g, '').slice(0, 15);
  const groups = [1, 2, 2, 2, 3, 3, 2];
  let index = 0;
  const parts: string[] = [];
  for (const size of groups) {
    if (index >= clean.length) break;
    parts.push(clean.slice(index, index + size));
    index += size;
  }
  return parts.join(' ');
}

export function formatInfoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export type AddressParts = { street: string; postalCode: string; city: string };

/**
 * Adresse saisie en trois champs (rue, ville, code postal — demande
 * explicite) mais rangée dans l'unique colonne `value`, sur deux lignes :
 * « 12 rue des Lilas » puis « 75011 Paris ». Pas de migration, et une
 * adresse s'affiche telle quelle dans la liste.
 */
export function formatAddress({
  street,
  postalCode,
  city,
}: AddressParts): string {
  const locality = [postalCode.trim(), city.trim()].filter(Boolean).join(' ');
  return [street.trim(), locality].filter(Boolean).join('\n');
}

/**
 * Inverse de `formatAddress`, pour rouvrir une adresse en modification.
 * Une adresse saisie avant les trois champs (texte libre, sans retour à la
 * ligne) revient entière dans la rue, rien n'est perdu.
 */
export function parseAddress(value: string): AddressParts {
  const [first = '', ...rest] = value.split('\n');
  // Une seule ligne qui commence par un code postal : c'est une adresse
  // saisie sans rue (« 13001 Marseille »), pas une rue.
  const isLocalityOnly =
    rest.length === 0 && /^\d{4,5}(\s|$)/.test(first.trim());
  const street = isLocalityOnly ? '' : first;
  const locality = (isLocalityOnly ? first : rest.join(' ')).trim();
  const match = locality.match(/^(\d{4,5})\s*(.*)$/);
  return {
    street: street.trim(),
    postalCode: match ? match[1] : '',
    city: match ? match[2].trim() : locality,
  };
}

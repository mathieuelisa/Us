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
    defaultLabel: string;
    valuePlaceholder: string;
    valueKeyboardType?: 'default' | 'phone-pad' | 'number-pad';
    multilineValue?: boolean;
    isDate?: boolean;
    isChip?: boolean;
    /** Valeur choisie parmi une liste fermée plutôt que saisie libre. */
    valueOptions?: string[];
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
    labelSuggestions: ['Maman', 'Papa'],
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
    valuePlaceholder: 'Adresse complète',
    multilineValue: true,
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
    labelSuggestions: ['Maman', 'Papa'],
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

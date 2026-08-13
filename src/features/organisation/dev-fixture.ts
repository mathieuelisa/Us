import type { ChecklistItem } from '@/features/organisation/api';

/**
 * ⚠️ TEMPORAIRE — À SUPPRIMER, voir src/lib/atoms/dev-bypass.ts.
 *
 * Reproduit le catalogue de la migration `20260813120000_organisation_checklists.sql`
 * pour que l'écran Organisation & Préparation soit explorable sans session
 * ni foyer réel, même parti pris que `procedures/dev-fixture.ts`. Les
 * cases cochées restent locales en mode DEV, elles n'écrivent jamais dans
 * Supabase (cf. `organisation.tsx`).
 */
export const DEV_CHECKLIST_ITEMS_FIXTURE: ChecklistItem[] = [
  {
    id: 'dev-valise-1',
    checklistSlug: 'valise-maternite',
    label: 'Pyjamas et vêtements confortables',
    sortOrder: 1,
    checked: false,
  },
  {
    id: 'dev-valise-2',
    checklistSlug: 'valise-maternite',
    label: 'Sous-vêtements et culottes filet/jetables',
    sortOrder: 2,
    checked: false,
  },
  {
    id: 'dev-valise-3',
    checklistSlug: 'valise-maternite',
    label: 'Trousse de toilette',
    sortOrder: 3,
    checked: false,
  },
  {
    id: 'dev-valise-4',
    checklistSlug: 'valise-maternite',
    label: 'Soutiens-gorge d’allaitement',
    sortOrder: 4,
    checked: false,
  },
  {
    id: 'dev-valise-5',
    checklistSlug: 'valise-maternite',
    label: 'Coussinets d’allaitement',
    sortOrder: 5,
    checked: false,
  },
  {
    id: 'dev-valise-6',
    checklistSlug: 'valise-maternite',
    label: 'Chaussons ou chaussettes chaudes',
    sortOrder: 6,
    checked: false,
  },
  {
    id: 'dev-valise-7',
    checklistSlug: 'valise-maternite',
    label: 'Chargeur de téléphone',
    sortOrder: 7,
    checked: false,
  },
  {
    id: 'dev-valise-8',
    checklistSlug: 'valise-maternite',
    label: 'Carte d’identité et carte vitale',
    sortOrder: 8,
    checked: false,
  },
  {
    id: 'dev-valise-9',
    checklistSlug: 'valise-maternite',
    label: 'Dossier de maternité',
    sortOrder: 9,
    checked: false,
  },
  {
    id: 'dev-valise-10',
    checklistSlug: 'valise-maternite',
    label: 'Bodys et pyjamas pour bébé (plusieurs tailles)',
    sortOrder: 10,
    checked: false,
  },
  {
    id: 'dev-valise-11',
    checklistSlug: 'valise-maternite',
    label: 'Turbulette ou couverture',
    sortOrder: 11,
    checked: false,
  },
  {
    id: 'dev-valise-12',
    checklistSlug: 'valise-maternite',
    label: 'Bonnet et moufles pour bébé',
    sortOrder: 12,
    checked: false,
  },
  {
    id: 'dev-valise-13',
    checklistSlug: 'valise-maternite',
    label: 'Couches nouveau-né',
    sortOrder: 13,
    checked: false,
  },
  {
    id: 'dev-valise-14',
    checklistSlug: 'valise-maternite',
    label: 'Tenue de sortie pour bébé',
    sortOrder: 14,
    checked: false,
  },
  {
    id: 'dev-valise-15',
    checklistSlug: 'valise-maternite',
    label: 'Siège auto installé dans la voiture',
    sortOrder: 15,
    checked: false,
  },
  {
    id: 'dev-sac-1',
    checklistSlug: 'sac-naissance',
    label: 'Tenue confortable pour le travail',
    sortOrder: 1,
    checked: false,
  },
  {
    id: 'dev-sac-2',
    checklistSlug: 'sac-naissance',
    label: 'Chaussettes chaudes',
    sortOrder: 2,
    checked: false,
  },
  {
    id: 'dev-sac-3',
    checklistSlug: 'sac-naissance',
    label: 'Brumisateur ou huile de massage',
    sortOrder: 3,
    checked: false,
  },
  {
    id: 'dev-sac-4',
    checklistSlug: 'sac-naissance',
    label: 'Musique ou playlist de relaxation',
    sortOrder: 4,
    checked: false,
  },
  {
    id: 'dev-sac-5',
    checklistSlug: 'sac-naissance',
    label: 'Bouteille d’eau et en-cas',
    sortOrder: 5,
    checked: false,
  },
  {
    id: 'dev-sac-6',
    checklistSlug: 'sac-naissance',
    label: 'Coussin d’allaitement',
    sortOrder: 6,
    checked: false,
  },
  {
    id: 'dev-sac-7',
    checklistSlug: 'sac-naissance',
    label: 'Appareil photo ou téléphone chargé',
    sortOrder: 7,
    checked: false,
  },
  {
    id: 'dev-sac-8',
    checklistSlug: 'sac-naissance',
    label: 'Serviette de toilette',
    sortOrder: 8,
    checked: false,
  },
  {
    id: 'dev-sac-9',
    checklistSlug: 'sac-naissance',
    label: 'Body pour le peau à peau',
    sortOrder: 9,
    checked: false,
  },
  {
    id: 'dev-sac-10',
    checklistSlug: 'sac-naissance',
    label: 'Liste des personnes à prévenir',
    sortOrder: 10,
    checked: false,
  },
];

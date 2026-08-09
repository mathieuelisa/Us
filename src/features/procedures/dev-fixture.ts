import type { ProcedureWithStatus } from '@/features/procedures/api';

/**
 * ⚠️ TEMPORAIRE — À SUPPRIMER, voir src/lib/atoms/dev-bypass.ts.
 *
 * `useProcedures()` interroge Supabase, qui exige un foyer réel (RLS) : en
 * mode contournement DEV il n'y en a pas, la requête reste vide et l'écran
 * Démarches ne montre jamais rien. Ce fixture reproduit le référentiel des
 * 6 démarches (mêmes titres, documents, échéances, liens que la migration
 * réelle) pour que l'écran soit explorable sans session ni foyer.
 *
 * Les modifications de statut / rappel en mode DEV restent **locales** —
 * elles n'écrivent jamais dans Supabase, cf. `demarches.tsx`.
 *
 * Pour retirer : supprimer ce fichier et son usage dans
 * `src/app/(tabs)/demarches.tsx` (le compilateur le signalera).
 */
export const DEV_PROCEDURES_FIXTURE: ProcedureWithStatus[] = [
  {
    id: 'dev-declaration-naissance',
    householdProcedureId: 'dev-declaration-naissance',
    slug: 'declaration-naissance',
    title: 'Déclaration de naissance',
    description:
      'La déclaration de naissance se fait à la mairie du lieu de naissance de l’enfant. C’est cette démarche qui donne officiellement son état civil au bébé et permet ensuite toutes les autres inscriptions administratives. Elle doit être réalisée par l’un des parents, en présentant les documents ci-dessous.',
    deadline_days_after_birth: 5,
    documents: [
      'Carte d’identité (CNI)',
      'Livret de famille (si existant)',
      'Justificatif de domicile',
      'Certificat d’accouchement',
    ],
    official_link: 'https://www.service-public.fr/particuliers/vosdroits/F961',
    sort_order: 1,
    status: 'a_faire',
    reminderEnabled: false,
  },
  {
    id: 'dev-caf',
    householdProcedureId: 'dev-caf',
    slug: 'caf',
    title: 'CAF',
    description: 'Prime et allocations.',
    deadline_days_after_birth: null,
    documents: [],
    official_link:
      'https://www.caf.fr/allocataires/aides-et-demarches/ma-situation/vie-personnelle/j-attends-un-enfant',
    sort_order: 2,
    status: 'a_faire',
    reminderEnabled: false,
  },
  {
    id: 'dev-securite-sociale',
    householdProcedureId: 'dev-securite-sociale',
    slug: 'securite-sociale',
    title: 'Sécurité sociale',
    description: 'Rattachement du bébé.',
    deadline_days_after_birth: null,
    documents: [],
    official_link:
      'https://www.ameli.fr/assure/droits-demarches/famille/maternite-paternite-adoption/declaration-de-son-enfant',
    sort_order: 3,
    status: 'a_faire',
    reminderEnabled: false,
  },
  {
    id: 'dev-mutuelle',
    householdProcedureId: 'dev-mutuelle',
    slug: 'mutuelle',
    title: 'Mutuelle',
    description: 'Ajout de l’enfant.',
    deadline_days_after_birth: null,
    documents: [],
    official_link: null,
    sort_order: 4,
    status: 'a_faire',
    reminderEnabled: false,
  },
  {
    id: 'dev-conge-employeur',
    householdProcedureId: 'dev-conge-employeur',
    slug: 'conge-employeur',
    title: 'Congé employeur',
    description: 'À planifier avec l’employeur.',
    deadline_days_after_birth: null,
    documents: [],
    official_link:
      'https://www.demarches.interieur.gouv.fr/particuliers/conge-paternite-accueil-enfant-salarie-secteur-prive',
    sort_order: 5,
    status: 'a_faire',
    reminderEnabled: false,
  },
  {
    id: 'dev-mode-de-garde',
    householdProcedureId: 'dev-mode-de-garde',
    slug: 'mode-de-garde',
    title: 'Mode de garde',
    description: 'Anticipation du mode de garde.',
    deadline_days_after_birth: null,
    documents: [],
    official_link: 'https://monenfant.fr/',
    sort_order: 6,
    status: 'a_faire',
    reminderEnabled: false,
  },
];

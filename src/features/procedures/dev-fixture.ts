import type { ProcedureWithStatus } from '@/features/procedures/api';

/**
 * ⚠️ TEMPORAIRE — À SUPPRIMER, voir src/lib/atoms/dev-bypass.ts.
 *
 * `useProcedures()` interroge Supabase, qui exige un foyer réel (RLS) : en
 * mode contournement DEV il n'y en a pas, la requête reste vide et l'écran
 * Démarches ne montre jamais rien. Ce fixture reproduit le référentiel des
 * 8 démarches (mêmes titres, documents, échéances, liens que la migration
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
    description:
      'L’arrivée d’un nouvel enfant dans la famille vous ouvre de nouveaux droits ainsi que des aides. Afin d’en profiter, il faudra donc contacter l’organisme en charge des prestations sociales et familiales auquel vous êtes affilié : CAF ou MSA',
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
    description:
      'Après la naissance, les rendez-vous médicaux et achats de produits en pharmacie pour votre enfant vont se multiplier. Il est donc important d’être bien couvert en matière de protection santé. Il vous faudra donc indiquer le changement de situation à votre organisme',
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
    description:
      'En ce qui concerne la mutuelle pour les enfants, le fonctionnement est le même, avec une double affiliation possible. Avec l’arrivée d’un bébé, vos besoins en matière de santé évoluent cependant drastiquement. Un changement de contrat complémentaire santé pourrait alors se révéler opportun.',
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
    description:
      'Si vous êtes salarié, prévenez immédiatement votre employeur afin de bénéficier de votre congé paternité ou maternité. Vous devrez lui fournir une copie de l’acte de naissance afin d’être dans les règles administrativement. Rappel : il vous incombe d’informer votre employeur par lettre recommandée avec accusé de réception en amont de la naissance pour profiter de vos congés dans leur intégralité. Certaines entreprises prévoient des primes à la naissance ou des cadeaux !',
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
    description:
      'Si vous devez inscrire votre enfant à la crèche, prévenez-la rapidement. En particulier si la date de commission d’attribution est proche.',
    deadline_days_after_birth: null,
    documents: [],
    official_link: 'https://monenfant.fr/',
    sort_order: 6,
    status: 'a_faire',
    reminderEnabled: false,
  },
  {
    id: 'dev-assurance-habitation',
    householdProcedureId: 'dev-assurance-habitation',
    slug: 'assurance-habitation',
    title: 'Assurance habitation',
    description:
      'Voici un point que l’on a parfois tendance à oublier lors des démarches administratives naissance après l’accouchement. Il est pourtant très important de contacter votre assurance habitation afin de la notifier après la naissance. Ainsi, votre enfant pourra être intégré au contrat et bénéficier du statut d’ayant-droit. Au cas contraire, il ne sera pas couvert et cette omission pourrait avoir des conséquences sérieuses en cas de sinistre.',
    deadline_days_after_birth: null,
    documents: [],
    official_link: null,
    sort_order: 7,
    status: 'a_faire',
    reminderEnabled: false,
  },
  {
    id: 'dev-administration-fiscale',
    householdProcedureId: 'dev-administration-fiscale',
    slug: 'administration-fiscale',
    title: 'Administration fiscale',
    description:
      'Parmi les démarches administratives naissance, il est obligatoire de déclarer votre nouveau-né à l’administration fiscale. Selon votre choix, vous pouvez opter pour différentes formules : rattacher l’enfant à charge de l’un des parents seulement ou répartir la charge entre les deux parents.',
    deadline_days_after_birth: null,
    documents: [],
    official_link: null,
    sort_order: 8,
    status: 'a_faire',
    reminderEnabled: false,
  },
];

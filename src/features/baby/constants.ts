import type { ImageSourcePropType } from 'react-native';

/**
 * Les 4 suivis bébé accessibles depuis la grille bento de `/bebe`
 * (design US Hi-Fi, écran 8b « Votre bébé — écran principal ») et le
 * contenu de leur formulaire d'ajout (écrans 8d/8f/8g/8h).
 *
 * Un seul descripteur par module plutôt que 4 écrans et 4 modales
 * dupliqués : la structure est identique (segment de tête, date, heure,
 * champs chiffrés, commentaire), seuls le vocabulaire et les champs
 * changent. Même raisonnement que `LEGAL_DOCS` dans `(tabs)/legal.tsx`.
 *
 * ⚠️ Ces écrans sont derrière le paywall (module premium — voir
 * DOCS/versions/MVP.md) : y arriver suppose l'accès débloqué, donc les
 * formulaires sont pleinement actifs. Les entrées sont enregistrées dans
 * `baby_entries` (Supabase) — voir `features/baby/api.ts`.
 */
export type BabyModuleSlug = 'croissance' | 'biberon' | 'allaitement' | 'bain';

/**
 * Champ chiffré du formulaire — `unit` sert au libellé et au résumé.
 *
 * `kind: 'timer'` remplace la saisie par un chronomètre (écran 8g) : la
 * valeur stockée est alors un nombre de **secondes**, pas l'unité
 * affichée. `unit` reste utile au libellé du champ.
 */
export type BabyNumberField = {
  key: string;
  label: string;
  unit: string;
  kind: 'number' | 'timer';
  /**
   * Saisie à la molette plutôt qu'au clavier (demande explicite sur le
   * poids et la taille) : une colonne pour la partie entière, une pour la
   * partie décimale. Absent : champ texte classique.
   */
  wheel?: BabyMeasureWheel;
};

/**
 * Bornes d'une molette de mesure. `fractionDigits` fixe l'affichage de la
 * partie décimale (« 690 » pour des grammes), `fractionStep` le pas de sa
 * colonne, exprimé dans cette même unité (10 → 000, 010, … 990).
 * `defaultValue` est la position de départ quand aucune mesure n'existe.
 * `fractionDigits: 0` : pas de colonne décimale (quantité en ml).
 */
export type BabyMeasureWheel = {
  min: number;
  max: number;
  /** Pas de la colonne entière (5 → 5, 10, 15 ml…) ; 1 par défaut. */
  integerStep?: number;
  fractionDigits: number;
  fractionStep: number;
  defaultValue: number;
};

/** Choix exclusif en tête de formulaire (segments des écrans 8g/8h). */
export type BabySegmentGroup = {
  label: string;
  options: string[];
};

export type BabyModule = {
  /** Segment de route sous `(tabs)` : `bebe-<slug>`. */
  slug: BabyModuleSlug;
  emoji: string;
  /**
   * Icône 3D du module (fournie par l'utilisateur), sur sa propre tuile :
   * grille de `/bebe`, en-tête et historique du suivi, modale d'ajout,
   * pop-up de suppression (demande explicite). `emoji` reste le texte de
   * repli (libellés d'accessibilité, contextes sans image).
   */
  image: ImageSourcePropType;
  title: string;
  /** Rappel de ce que couvre le module — repris de la carte de `/bebe`. */
  subtitle: string;
  /** Titre de la section centrale (historique / courbe). */
  sectionTitle: string;
  /** État vide de cette section. */
  emptyState: string;
  /** Libellé du bouton d'ajout et titre de la modale (écrans 8d/8f/8g/8h). */
  actionLabel: string;
  /** Titre de la même modale rouverte sur une entrée existante. */
  editLabel: string;
  /** Sous-titre de la modale d'ajout, sous `actionLabel`. */
  formSubtitle: string;
  segments: BabySegmentGroup | null;
  /**
   * Le formulaire demande-t-il une heure ? Oui pour les gestes ponctuels
   * (biberon, tétée, bain), non pour une mesure — le design 8d ne montre
   * qu'une date.
   */
  hasTime: boolean;
  /**
   * Le formulaire propose-t-il un commentaire libre ? Retiré de
   * l'allaitement (demande explicite) : le geste se résume au sein, à
   * l'heure et à la durée, rien à commenter.
   */
  hasComment: boolean;
  fields: BabyNumberField[];
  /**
   * Nombre minimum de champs chiffrés à remplir pour pouvoir enregistrer.
   * `1` sur la croissance : les 3 mesures sont indépendantes, on n'en pèse
   * pas forcément trois d'un coup.
   */
  requiredFieldCount: number;
};

export const BABY_MODULES: Record<BabyModuleSlug, BabyModule> = {
  croissance: {
    slug: 'croissance',
    emoji: '📏',
    image: require('@/assets/images/Icon_croissance.png'),
    title: 'Croissance',
    subtitle: 'Poids, taille, périmètre crânien',
    // La courbe a sa propre carte au-dessus (GrowthChart) : cette section
    // n'est plus que l'historique.
    sectionTitle: 'Historique des mesures',
    emptyState: 'Aucune mesure enregistrée pour l’instant.',
    actionLabel: 'Ajouter une mesure',
    editLabel: 'Modifier la mesure',
    formSubtitle: 'Notez les mesures de votre bébé.',
    segments: null,
    hasTime: false,
    hasComment: true,
    fields: [
      // Plages couvrant un grand prématuré comme un enfant de 2 ans.
      {
        key: 'height',
        label: 'Taille',
        unit: 'cm',
        kind: 'number',
        wheel: {
          min: 20,
          max: 110,
          fractionDigits: 1,
          fractionStep: 1,
          defaultValue: 50,
        },
      },
      {
        key: 'weight',
        label: 'Poids',
        unit: 'kg',
        kind: 'number',
        // Au gramme près sur l'affichage (« 5,690 kg », demande explicite),
        // par pas de 10 g : une colonne de 1 000 lignes serait interminable
        // à faire défiler, et un pèse-bébé n'est pas plus précis.
        wheel: {
          min: 0,
          max: 20,
          fractionDigits: 3,
          fractionStep: 10,
          defaultValue: 3.5,
        },
      },
      {
        key: 'headCircumference',
        label: 'Périmètre crânien',
        unit: 'cm',
        kind: 'number',
      },
    ],
    requiredFieldCount: 1,
  },
  biberon: {
    slug: 'biberon',
    emoji: '🍼',
    image: require('@/assets/images/Icon_biberon.png'),
    title: 'Biberon',
    subtitle: 'Quantité, horaire, type de lait',
    sectionTitle: 'Derniers biberons',
    emptyState: 'Aucun biberon enregistré pour le moment.',
    actionLabel: 'Ajouter un biberon',
    editLabel: 'Modifier le biberon',
    formSubtitle: 'Renseignez les informations de votre biberon.',
    segments: {
      label: 'Type de lait',
      options: ['Lait maternel', 'Lait infantile'],
    },
    hasTime: true,
    hasComment: true,
    fields: [
      {
        key: 'quantity',
        label: 'Quantité',
        unit: 'ml',
        kind: 'number',
        // Molette par pas de 5 ml (demande explicite) : les graduations
        // d'un biberon ne sont pas plus fines.
        wheel: {
          min: 5,
          max: 360,
          integerStep: 5,
          fractionDigits: 0,
          fractionStep: 1,
          defaultValue: 90,
        },
      },
    ],
    requiredFieldCount: 1,
  },
  allaitement: {
    slug: 'allaitement',
    emoji: '🤱',
    image: require('@/assets/images/Icon_allaitement.png'),
    title: 'Allaitement',
    subtitle: 'Durée, sein, horaire',
    sectionTitle: 'Dernières tétées',
    emptyState: 'Aucune tétée enregistrée pour le moment.',
    actionLabel: 'Ajouter un allaitement',
    editLabel: 'Modifier l’allaitement',
    formSubtitle: 'Lancez le chronomètre pendant la tétée.',
    // Le design 8g proposait aussi « Les deux » ; retiré sur demande
    // explicite — une tétée se note sein par sein.
    segments: { label: 'Sein', options: ['Sein gauche', 'Sein droit'] },
    hasTime: true,
    hasComment: false,
    fields: [{ key: 'duration', label: 'Durée', unit: 'min', kind: 'timer' }],
    requiredFieldCount: 1,
  },
  bain: {
    slug: 'bain',
    emoji: '🛁',
    image: require('@/assets/images/Icon_bain.png'),
    title: 'Bain & Soins',
    subtitle: 'Rituel du soir, température, produits',
    sectionTitle: 'Derniers soins',
    emptyState: 'Aucun bain ni soin enregistré pour le moment.',
    actionLabel: 'Ajouter un bain',
    editLabel: 'Modifier le bain',
    formSubtitle: 'Notez le bain ou les soins du jour.',
    segments: { label: 'Type', options: ['Bain', 'Soins'] },
    hasTime: true,
    hasComment: true,
    // Le design 8f ne demande qu'une date et un commentaire : rien à
    // chiffrer, la température évoquée sur la carte reste du commentaire
    // libre tant que le modèle de données n'est pas tranché.
    fields: [],
    requiredFieldCount: 0,
  },
};

/** Une entrée saisie dans un suivi. Valeurs chiffrées indexées par `key`. */
export type BabyEntry = {
  id: string;
  date: string;
  /** `HH:MM`, ou `null` sur les modules sans heure (croissance). */
  time: string | null;
  /** Option retenue dans `segments`, ou `null` si le module n'en a pas. */
  segment: string | null;
  values: Record<string, string>;
  comment: string | null;
};

/**
 * Durée d'un chronomètre, stockée en secondes : « 12 min 45 s », ou
 * « 1 h 02 min » au-delà de l'heure — on ne compte plus les secondes à
 * cette échelle.
 */
export function formatDurationSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, '0')} min`;
  if (minutes > 0)
    return `${minutes} min ${String(seconds).padStart(2, '0')} s`;
  return `${seconds} s`;
}

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** « mercredi 26 août », comme sous la molette de `WheelDatePicker`. */
export function formatBabyEntryDate(entry: BabyEntry): string {
  const [year, month, day] = entry.date.split('-').map(Number);
  const label = DATE_FORMATTER.format(new Date(year, month - 1, day));
  return entry.time ? `${label} · ${entry.time.replace(':', 'h')}` : label;
}

/**
 * Résumé d'une ligne d'historique : le segment retenu puis les valeurs
 * chiffrées avec leur unité, dans l'ordre déclaré par le module.
 *
 * Le libellé du champ n'est repris que sur les modules à plusieurs
 * mesures : sur la croissance, « 51 cm · 35 cm » ne dirait pas laquelle
 * est la taille et laquelle le périmètre crânien. Un module à champ
 * unique (biberon, allaitement) n'a pas cette ambiguïté, l'unité suffit.
 */
export function formatBabyEntrySummary(
  module: BabyModule,
  entry: BabyEntry,
): string {
  const withLabels = module.fields.length > 1;

  const parts = module.fields
    .filter((field) => entry.values[field.key])
    .map((field) => {
      if (field.kind === 'timer') {
        const measure = formatDurationSeconds(Number(entry.values[field.key]));
        return withLabels ? `${field.label} ${measure}` : measure;
      }
      // Saisie normalisée avec un point ; réaffichée à la française.
      const value = entry.values[field.key].replace('.', ',');
      const measure = `${value} ${field.unit}`;
      return withLabels ? `${field.label} ${measure}` : measure;
    });

  if (entry.segment) parts.unshift(entry.segment);
  return parts.join(' · ');
}

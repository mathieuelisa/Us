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
 * formulaires sont pleinement actifs. En revanche la **persistance**
 * n'existe pas encore — pas de table Supabase ni de policy RLS pour ces
 * suivis. Les entrées saisies vivent dans l'état de l'écran et sont
 * perdues à la fermeture ; le branchement serveur reste à faire.
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
  title: string;
  /** Rappel de ce que couvre le module — repris de la carte de `/bebe`. */
  subtitle: string;
  /** Titre de la section centrale (historique / courbe). */
  sectionTitle: string;
  /** État vide de cette section. */
  emptyState: string;
  /** Libellé du bouton d'ajout et titre de la modale (écrans 8d/8f/8g/8h). */
  actionLabel: string;
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
    title: 'Croissance',
    subtitle: 'Poids, taille, périmètre crânien',
    sectionTitle: 'Courbe de croissance',
    emptyState:
      'Aucune mesure enregistrée. La courbe se dessinera dès la première.',
    actionLabel: 'Ajouter une mesure',
    segments: null,
    hasTime: false,
    hasComment: true,
    fields: [
      { key: 'height', label: 'Taille', unit: 'cm', kind: 'number' },
      { key: 'weight', label: 'Poids', unit: 'kg', kind: 'number' },
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
    title: 'Biberon',
    subtitle: 'Quantité, horaire, type de lait',
    sectionTitle: 'Derniers biberons',
    emptyState: 'Aucun biberon enregistré pour le moment.',
    actionLabel: 'Ajouter un biberon',
    segments: {
      label: 'Type de lait',
      options: ['Lait maternel', 'Lait infantile'],
    },
    hasTime: true,
    hasComment: true,
    fields: [
      { key: 'quantity', label: 'Quantité', unit: 'ml', kind: 'number' },
    ],
    requiredFieldCount: 1,
  },
  allaitement: {
    slug: 'allaitement',
    emoji: '🤱',
    title: 'Allaitement',
    subtitle: 'Durée, sein, horaire',
    sectionTitle: 'Dernières tétées',
    emptyState: 'Aucune tétée enregistrée pour le moment.',
    actionLabel: 'Ajouter un allaitement',
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
    title: 'Bain & Soins',
    subtitle: 'Rituel du soir, température, produits',
    sectionTitle: 'Derniers soins',
    emptyState: 'Aucun bain ni soin enregistré pour le moment.',
    actionLabel: 'Ajouter un bain',
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

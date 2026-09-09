/**
 * Catalogue des exercices proposés dans l'onglet Exercices (écran 4f).
 *
 * ⚠️ Contenu **en dur côté client**, pas en base, contrairement à ce que
 * prévoit la table `exercises` (demande explicite : « ajoute quelques cards
 * en brut »). Deux raisons de fond :
 * - la table ne contient que 4 lignes squelettiques (titre + durée), sans
 *   description, sans étapes, sans visuel — de quoi remplir une ligne de
 *   liste, pas une page ;
 * - aucune lecture Supabase n'aboutit aujourd'hui (cf. point ouvert n°5),
 *   donc l'onglet affichait « Aucun exercice proposé » dans les trois
 *   trimestres.
 *
 * Même statut que `SYMPTOM_OPTIONS` et les astuces de « Mon partenaire » :
 * à basculer en base le jour où ce contenu devient éditorial (voir points
 * ouverts 28 et 29). `fetchExercises()` reste en place pour ce jour-là.
 *
 * ⚠️ Ces contenus touchent à la santé de la personne enceinte. Ils sont
 * volontairement **généraux et non prescriptifs** — aucune contre-indication
 * n'est évaluée par l'app, qui ne connaît ni le dossier médical ni le
 * déroulé de la grossesse. `EXERCISE_DISCLAIMER` est affiché sur chaque
 * page de détail et ne doit pas en être retiré.
 */

export type ExerciseTrimester = 1 | 2 | 3;

export type CatalogExercise = {
  /** Identifiant stable, passé en paramètre de route. */
  slug: string;
  trimester: ExerciseTrimester;
  title: string;
  /** « 5 min · assise » — durée et posture, comme le référentiel en base. */
  durationLabel: string;
  /** Zone travaillée, affichée en pastille. */
  focus: string;
  /** Une ligne sur la carte de la grille. */
  summary: string;
  description: string;
  steps: string[];
  emoji: string;
  /** Fond pastel de la carte et du bandeau, et encre assortie. */
  tint: { bg: string; ink: string };
};

export const EXERCISE_DISCLAIMER =
  'Ces exercices sont des repères généraux. Demandez l’avis de votre sage-femme ou de votre médecin avant de les pratiquer, et arrêtez-vous à la moindre douleur, contraction ou sensation de vertige.';

const TINT = {
  souffle: { bg: '#DCEAFB', ink: '#4E7FC4' },
  dos: { bg: '#DEF3E6', ink: '#3FA66E' },
  endurance: { bg: '#FCF0C9', ink: '#C99A2E' },
  bassin: { bg: '#FBE1E8', ink: '#D9647F' },
  mobilite: { bg: '#EAE1F8', ink: '#8A63C9' },
  hanches: { bg: '#FBE4D8', ink: '#DD8355' },
  eau: { bg: '#D9F2EE', ink: '#2E9C93' },
} as const;

export const EXERCISE_CATALOG: CatalogExercise[] = [
  // ------------------------------------------------------ 1er trimestre
  {
    slug: 'respiration-prenatale',
    trimester: 1,
    title: 'Respiration prénatale',
    durationLabel: '3 min · allongée',
    focus: 'Souffle',
    summary: 'Ralentir le souffle et relâcher les tensions.',
    description:
      'Un temps de respiration lente, à faire au réveil ou au coucher. L’idée n’est pas de respirer « mieux » mais plus lentement : allonger l’expiration suffit à faire redescendre la tension d’une journée. C’est aussi le geste de base sur lequel s’appuient les respirations du jour J.',
    steps: [
      'Allongez-vous sur le côté gauche, un coussin entre les genoux.',
      'Posez une main sur le ventre, l’autre sur la poitrine.',
      'Inspirez par le nez en comptant jusqu’à quatre : c’est la main du ventre qui se soulève.',
      'Expirez par la bouche en comptant jusqu’à six, sans forcer.',
      'Répétez une dizaine de fois, puis restez immobile un instant.',
    ],
    emoji: '🫁',
    tint: TINT.souffle,
  },
  {
    slug: 'etirement-du-dos',
    trimester: 1,
    title: 'Étirement du dos',
    durationLabel: '5 min · assise',
    focus: 'Dos & nuque',
    summary: 'Dénouer le haut du dos après une journée assise.',
    description:
      'Quelques étirements courts, faisables sur une chaise, sans matériel. Ils visent le haut du dos et la nuque, là où la fatigue du premier trimestre se loge le plus souvent. Rien ne doit tirer : on cherche l’étirement, jamais la limite.',
    steps: [
      'Asseyez-vous au bord de la chaise, les deux pieds à plat.',
      'Laissez la tête pencher doucement vers l’épaule droite, dix respirations.',
      'Refaites de l’autre côté.',
      'Croisez les doigts devant vous, poussez les paumes loin en arrondissant le haut du dos.',
      'Terminez en roulant lentement les épaules vers l’arrière.',
    ],
    emoji: '🧘‍♀️',
    tint: TINT.dos,
  },
  {
    slug: 'marche-douce',
    trimester: 1,
    title: 'Marche douce',
    durationLabel: '20 min · extérieur',
    focus: 'Endurance',
    summary: 'L’activité la plus simple, et l’une des plus utiles.',
    description:
      'La marche reste l’activité la mieux tolérée pendant toute la grossesse : elle entretient le souffle et la circulation sans jamais mettre le corps en tension. Le bon rythme est celui qui laisse encore parler.',
    steps: [
      'Choisissez un terrain plat et des chaussures qui tiennent le pied.',
      'Partez lentement pendant les cinq premières minutes.',
      'Gardez une allure où vous pouvez tenir une conversation.',
      'Buvez avant, pendant et après, même par temps frais.',
      'Ralentissez progressivement plutôt que de vous arrêter net.',
    ],
    emoji: '🚶‍♀️',
    tint: TINT.endurance,
  },
  {
    slug: 'bascule-du-bassin',
    trimester: 1,
    title: 'Bascule du bassin',
    durationLabel: '5 min · à quatre pattes',
    focus: 'Bassin',
    summary: 'Assouplir le bas du dos, mouvement après mouvement.',
    description:
      'Le fameux « dos rond, dos creux ». Un mouvement lent qui mobilise le bassin et le bas du dos, à reprendre tout au long de la grossesse — il soulage souvent les tensions lombaires et se pratique aussi pendant le travail.',
    steps: [
      'À quatre pattes, mains sous les épaules et genoux sous les hanches.',
      'À l’expiration, arrondissez le dos en rentrant le menton.',
      'À l’inspiration, revenez au dos plat — sans creuser les reins.',
      'Enchaînez au rythme du souffle, une dizaine de fois.',
      'Finissez en position de repos, front posé sur les mains.',
    ],
    emoji: '🐈',
    tint: TINT.bassin,
  },

  // ------------------------------------------------------- 2e trimestre
  {
    slug: 'yoga-prenatal',
    trimester: 2,
    title: 'Yoga prénatal doux',
    durationLabel: '10 min · tapis',
    focus: 'Mobilité',
    summary: 'Un enchaînement court, calé sur la respiration.',
    description:
      'Une courte séquence de postures debout et au sol, tenues quelques respirations chacune. Le deuxième trimestre est souvent le plus confortable pour s’y mettre. On évite les torsions marquées et tout ce qui comprime le ventre.',
    steps: [
      'Commencez debout, pieds écartés de la largeur du bassin.',
      'Levez les bras à l’inspiration, redescendez-les à l’expiration — cinq fois.',
      'Passez en fente basse, genou arrière au sol, cinq respirations de chaque côté.',
      'Asseyez-vous en tailleur et étirez un bras au-dessus de la tête, puis l’autre.',
      'Terminez allongée sur le côté gauche, quelques minutes.',
    ],
    emoji: '🧘',
    tint: TINT.mobilite,
  },
  {
    slug: 'ouverture-des-hanches',
    trimester: 2,
    title: 'Ouverture des hanches',
    durationLabel: '6 min · assise',
    focus: 'Hanches',
    summary: 'Gagner en aisance dans le bassin.',
    description:
      'La posture du papillon et ses variantes, tenues longtemps et sans à-coups. Elles entretiennent la souplesse du bassin, mise à l’épreuve par le poids qui augmente. Un coussin sous chaque genou change tout si l’ouverture tire.',
    steps: [
      'Assise, plantes de pieds l’une contre l’autre, talons à distance confortable.',
      'Posez un coussin sous chaque genou si nécessaire.',
      'Grandissez le dos plutôt que de pousser sur les genoux.',
      'Restez une minute, en respirant lentement.',
      'Refermez les jambes doucement, une à la fois.',
    ],
    emoji: '🦋',
    tint: TINT.hanches,
  },
  {
    slug: 'natation',
    trimester: 2,
    title: 'Natation & aquagym',
    durationLabel: '30 min · piscine',
    focus: 'Corps entier',
    summary: 'Le corps entier sollicité, sans le poids.',
    description:
      'Dans l’eau, le poids du ventre ne pèse plus sur le dos ni sur les articulations : c’est ce qui rend la natation si confortable en cours de grossesse. Le dos crawlé et la brasse sur le dos sont les nages les plus reposantes pour les lombaires.',
    steps: [
      'Entrez progressivement dans l’eau, sans plongeon.',
      'Nagez cinq minutes tranquillement pour vous échauffer.',
      'Alternez longueurs et récupération sur le bord.',
      'Privilégiez le dos ; évitez la brasse classique si les lombaires tirent.',
      'Sortez lentement, en vous tenant à l’échelle.',
    ],
    emoji: '🏊‍♀️',
    tint: TINT.eau,
  },
  {
    slug: 'renfort-des-jambes',
    trimester: 2,
    title: 'Renfort des jambes',
    durationLabel: '8 min · dos au mur',
    focus: 'Jambes',
    summary: 'Des appuis solides pour porter le ventre qui vient.',
    description:
      'La « chaise au mur », en version courte et sans charge. Des jambes toniques soulagent le bas du dos quand le ventre s’alourdit, et facilitent les positions accroupies souvent utilisées le jour de l’accouchement.',
    steps: [
      'Adossez-vous à un mur, pieds avancés de deux pas.',
      'Glissez le dos vers le bas jusqu’à ce que les genoux forment un angle ouvert.',
      'Tenez dix à quinze secondes, pas plus au début.',
      'Remontez en poussant dans les talons.',
      'Répétez cinq fois, en récupérant entre chaque.',
    ],
    emoji: '🦵',
    tint: TINT.dos,
  },

  // ------------------------------------------------------- 3e trimestre
  {
    slug: 'ballon-de-grossesse',
    trimester: 3,
    title: 'Ballon de grossesse',
    durationLabel: '10 min · assise',
    focus: 'Bassin & dos',
    summary: 'Bouger le bassin en restant portée.',
    description:
      'Assise sur un ballon, le bassin bouge librement et le bas du dos se relâche. C’est l’un des rares appuis qui reste confortable en fin de grossesse, et il se retrouve dans beaucoup de salles de naissance.',
    steps: [
      'Choisissez un ballon assez gonflé pour que les hanches soient plus hautes que les genoux.',
      'Asseyez-vous, pieds bien à plat et écartés.',
      'Dessinez des cercles lents avec le bassin, dans un sens puis dans l’autre.',
      'Enchaînez avec des balancements avant-arrière.',
      'Gardez un appui à portée de main pour les premières séances.',
    ],
    emoji: '🏐',
    tint: TINT.endurance,
  },
  {
    slug: 'perinee-prise-de-conscience',
    trimester: 3,
    title: 'Périnée : prise de conscience',
    durationLabel: '5 min · allongée',
    focus: 'Périnée',
    summary: 'Sentir, puis relâcher — avant de renforcer.',
    description:
      'Avant tout travail de renforcement, il s’agit de localiser le périnée et surtout d’apprendre à le relâcher : c’est ce relâchement qui sert le jour de l’accouchement. La rééducation, elle, se fait après la naissance et avec un professionnel.',
    steps: [
      'Allongez-vous, genoux pliés, pieds à plat.',
      'À l’expiration, resserrez très légèrement, comme pour retenir un gaz.',
      'Tenez deux à trois secondes, sans bloquer la respiration ni serrer les fesses.',
      'Relâchez complètement, et prenez le temps de sentir ce relâchement.',
      'Cinq répétitions suffisent — le relâchement compte plus que la contraction.',
    ],
    emoji: '🌸',
    tint: TINT.bassin,
  },
  {
    slug: 'respiration-pour-le-jour-j',
    trimester: 3,
    title: 'Respiration pour le jour J',
    durationLabel: '8 min · assise',
    focus: 'Souffle',
    summary: 'Répéter le souffle qui servira pendant le travail.',
    description:
      'Une respiration qu’on installe maintenant pour qu’elle vienne toute seule le moment venu : souffle long, mâchoire desserrée, épaules basses. La répéter au calme est ce qui la rend disponible sous tension.',
    steps: [
      'Asseyez-vous confortablement, dos soutenu.',
      'Inspirez par le nez, tranquillement.',
      'Expirez longuement par la bouche entrouverte, mâchoire relâchée.',
      'Imaginez une contraction d’une minute et tenez le souffle long sur toute sa durée.',
      'Récupérez une minute, puis recommencez trois ou quatre fois.',
    ],
    emoji: '🕯️',
    tint: TINT.mobilite,
  },
  {
    slug: 'jambes-legeres',
    trimester: 3,
    title: 'Jambes légères',
    durationLabel: '6 min · allongée',
    focus: 'Circulation',
    summary: 'Soulager les jambes lourdes de fin de journée.',
    description:
      'Quelques mouvements de chevilles et un temps jambes surélevées, à faire le soir. C’est le geste le plus simple contre la sensation de jambes lourdes qui s’installe souvent au troisième trimestre.',
    steps: [
      'Allongez-vous sur le côté gauche, ou sur le dos si c’est encore confortable.',
      'Posez les mollets sur un coussin ou contre un mur.',
      'Dessinez des cercles avec les chevilles, vingt fois dans chaque sens.',
      'Pointez puis fléchissez les pieds, lentement.',
      'Restez ainsi cinq minutes avant de vous relever doucement.',
    ],
    emoji: '💧',
    tint: TINT.eau,
  },
];

export function getExercisesForTrimester(
  trimester: ExerciseTrimester,
): CatalogExercise[] {
  return EXERCISE_CATALOG.filter(
    (exercise) => exercise.trimester === trimester,
  );
}

export function getExerciseBySlug(
  slug: string | undefined,
): CatalogExercise | null {
  if (!slug) return null;
  return EXERCISE_CATALOG.find((exercise) => exercise.slug === slug) ?? null;
}

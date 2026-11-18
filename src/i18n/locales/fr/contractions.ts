/** Assistant contractions et départ maternité (premium). Les signes d’urgence (`UrgentSignsCard`) restent en français : contenu à valider par une sage-femme. */
export const contractions = {
  description:
    'Chronométrez vos contractions à deux, suivez leur rythme et sachez quand prendre la route de la maternité.',
  descriptionSolo:
    'Chronométrez vos contractions, suivez leur rythme et sachez quand prendre la route de la maternité.',
  lockedTitle: 'Assistant contractions',
  unlock: 'Débloquez l’assistant contractions',
  title: 'Contractions & départ',
  errors: {
    end: 'La fin de la contraction n’a pas été enregistrée.',
    start: 'La contraction n’a pas été enregistrée.',
    finish: 'Le suivi n’a pas pu être terminé.',
    delete: 'La contraction n’a pas pu être supprimée.',
  },
  loading: 'Chargement…',
  hint: {
    stop: 'Touchez de nouveau quand la contraction s’arrête.',
    next: 'Touchez dès que la prochaine contraction commence.',
    first:
      'Touchez dès qu’une contraction commence :{{br}}le suivi démarre avec elle.',
  },
  stats: {
    count: 'Contractions',
    avgDuration: 'Durée moy.',
    avgInterval: 'Écart moyen',
  },
  session: {
    ongoing: 'SUIVI EN COURS',
    last: 'DERNIER SUIVI',
    none: 'AUCUN SUIVI EN COURS',
    summary_one: '{{duration}} · {{count}} contraction',
    summary_other: '{{duration}} · {{count}} contractions',
    startsWithFirst: 'Il démarre à la première contraction',
    finishA11y: 'Terminer le suivi des contractions',
    finish: 'Terminer',
  },
  button: {
    endA11y: 'Fin de la contraction, en cours depuis {{duration}}',
    startA11y: 'Début de contraction',
    end: 'Fin',
    start: 'Début de{{br}}contraction',
    endCaps: 'CONTRACTION',
  },
  rule: {
    text: 'Contractions toutes les {{interval}} ou moins depuis {{window}}{{who}}.',
    firstChild: ' (premier bébé)',
    nextChild: ' (bébés suivants)',
    title: 'Quand partir à la maternité ?',
    timeToGo: 'C’est le moment de partir.',
    regularFor: 'Régulières depuis {{duration}}',
    notRegular: 'Pas encore de rythme régulier',
    see: 'Voir',
  },
  history: {
    ongoing: 'En cours',
    first: 'Première contraction',
    after: '{{duration}} après la précédente',
    delete: 'Supprimer la contraction {{number}}',
    title: 'HISTORIQUE',
  },
  departure: {
    title: 'Il est temps de partir{{br}}à la maternité',
    every: 'Vos contractions reviennent toutes les {{duration}} environ',
    regular: 'Vos contractions sont régulières',
    since: 'depuis {{duration}}',
    lasting: 'et durent {{duration}} en moyenne.',
    advice:
      'Prenez la route calmement et prévenez la maternité si on vous l’a demandé.',
    bagA11y: 'Valise de maternité, {{checked}} sur {{total}} prêts',
    bag: 'Valise de maternité',
    checkBag: 'Vérifiez que rien ne manque',
    bagProgress: '{{checked}} sur {{total}} prêts',
    understood: 'J’ai compris',
    disclaimer:
      'Repère indicatif : il ne remplace pas l’avis de votre sage-femme ou de la maternité.',
  },
};

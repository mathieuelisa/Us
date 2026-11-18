/** Accueil (hub), navigation, visite guidée et invitation du partenaire. */
export const hub = {
  tabs: {
    home: 'Accueil',
    profile: 'Profil',
    info: 'Infos',
    settings: 'Réglage',
    premium: 'Premium',
  },
  loading: {
    a11y: 'Chargement en cours',
    title: 'Chargement…',
    subtitle: 'Veuillez patienter quelques instants',
  },
  greeting: 'Bonjour',
  greetingName: 'Bonjour {{name}}',
  gaveBirth: 'J’ai accouché',
  state: {
    proceduresUpToDate: 'Tout est à jour',
    proceduresPending: '{{count}} en attente',
    proceduresIdle: 'Vos démarches administratives',
    moodShared: 'Humeur partagée aujourd’hui',
    checkIn: 'Check-in du jour',
    nextAppointment: 'Prochain rendez-vous le {{date}}',
    journal: 'Journal du jour',
    listsIdle: 'Vos listes avant le grand jour',
    allReady: 'Tout est prêt',
    listsProgress: '{{checked}} sur {{total}} complétés',
    organisationIdle: 'Valises de naissance et jeux des prénoms',
  },
  partnerSection: 'MON PARTENAIRE',
  thisWeekSection: 'CETTE SEMAINE',
  thisWeek: 'Cette semaine',
  withPartnerName: 'Avec {{name}}',
  withYourPartner: 'Avec votre partenaire',
  babySizeAndTips: 'Taille du bébé et astuces du jour',
  yourPartner: 'Votre partenaire',
  yourPartnerLower: 'votre partenaire',
  partnerMood: {
    great: '{{name}} est en pleine forme',
    good: '{{name}} va bien',
    neutral: '{{name}} va à peu près',
    bad: '{{name}} a besoin d’un peu de douceur',
    terrible: '{{name}} a besoin de vous aujourd’hui',
  },
  partnerNoNews: '{{name}} n’a pas encore donné de nouvelles aujourd’hui',
  helpToday: 'POUR L’AIDER AUJOURD’HUI',
  sectionsTitle: 'VOS SECTIONS',
  pillars: {
    procedures: 'Démarches',
    together: 'Ensemble',
    health: 'Suivi santé',
    organisation: 'Organisation & Préparation',
    organisationShort: 'Organisation',
  },
  baby: {
    title: 'Votre bébé',
    subtitle: 'Courbe de croissance',
  },
  appointments: {
    mine: 'VOS PROCHAINS RENDEZ-VOUS',
    ours: 'NOS PROCHAINS RENDEZ-VOUS',
    none: 'Aucun rendez-vous à venir.',
    view: 'Voir le rendez-vous {{title}}',
    private: 'Non partagé · visible par vous seul·e',
  },
  tour: {
    mood: {
      title: 'Votre humeur du jour',
      changeSolo: 'Touchez votre ourson pour changer votre humeur du jour.',
      change:
        'Touchez votre ourson pour partager ou changer votre humeur du jour avec {{name}}.',
      noteSolo:
        'Touchez le cœur pour noter comment vous vous sentez aujourd’hui.',
      note: 'Touchez le cœur pour partager votre humeur du jour avec {{name}}.',
    },
    partner: {
      title: 'Mon partenaire',
      joined:
        'Voyez comment {{name}} se sent aujourd’hui et au fil de la semaine, et ce qui pourrait l’aider.',
      notJoined:
        'Taille de bébé et astuces du jour — puis, dès que votre partenaire vous aura rejoint, son humeur de la journée et de la semaine.',
    },
    sections: {
      title: 'Vos sections',
      body: 'L’essentiel de la grossesse, rangé en quatre espaces.',
      procedures: 'toutes vos démarches, mois par mois de grossesse',
      togetherSolo: 'votre humeur du jour et votre semaine',
      together: 'votre humeur du jour et la semaine de chacun',
      health: 'rendez-vous, numéros utiles et exercices',
      organisation: 'valises, assistant contractions et match des prénoms',
    },
    baby: {
      body: 'Biberons, allaitement, sommeil, croissance, vaccins… toutes les données de bébé au même endroit, pour vous simplifier le quotidien.',
    },
    appointments: {
      title: 'Vos prochains rendez-vous',
      body: 'Ils s’affichent ici. Touchez-en un pour voir le détail ; un rappel vous prévient la veille.',
    },
    info: {
      body: 'Les informations importantes de la grossesse : allergies, n° de sécurité sociale, groupe sanguin, points de vigilance…',
    },
    skip: 'Passer la visite guidée',
    previous: 'Étape précédente',
    go: 'C’est parti !',
    next: 'Suivant',
  },
  today: {
    titlePregnant: 'Votre forme aujourd’hui',
    titlePartner: 'La journée de {{name}}',
    noSymptomDeclared: 'Pas de symptôme aujourd’hui',
    noneNoted: 'Aucun symptôme noté aujourd’hui',
    noted_one: '{{count}} symptôme noté aujourd’hui',
    noted_other: '{{count}} symptômes notés aujourd’hui',
    partnerSymptomFree: 'Une journée sans symptôme 🌿',
    partnerNothingYet: '{{name}} n’a encore rien partagé aujourd’hui',
    toWatch_one: '{{count}} petit mal à surveiller aujourd’hui',
    toWatch_other: '{{count}} petits maux à surveiller aujourd’hui',
    moodA11yEdit: 'Humeur du jour : {{mood}}. Modifier dans Ensemble',
    moodA11yNote: 'Noter mon humeur du jour dans Ensemble',
    moodA11y: 'Humeur du jour : {{mood}}',
    noteSymptoms: 'Noter mes symptômes du jour',
    note: 'Noter',
    edit: 'Modifier',
    symptomFreeNoted: 'Journée sans symptôme, notée dans votre Journal. 🌿',
    nothingToWatch: 'Rien à surveiller pour l’instant.',
    symptomFreeSoFar:
      'Une journée sans symptôme pour l’instant. Notez-les si quelque chose change.',
    partnerWillAppear:
      'Les symptômes de {{name}} apparaîtront ici dès qu’ils seront notés.',
    tipOfTheDay: 'ASTUCE DU JOUR',
  },
  howItWorks: {
    title: 'Comment ça marche ?',
    steps: {
      add: 'Cliquer sur « Ajouter votre partenaire »',
      share: 'Partager-lui le code à 6 caractères ou le QR code',
      install:
        'La personne installe l’application et intègre le code à l’ouverture',
    },
    gotIt: 'Compris',
  },
  invite: {
    steps: {
      install: 'Votre partenaire installe US et crée son compte.',
      choose: 'À l’inscription, il ou elle choisit « Je suis partenaire ».',
      enter: 'Il ou elle saisit ce code, ou scanne le QR code.',
    },
    shareMessage:
      'Rejoins-moi sur US : à l’inscription, choisis « Je suis partenaire » puis saisis le code {{code}} (valable 30 minutes).',
    shareUnavailable:
      'Le partage n’est pas disponible ici : transmettez le code tel quel.',
    title: 'Inviter votre partenaire',
    subtitle:
      'Partagez ce code ou faites scanner le QR code pour rejoindre votre espace.',
    codeTitle: 'CODE DE L’ESPACE',
    creating: 'Création d’un code sécurisé…',
    expired: 'Ce code a expiré.',
    expiresIn: 'Code temporaire à usage unique · expire dans {{countdown}}',
    creatingShort: 'Création…',
    newCode: 'Générer un nouveau code',
    shareCode: 'Partager le code',
    cardTitle: 'Partager vos infos à deux',
    cardBody:
      'Ajoutez votre partenaire ou un proche, tout se synchronisera en temps réel.',
    addPartner: 'Ajouter votre partenaire',
    joinErrors: {
      invalid_code: 'Ce code ne correspond à aucun espace. Vérifiez-le.',
      expired_code:
        'Ce code a expiré. Demandez-en un nouveau à votre partenaire.',
      household_full: 'Cet espace a déjà un ou une partenaire.',
      household_solo:
        'Cet espace est configuré pour une personne seule : il ne peut pas accueillir de partenaire.',
      already_in_household: 'Votre compte fait déjà partie d’un espace.',
      network: 'Connexion impossible. Vérifiez votre réseau.',
      unknown: 'Impossible de rejoindre l’espace. Réessayez.',
    },
  },
  nudge: {
    a11y: 'Partager mon humeur du jour',
    title: 'Comment vous sentez-vous ?',
    bodySolo: 'Un tap pour noter votre humeur du jour.',
    body: 'Un tap pour partager votre humeur du jour.',
    close: 'Fermer le rappel',
  },
};

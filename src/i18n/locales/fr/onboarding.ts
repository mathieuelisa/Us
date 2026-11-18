/** Parcours d’onboarding (présentation, 6 étapes, réassurance, rejoindre). */
export const onboarding = {
  next: 'Suivant',
  start: 'Commencer',
  finish: 'Terminer',
  backToLogin: 'Revenir à la connexion',
  previousStep: 'Étape précédente',
  backToPreviousStep: 'Revenir à l’étape précédente',
  quitToLogin: 'Quitter l’onboarding et revenir à la connexion',
  slides: {
    welcome: {
      title: 'Bienvenue sur US',
      description:
        'L’application pensée pour les couples qui attendent un enfant. Simplifiez votre quotidien, à deux, du premier trimestre aux premiers mois.',
    },
    feelings: {
      title: 'Partagez vos émotions',
      description:
        'Grâce à US, vous saurez ce que ressent votre partenaire au quotidien — d’un simple geste, restez connectés malgré la fatigue et le stress.',
    },
    together: {
      title: 'Suivez la grossesse ensemble',
      description:
        'Rendez-vous, symptômes, taille du bébé semaine après semaine : toutes les infos essentielles centralisées et partagées à deux.',
    },
    paperwork: {
      title: 'Ne ratez aucune démarche',
      description:
        'CAF, sécurité sociale, déclaration de naissance… US vous rappelle quoi faire et quand, pour ne rien oublier après l’arrivée de bébé.',
    },
  },
  intro: {
    title: 'Faisons connaissance',
    subtitle:
      'Votre prénom et la façon de parler de vous : ils servent seulement à personnaliser l’app pour vous deux.',
    howToRefer: 'Comment parler de vous ?',
    pronouns: {
      il: {
        label: 'Il',
        description: 'Ex. « Bram est en pleine forme, il… »',
      },
      elle: {
        label: 'Elle',
        description: 'Ex. « Camille est en pleine forme, elle… »',
      },
      neutre: {
        label: 'Avec mon prénom seulement',
        description: 'Sans « il » ni « elle »',
      },
    },
    saveError:
      'Impossible d’enregistrer pour le moment. Vérifiez votre connexion, puis réessayez.',
  },
  firstName: 'Votre prénom',
  firstNameRequired: 'Votre prénom est nécessaire.',
  accompaniment: {
    title: 'Qui vous accompagne dans cette aventure ?',
    options: {
      couple: 'En couple',
      coparentalite: 'Coparentalité sans vivre ensemble',
      seul: 'Seul·e',
    },
    partnerUsesApp: 'Votre partenaire utilisera-t-il aussi l’app ?',
  },
  names: {
    title: 'Petit à petit, faisons connaissance',
    subtitle:
      'Ces prénoms nous servent uniquement à personnaliser votre espace — jamais utilisés pour vous identifier.',
    partnerFirstName: 'Prénom de votre partenaire',
    partnerFirstNameRequired: 'Le prénom de votre partenaire est nécessaire.',
  },
  dueDate: {
    title: 'Quelle est la date prévue du terme ?',
    mustBeFuture: 'La date du terme doit être aujourd’hui ou plus tard.',
    firstChild: 'Est-ce votre premier enfant ?',
    today: 'C’est pour aujourd’hui 💗',
    daysLeft_one: 'Plus qu’un jour avant la rencontre 💗',
    daysLeft_other: 'Plus que {{count}} jours avant la rencontre 💗',
    weeks_one: 'Vous êtes à {{count}} semaine d’aménorrhée.',
    weeks_other: 'Vous êtes à {{count}} semaines d’aménorrhée.',
  },
  status: {
    title: 'Quel est votre statut professionnel ?',
    subtitle: 'Pour adapter vos démarches',
    options: {
      salarie_prive: 'Salarié·e secteur privé',
      fonctionnaire: 'Fonctionnaire',
      independant: 'Indépendant·e',
      sans_emploi: 'Sans emploi actuellement',
    },
  },
  priorities: {
    title: 'Quelles sont vos priorités ?',
    subtitle: 'Plusieurs choix possibles',
    options: {
      demarches: 'Démarches administratives',
      sante: 'Suivi santé',
      partage: 'Partage avec votre partenaire',
      rendez_vous: 'Dates et rendez-vous importants',
    },
  },
  reminders: {
    title: 'Quel rythme de rappels préférez-vous ?',
    options: {
      realtime: {
        label: 'Au fil de l’eau',
        description: 'Une notification à chaque étape',
      },
      weekly: {
        label: 'Résumé hebdomadaire',
        description: 'Un récap chaque semaine',
      },
    },
  },
  reassurance: {
    title: 'Vous avez fait le bon choix',
    subtitle:
      'Des milliers de parents utilisent déjà US pour vivre cette étape sereinement',
    done: 'Configuration terminée',
    downloadsValue: '50 000 +',
    downloads: 'Téléchargements',
    ratingValue: '4,8',
    rating: 'Note moyenne',
  },
  join: {
    title: 'Rejoindre l’espace de votre partenaire',
    subtitle:
      'Saisissez le code à 6 caractères affiché dans son application, ou scannez son QR code.',
    joining: 'Connexion…',
    join: 'Rejoindre',
    createOwn: 'J’attends un bébé : je crée mon espace',
    switchError: 'Impossible de changer de parcours. Réessayez.',
    codeTitle: 'CODE DE L’ESPACE',
    codeLabel: 'Code de l’espace',
    scanQr: 'Scanner un QR code',
  },
  signOut: 'Se déconnecter',
  finalising: {
    failed: 'La création de votre espace a échoué',
    failedHint:
      'Vos réponses sont conservées. Vérifiez votre connexion, puis réessayez.',
    preparing: 'Nous préparons votre espace…',
  },
  leave: {
    signOutError: 'Impossible de vous déconnecter. Réessayez.',
    title: 'Revenir à la connexion ?',
    body: 'Vous serez déconnecté. Votre compte est conservé : en vous reconnectant, vous reprendrez l’inscription depuis le début.',
    stay: 'Rester',
    signingOut: 'Déconnexion…',
    deleteAccount: 'Supprimer mon compte',
    deleteTitle: 'Supprimer votre compte ?',
    deleteBody:
      'Votre compte et votre profil seront effacés. Vous pourrez recréer un compte plus tard avec la même adresse email.',
    final: 'C’est définitif : rien ne pourra être récupéré.',
    deleteFailed:
      'La suppression a échoué. Vérifiez votre connexion et réessayez.',
    deleting: 'Suppression…',
    deleteConfirm: 'Supprimer définitivement',
  },
  qr: {
    title: 'Scanner le QR code',
    close: 'Fermer le scanner',
    aim: 'Visez le QR code affiché dans l’application de votre partenaire.',
    cameraAccess: 'Accès à l’appareil photo',
    denied:
      'L’accès a été refusé. Autorisez-le dans les réglages du téléphone, ou saisissez le code à la main.',
    why: 'US en a besoin pour lire le QR code de votre partenaire. Rien n’est enregistré.',
    allow: 'Autoriser l’appareil photo',
  },
  stepOf: 'Étape {{step}} sur {{total}}',
};

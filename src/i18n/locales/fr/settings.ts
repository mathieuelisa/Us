/** Réglages (`(tabs)/reglages.tsx`) et ses composants. */
export const settings = {
  title: 'Réglages',
  subtitleSolo: 'Personnels.',
  subtitle: 'Personnels — non partagés avec votre partenaire.',
  account: {
    section: 'Compte',
    noAccount: 'Mode DEV — aucun compte connecté',
    signInToManage: 'Connectez-vous pour gérer votre compte.',
    viaGoogleOrPassword: 'Connexion par Google ou mot de passe',
    viaGoogle: 'Connexion avec Google',
    viaPassword: 'Connexion par email et mot de passe',
    changePassword: 'Changer le mot de passe',
    signOut: 'Se déconnecter',
    signingOut: 'Déconnexion…',
    deleteAccount: 'Supprimer mon compte',
  },
  notifications: {
    section: 'Notifications',
    appointments: 'Rendez-vous',
    appointmentsHint: 'La veille à 19h, puis 1h avant',
    procedures: 'Démarches',
    proceduresHint: 'Celles où « Me rappeler » est activé',
    vaccines: 'Vaccins de bébé',
    vaccinesHint: '7 jours avant et le jour J, à 9h',
    mood: 'Humeur du jour',
    moodHint:
      'Petit rappel dans l’app à 9h, 14h et 19h si elle n’est pas remplie',
    partner: 'Votre partenaire',
    partnerHint: 'Humeur, symptômes, rendez-vous partagé, naissance',
    toggleLabel: 'Notifications : {{label}}',
    webOnly: 'Les notifications ne fonctionnent que sur téléphone.',
    blocked: 'Les notifications sont bloquées sur ce téléphone.',
    openSettings: 'Ouvrir les réglages',
    enablePrompt: 'Recevez vos rappels et les nouvelles de l’autre parent.',
    enable: 'Activer',
  },
  appearance: {
    section: 'Apparence',
    themeLabel: 'Thème {{label}}',
    themes: {
      sauge: 'Sauge',
      corail: 'Corail',
      lavande: 'Lavande',
      ocre: 'Ocre',
    },
  },
  language: {
    label: 'Langue',
    a11y: 'Langue : {{value}}',
    sheetTitle: 'Langue de l’application',
    sheetHint:
      'Pour vous seulement : votre partenaire garde sa propre langue. Les démarches et certains contenus restent en français pour l’instant.',
  },
  tour: {
    label: 'Revoir la visite guidée',
    a11y: 'Revoir la visite guidée de l’accueil',
    hint: 'Redécouvrez l’accueil en quelques étapes',
  },
  share: {
    titleBefore: 'Partagez',
    description:
      'Un proche attend un bébé ? Faites-lui découvrir l’application.',
    button: 'Partager l’application',
    message:
      'Je te conseille US, l’application pour vivre la grossesse et les premiers mois de bébé à deux.',
    unavailable: 'Le partage n’est pas disponible sur cet appareil.',
  },
  privacy: {
    section: 'Confidentialité',
    privacyPolicy: 'Politique de confidentialité',
    terms: 'Conditions d’utilisation',
    legalNotice: 'Mentions légales',
  },
  password: {
    title: 'Changer le mot de passe',
    confirmCurrent:
      'Pour votre sécurité, confirmez d’abord votre mot de passe actuel.',
    fromResetLink:
      'Vous arrivez d’un lien de réinitialisation : choisissez directement votre nouveau mot de passe.',
    updated: 'Mot de passe mis à jour.',
    current: 'Mot de passe actuel',
    resetSent: 'Un lien de réinitialisation a été envoyé à {{email}}.',
    forgot: 'Mot de passe oublié ?',
    new: 'Nouveau mot de passe',
    confirm: 'Confirmer le mot de passe',
    minLength: '{{count}} caractères minimum.',
    sameAsCurrent: 'Le nouveau mot de passe doit être différent de l’actuel.',
    mismatch: 'Les deux mots de passe ne correspondent pas.',
  },
  deleteAccount: {
    title: 'Supprimer votre compte ?',
    pregnant:
      'Votre espace partagé sera supprimé avec toutes ses données — journal, rendez-vous, démarches, valises, informations — y compris pour votre partenaire.',
    partner:
      'Vos humeurs, vos rendez-vous et votre accès à l’espace partagé seront supprimés. L’espace et ses données restent à l’autre parent.',
    final: 'C’est définitif : rien ne pourra être récupéré.',
    confirm: 'Supprimer définitivement',
    failed: 'La suppression a échoué. Vérifiez votre connexion et réessayez.',
  },
};

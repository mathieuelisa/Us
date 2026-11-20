/** Connexion / inscription et messages d’erreur d’authentification. */
export const auth = {
  /** Accroche en deux parties autour du logo + « US ». */
  tagline: {
    top: 'Grandir ensemble',
    bottom: 'tout simplement.',
  },
  mode: {
    signIn: {
      title: 'Bon retour parmi nous',
      subtitle: 'Connectez-vous pour retrouver votre espace à deux.',
    },
    signUp: {
      title: 'Bienvenue sur US',
      subtitle: 'Créez votre compte en quelques secondes.',
    },
  },
  toggle: {
    signIn: 'Connexion',
    signUp: 'Inscription',
  },
  accountCreated:
    'Compte créé ! Confirmez votre adresse avec le lien reçu par email, puis connectez-vous.',
  enterEmailFirst:
    'Saisissez d’abord votre email ci-dessus pour recevoir le lien.',
  resetSent:
    'Si un compte existe pour cet email, un lien de réinitialisation vient de partir. Il vous connecte : choisissez ensuite un nouveau mot de passe dans Réglages.',
  passwordMismatch: 'Les deux mots de passe ne correspondent pas.',
  hidePassword: 'Masquer le mot de passe',
  showPassword: 'Afficher le mot de passe',
  youAre: 'Votre aventure commence ici',
  role: {
    pregnantTitle: 'J’attends un bébé',
    pregnantSubtitle: 'Je crée notre espace',
    partnerTitle: 'Je suis partenaire',
    partnerSubtitle: 'Je rejoins avec un code',
  },
  emailPlaceholder: 'votre@email.com',
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le mot de passe',
  forgotPassword: 'Mot de passe oublié ?',
  creating: 'Création…',
  signingIn: 'Connexion…',
  createAccount: 'Créer mon compte',
  signIn: 'Se connecter',
  or: 'ou',
  openingGoogle: 'Ouverture de Google…',
  continueWithGoogle: 'Continuer avec Google',
  strength: {
    tooShort: 'Trop court',
    weak: 'Mot de passe faible',
    fair: 'Mot de passe moyen',
    good: 'Bon mot de passe',
    strong: 'Mot de passe robuste',
    a11y: 'Solidité du mot de passe : {{label}}',
    criteria: {
      length: '{{count}} caractères min.',
      case: 'Majuscule et minuscule',
      digit: 'Chiffre',
      symbol: 'Symbole',
    },
  },
  errors: {
    invalidCredentials: 'Email ou mot de passe incorrect.',
    emailNotConfirmed:
      'Confirmez d’abord votre adresse : un lien vous a été envoyé par email.',
    userExists: 'Un compte existe déjà avec cet email. Connectez-vous plutôt.',
    weakPassword:
      'Mot de passe trop faible : {{count}} caractères minimum, mélangez lettres et chiffres.',
    wrongCurrentPassword: 'Mot de passe actuel incorrect.',
    samePassword: 'Le nouveau mot de passe doit être différent de l’actuel.',
    googleDisabled: 'La connexion avec Google n’est pas encore activée.',
    invalidEmail: 'Cette adresse email n’est pas valide.',
    rateLimit: 'Trop de tentatives. Réessayez dans quelques minutes.',
    signupDisabled: 'Les inscriptions sont fermées pour le moment.',
    reauthNeeded: 'Reconnectez-vous avant de changer votre mot de passe.',
    network: 'Connexion impossible. Vérifiez votre réseau.',
    unknown: 'Une erreur est survenue. Réessayez.',
  },
};

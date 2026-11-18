/** Match des prénoms (premium) : jeu, matchs, favoris. */
export const names = {
  title: 'Le match des prénoms',
  unlock: 'Débloquez le match des prénoms',
  description:
    "Swipez chacun de votre côté et découvrez les prénoms sur lesquels vous êtes tombés d'accord.",
  descriptionSolo:
    'Swipez les prénoms qui vous plaisent et retrouvez-les dans vos favoris.',
  modules: {
    girls: 'Prénoms filles',
    boys: 'Prénoms garçons',
    matches: 'Vos matchs',
    favorites: 'Favoris',
  },
  noMatchYet: 'Pas encore de match',
  inCommon_one: '{{count}} prénom en commun',
  inCommon_other: '{{count}} prénoms en commun',
  noneYet: 'Aucun pour l’instant',
  nameCount_one: '{{count}} prénom',
  nameCount_other: '{{count}} prénoms',
  matchCount_one: '{{count}} match',
  matchCount_other: '{{count}} matchs',
  favoriteCount_one: '{{count}} favori',
  favoriteCount_other: '{{count}} favoris',
  game: {
    saveError: 'Ce choix n’a pas pu être enregistré.',
    addedToFavorites: '{{name}} est dans vos favoris',
    removedFromFavorites: '{{name}} n’est plus dans vos favoris',
    favoriteError: 'Le favori n’a pas pu être enregistré.',
    backToCountries: 'Revenir au choix des pays',
    back: 'Revenir',
    swipeHint: 'Glissez à droite pour garder, à gauche pour écarter.',
    allSeen: 'Vous avez vu tous les prénoms',
    allSeenSolo:
      'Choisissez d’autres pays pour en découvrir de nouveaux, ou retrouvez vos favoris.',
    allSeenCouple:
      'Choisissez d’autres pays pour en découvrir de nouveaux, ou regardez les prénoms sur lesquels vous êtes d’accord.',
    otherCountries: 'Choisir d’autres pays',
    seeFavorites: 'Voir vos favoris',
    seeMatches: 'Voir vos matchs',
    toDiscover_one: '{{count}} prénom à découvrir',
    toDiscover_other: '{{count}} prénoms à découvrir',
  },
  matches: {
    subtitle: 'Les prénoms que vous avez gardés tous les deux.',
    emptyText:
      'Swipez chacun de votre côté : un prénom gardé par vous deux apparaîtra ici.',
    section: {
      girl: 'Les prénoms filles gardés par vous deux.',
      boy: 'Les prénoms garçons gardés par vous deux.',
    },
  },
  favorites: {
    subtitle: 'Vos coups de cœur, rien que pour vous.',
    empty: 'Aucun favori pour l’instant',
    emptyText:
      'Pendant le jeu, touchez une carte pour garder un prénom ici, ou ajoutez-en un vous-même ci-dessus.',
    section: {
      girl: 'Vos prénoms filles préférés.',
      boy: 'Vos prénoms garçons préférés.',
    },
  },
  list: {
    back: 'Revenir au match des prénoms',
    loading: 'Chargement…',
    nothing: {
      girl: 'Rien côté filles pour l’instant.',
      boy: 'Rien côté garçons pour l’instant.',
    },
    addedByYou: 'Ajouté par vous',
    remove: 'Retirer {{name}} des favoris',
  },
  genders: {
    girl: 'Fille',
    boy: 'Garçon',
  },
  gendersPlural: {
    girl: 'Filles',
    boy: 'Garçons',
  },
  genderTitles: {
    girl: 'Prénoms filles',
    boy: 'Prénoms garçons',
  },
  cardTag: {
    girl: 'Prénom fille',
    boy: 'Prénom garçon',
  },
  add: {
    invalid: 'Seulement des lettres, espaces, traits d’union ou apostrophes.',
    duplicate: '{{name}} est déjà dans vos favoris.',
    added: '{{name}} ajouté à vos favoris',
    error: 'Le prénom n’a pas pu être ajouté. Réessayez.',
    title: 'Ajouter un prénom',
    hint: 'Un coup de cœur absent du jeu ?',
    girlPlaceholder: 'Ex. Capucine',
    boyPlaceholder: 'Ex. Gaspard',
    submit: 'Ajouter le prénom aux favoris',
  },
  countries: {
    popular: 'Pays populaires',
    all: 'Tous les pays',
    discover: 'Découvrir les prénoms',
    selected_one: '{{count}} / {{max}} sélectionné',
    selected_other: '{{count}} / {{max}} sélectionnés',
    chooseUpTo:
      'Choisissez jusqu’à {{max}} pays d’origine pour découvrir des prénoms.',
  },
  celebration: {
    title: 'C’est un match !',
    body: 'Vous l’avez choisi tous les deux.',
    keepPlaying: 'Continuer à jouer',
    seeMatches: 'Voir nos matchs',
  },
  deck: {
    cardA11yAdd:
      '{{name}}. Glissez à droite pour garder, à gauche pour écarter ; touchez pour ajouter aux favoris.',
    cardA11yRemove:
      '{{name}}. Glissez à droite pour garder, à gauche pour écarter ; touchez pour retirer des favoris.',
    tapToAdd: 'Touchez la carte pour l’ajouter aux favoris',
    tapToRemove: 'Touchez la carte pour la retirer des favoris',
    pass: 'Écarter ce prénom',
    keep: 'Garder ce prénom',
    kept: 'GARDÉ',
    passed: 'ÉCARTÉ',
  },
};

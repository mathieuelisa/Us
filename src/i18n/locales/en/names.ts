import type { Messages } from '../fr';

export const names: Messages['names'] = {
  title: 'Baby name match',
  unlock: 'Unlock baby name match',
  description:
    'Each of you swipes on your own, then discover the names you agree on.',
  descriptionSolo: 'Swipe the names you like and find them in your favourites.',
  modules: {
    girls: 'Girls’ names',
    boys: 'Boys’ names',
    matches: 'Your matches',
    favorites: 'Favourites',
  },
  noMatchYet: 'No match yet',
  inCommon_one: '{{count}} name in common',
  inCommon_other: '{{count}} names in common',
  noneYet: 'None yet',
  nameCount_one: '{{count}} name',
  nameCount_other: '{{count}} names',
  matchCount_one: '{{count}} match',
  matchCount_other: '{{count}} matches',
  favoriteCount_one: '{{count}} favourite',
  favoriteCount_other: '{{count}} favourites',
  game: {
    saveError: 'This choice couldn’t be saved.',
    addedToFavorites: '{{name}} is in your favourites',
    removedFromFavorites: '{{name}} is no longer in your favourites',
    favoriteError: 'The favourite couldn’t be saved.',
    backToCountries: 'Back to country selection',
    back: 'Back',
    swipeHint: 'Swipe right to keep, left to pass.',
    allSeen: 'You’ve seen all the names',
    allSeenSolo:
      'Choose other countries to discover new ones, or go to your favourites.',
    allSeenCouple:
      'Choose other countries to discover new ones, or look at the names you agree on.',
    otherCountries: 'Choose other countries',
    seeFavorites: 'See your favourites',
    seeMatches: 'See your matches',
    toDiscover_one: '{{count}} name to discover',
    toDiscover_other: '{{count}} names to discover',
  },
  matches: {
    subtitle: 'The names you both kept.',
    emptyText:
      'Each of you swipes on your own: a name you both keep will show up here.',
    section: {
      girl: 'Girls’ names you both kept.',
      boy: 'Boys’ names you both kept.',
    },
  },
  favorites: {
    subtitle: 'Your favourites, just for you.',
    empty: 'No favourites yet',
    emptyText:
      'During the game, tap a card to keep a name here, or add one yourself above.',
    section: {
      girl: 'Your favourite girls’ names.',
      boy: 'Your favourite boys’ names.',
    },
  },
  list: {
    back: 'Back to baby name match',
    loading: 'Loading…',
    nothing: {
      girl: 'Nothing on the girls’ side yet.',
      boy: 'Nothing on the boys’ side yet.',
    },
    addedByYou: 'Added by you',
    remove: 'Remove {{name}} from favourites',
  },
  genders: {
    girl: 'Girl',
    boy: 'Boy',
  },
  gendersPlural: {
    girl: 'Girls',
    boy: 'Boys',
  },
  genderTitles: {
    girl: 'Girls’ names',
    boy: 'Boys’ names',
  },
  cardTag: {
    girl: 'Girl’s name',
    boy: 'Boy’s name',
  },
  add: {
    invalid: 'Only letters, spaces, hyphens or apostrophes.',
    duplicate: '{{name}} is already in your favourites.',
    added: '{{name}} added to your favourites',
    error: 'The name couldn’t be added. Try again.',
    title: 'Add a name',
    hint: 'A favourite that’s not in the game?',
    girlPlaceholder: 'E.g. Olivia',
    boyPlaceholder: 'E.g. Oliver',
    submit: 'Add the name to favourites',
  },
  countries: {
    popular: 'Popular countries',
    all: 'All countries',
    discover: 'Discover the names',
    selected_one: '{{count}} / {{max}} selected',
    selected_other: '{{count}} / {{max}} selected',
    chooseUpTo: 'Choose up to {{max}} countries of origin to discover names.',
  },
  celebration: {
    title: 'It’s a match!',
    body: 'You both chose it.',
    keepPlaying: 'Keep playing',
    seeMatches: 'See our matches',
  },
  deck: {
    cardA11yAdd:
      '{{name}}. Swipe right to keep, left to pass; tap to add to favourites.',
    cardA11yRemove:
      '{{name}}. Swipe right to keep, left to pass; tap to remove from favourites.',
    tapToAdd: 'Tap the card to add it to favourites',
    tapToRemove: 'Tap the card to remove it from favourites',
    pass: 'Pass on this name',
    keep: 'Keep this name',
    kept: 'KEPT',
    passed: 'PASSED',
  },
};

import type { Messages } from '../fr';

export const names: Messages['names'] = {
  title: 'El match de nombres',
  unlock: 'Desbloquea el match de nombres',
  description:
    'Deslizad cada uno por vuestro lado y descubrid los nombres en los que coincidís.',
  descriptionSolo:
    'Desliza los nombres que te gustan y encuéntralos en tus favoritos.',
  modules: {
    girls: 'Nombres de niña',
    boys: 'Nombres de niño',
    matches: 'Vuestros matches',
    favorites: 'Favoritos',
  },
  noMatchYet: 'Aún no hay match',
  inCommon_one: '{{count}} nombre en común',
  inCommon_other: '{{count}} nombres en común',
  noneYet: 'Ninguno por ahora',
  nameCount_one: '{{count}} nombre',
  nameCount_other: '{{count}} nombres',
  matchCount_one: '{{count}} match',
  matchCount_other: '{{count}} matches',
  favoriteCount_one: '{{count}} favorito',
  favoriteCount_other: '{{count}} favoritos',
  game: {
    saveError: 'No se ha podido guardar esta elección.',
    addedToFavorites: '{{name}} está en tus favoritos',
    removedFromFavorites: '{{name}} ya no está en tus favoritos',
    favoriteError: 'No se ha podido guardar el favorito.',
    backToCountries: 'Volver a la elección de países',
    back: 'Volver',
    swipeHint:
      'Desliza a la derecha para quedártelo, a la izquierda para descartarlo.',
    allSeen: 'Has visto todos los nombres',
    allSeenSolo:
      'Elige otros países para descubrir nuevos, o vuelve a tus favoritos.',
    allSeenCouple:
      'Elige otros países para descubrir nuevos, o mira los nombres en los que coincidís.',
    otherCountries: 'Elegir otros países',
    seeFavorites: 'Ver tus favoritos',
    seeMatches: 'Ver vuestros matches',
    toDiscover_one: '{{count}} nombre por descubrir',
    toDiscover_other: '{{count}} nombres por descubrir',
  },
  matches: {
    subtitle: 'Los nombres que habéis guardado los dos.',
    emptyText:
      'Deslizad cada uno por vuestro lado: un nombre guardado por los dos aparecerá aquí.',
    section: {
      girl: 'Los nombres de niña que habéis guardado los dos.',
      boy: 'Los nombres de niño que habéis guardado los dos.',
    },
  },
  favorites: {
    subtitle: 'Tus flechazos, solo para ti.',
    empty: 'Aún no hay favoritos',
    emptyText:
      'Durante el juego, toca una tarjeta para guardar un nombre aquí, o añade uno tú mismo arriba.',
    section: {
      girl: 'Tus nombres de niña preferidos.',
      boy: 'Tus nombres de niño preferidos.',
    },
  },
  list: {
    back: 'Volver al match de nombres',
    loading: 'Cargando…',
    nothing: {
      girl: 'Nada de niñas por ahora.',
      boy: 'Nada de niños por ahora.',
    },
    addedByYou: 'Añadido por ti',
    remove: 'Quitar {{name}} de favoritos',
  },
  genders: {
    girl: 'Niña',
    boy: 'Niño',
  },
  gendersPlural: {
    girl: 'Niñas',
    boy: 'Niños',
  },
  genderTitles: {
    girl: 'Nombres de niña',
    boy: 'Nombres de niño',
  },
  cardTag: {
    girl: 'Nombre de niña',
    boy: 'Nombre de niño',
  },
  add: {
    invalid: 'Solo letras, espacios, guiones o apóstrofos.',
    duplicate: '{{name}} ya está en tus favoritos.',
    added: '{{name}} añadido a tus favoritos',
    error: 'No se ha podido añadir el nombre. Inténtalo de nuevo.',
    title: 'Añadir un nombre',
    hint: '¿Un flechazo que no está en el juego?',
    girlPlaceholder: 'Ej.: Lucía',
    boyPlaceholder: 'Ej.: Mateo',
    submit: 'Añadir el nombre a favoritos',
  },
  countries: {
    popular: 'Países populares',
    all: 'Todos los países',
    discover: 'Descubrir los nombres',
    selected_one: '{{count}} / {{max}} seleccionado',
    selected_other: '{{count}} / {{max}} seleccionados',
    chooseUpTo: 'Elige hasta {{max}} países de origen para descubrir nombres.',
  },
  celebration: {
    title: '¡Es un match!',
    body: 'Lo habéis elegido los dos.',
    keepPlaying: 'Seguir jugando',
    seeMatches: 'Ver nuestros matches',
  },
  deck: {
    cardA11yAdd:
      '{{name}}. Desliza a la derecha para quedártelo, a la izquierda para descartarlo; toca para añadirlo a favoritos.',
    cardA11yRemove:
      '{{name}}. Desliza a la derecha para quedártelo, a la izquierda para descartarlo; toca para quitarlo de favoritos.',
    tapToAdd: 'Toca la tarjeta para añadirla a favoritos',
    tapToRemove: 'Toca la tarjeta para quitarla de favoritos',
    pass: 'Descartar este nombre',
    keep: 'Quedarme con este nombre',
    kept: 'GUARDADO',
    passed: 'DESCARTADO',
  },
};

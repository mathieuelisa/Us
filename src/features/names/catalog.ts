/**
 * Catalogue du « match des prénoms » : une dizaine de pays pour commencer
 * (demande explicite), avec une liste de prénoms filles et garçons chacun.
 *
 * En constante côté client plutôt qu'en base : contenu figé et en lecture
 * seule, qui ne justifie pas une table tant que personne ne l'édite (même
 * raisonnement que les astuces du jour). Seuls les **choix** des parents
 * (swipes, favoris) sont en base. À basculer en base le jour où le
 * catalogue doit grossir ou être modifié sans redéploiement.
 *
 * Un prénom présent dans deux pays (Alba, Lina, Adam…) est **un seul**
 * prénom pour le jeu : le choix porte sur le prénom, pas sur le pays.
 */

export type NameGender = 'girl' | 'boy';

export type NameCountry = {
  id: string;
  label: string;
  flag: string;
  girls: string[];
  boys: string[];
};

export const NAME_COUNTRIES: NameCountry[] = [
  {
    id: 'france',
    label: 'France',
    flag: '🇫🇷',
    girls: [
      'Louise',
      'Jade',
      'Ambre',
      'Alba',
      'Emma',
      'Rose',
      'Alice',
      'Romy',
      'Anna',
      'Lina',
    ],
    boys: [
      'Gabriel',
      'Raphaël',
      'Léo',
      'Louis',
      'Maël',
      'Noah',
      'Jules',
      'Adam',
      'Arthur',
      'Sacha',
    ],
  },
  {
    id: 'italie',
    label: 'Italie',
    flag: '🇮🇹',
    girls: [
      'Giulia',
      'Sofia',
      'Aurora',
      'Chiara',
      'Francesca',
      'Alessia',
      'Bianca',
      'Lucia',
      'Elena',
      'Viola',
    ],
    boys: [
      'Leonardo',
      'Lorenzo',
      'Matteo',
      'Alessandro',
      'Tommaso',
      'Francesco',
      'Gabriele',
      'Riccardo',
      'Andrea',
      'Giovanni',
    ],
  },
  {
    id: 'espagne',
    label: 'Espagne',
    flag: '🇪🇸',
    girls: [
      'Lucía',
      'Martina',
      'Carmen',
      'Valeria',
      'Paula',
      'Inés',
      'Alba',
      'Julia',
      'Noa',
      'Elena',
    ],
    boys: [
      'Hugo',
      'Mateo',
      'Martín',
      'Pablo',
      'Álvaro',
      'Diego',
      'Javier',
      'Daniel',
      'Lucas',
      'Bruno',
    ],
  },
  {
    id: 'irlande',
    label: 'Irlande',
    flag: '🇮🇪',
    girls: [
      'Aoife',
      'Saoirse',
      'Niamh',
      'Siobhán',
      'Róisín',
      'Ciara',
      'Caoimhe',
      'Clodagh',
      'Orla',
      'Éabha',
    ],
    boys: [
      'Oisín',
      'Cillian',
      'Seán',
      'Darragh',
      'Liam',
      'Ciarán',
      'Fionn',
      'Tadhg',
      'Cian',
      'Conor',
    ],
  },
  {
    id: 'maroc',
    label: 'Maroc',
    flag: '🇲🇦',
    girls: [
      'Yasmine',
      'Salma',
      'Inès',
      'Nour',
      'Aya',
      'Lina',
      'Malak',
      'Rania',
      'Khadija',
      'Amina',
    ],
    boys: [
      'Youssef',
      'Adam',
      'Amine',
      'Rayan',
      'Ilyas',
      'Mehdi',
      'Hamza',
      'Omar',
      'Karim',
      'Anas',
    ],
  },
  {
    id: 'bresil',
    label: 'Brésil',
    flag: '🇧🇷',
    girls: [
      'Helena',
      'Alice',
      'Laura',
      'Manuela',
      'Valentina',
      'Beatriz',
      'Isabela',
      'Lívia',
      'Cecília',
      'Clara',
    ],
    boys: [
      'Miguel',
      'Arthur',
      'Davi',
      'Heitor',
      'Bernardo',
      'Theo',
      'Gael',
      'Ravi',
      'Samuel',
      'Pedro',
    ],
  },
  {
    id: 'inde',
    label: 'Inde',
    flag: '🇮🇳',
    girls: [
      'Aanya',
      'Diya',
      'Priya',
      'Anika',
      'Isha',
      'Kavya',
      'Meera',
      'Saanvi',
      'Riya',
      'Tara',
    ],
    boys: [
      'Aarav',
      'Arjun',
      'Vihaan',
      'Rohan',
      'Aditya',
      'Kabir',
      'Ishaan',
      'Dev',
      'Krishna',
      'Rahul',
    ],
  },
  {
    id: 'japon',
    label: 'Japon',
    flag: '🇯🇵',
    girls: [
      'Hana',
      'Yuki',
      'Sakura',
      'Aiko',
      'Mei',
      'Emi',
      'Rin',
      'Yui',
      'Akari',
      'Nanami',
    ],
    boys: [
      'Haruto',
      'Ren',
      'Sora',
      'Kenji',
      'Takumi',
      'Yuto',
      'Hiro',
      'Riku',
      'Kaito',
      'Daiki',
    ],
  },
  {
    id: 'thailande',
    label: 'Thaïlande',
    flag: '🇹🇭',
    girls: [
      'Malee',
      'Kanya',
      'Ploy',
      'Nok',
      'Siriporn',
      'Ratana',
      'Dao',
      'Chanya',
      'Pim',
      'Areeya',
    ],
    boys: [
      'Somchai',
      'Anan',
      'Niran',
      'Kiet',
      'Arthit',
      'Chai',
      'Kittisak',
      'Prasert',
      'Thanawat',
      'Narong',
    ],
  },
  {
    id: 'laos',
    label: 'Laos',
    flag: '🇱🇦',
    girls: [
      'Noy',
      'Manivanh',
      'Vilayvanh',
      'Souphaphone',
      'Chanthaly',
      'Kesone',
      'Phetsamone',
      'Bouavanh',
      'Daovy',
      'Malaythong',
    ],
    boys: [
      'Bounmy',
      'Somphone',
      'Khamphet',
      'Souksavanh',
      'Vilaysack',
      'Phouthone',
      'Sengphet',
      'Anousone',
      'Khamla',
      'Sisavath',
    ],
  },
];

export const MAX_SELECTED_COUNTRIES = 3;

export const GENDER_META: Record<
  NameGender,
  { label: string; title: string; color: string; tint: string }
> = {
  girl: {
    label: 'fille',
    title: 'Prénoms filles',
    color: '#d6457f',
    tint: '#fde4ee',
  },
  boy: {
    label: 'garçon',
    title: 'Prénoms garçons',
    color: '#3b82c4',
    tint: '#e0eefb',
  },
};

export type NameCard = { name: string; countryIds: string[] };

/**
 * Cartes à proposer pour un genre et des pays donnés : un prénom par carte,
 * dédoublonné (un prénom de deux pays garde ses deux drapeaux), sans ceux
 * déjà swipés, dans un ordre mélangé.
 */
export function buildNameDeck(
  gender: NameGender,
  countryIds: string[],
  alreadyDecided: Set<string>,
): NameCard[] {
  const byName = new Map<string, NameCard>();
  for (const country of NAME_COUNTRIES) {
    if (!countryIds.includes(country.id)) continue;
    const names = gender === 'girl' ? country.girls : country.boys;
    for (const name of names) {
      if (alreadyDecided.has(name)) continue;
      const card = byName.get(name);
      if (card) card.countryIds.push(country.id);
      else byName.set(name, { name, countryIds: [country.id] });
    }
  }
  return shuffle([...byName.values()]);
}

/** Pays d'un prénom, pour l'afficher sur sa carte ou dans une liste. */
export function getNameCountries(countryIds: string[]): NameCountry[] {
  return NAME_COUNTRIES.filter((country) => countryIds.includes(country.id));
}

/** Pays où figure un prénom (pour les listes Matchs et Favoris). */
export function findNameCountryIds(name: string, gender: NameGender): string[] {
  return NAME_COUNTRIES.filter((country) =>
    (gender === 'girl' ? country.girls : country.boys).includes(name),
  ).map((country) => country.id);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

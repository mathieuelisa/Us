import { NameListScreen } from '@/components/names/name-list-screen';
import { GENDER_META, type NameGender } from '@/features/names/catalog';
import {
  useNameFavorites,
  useToggleNameFavorite,
} from '@/features/names/hooks';

/**
 * « Favoris » du match des prénoms : les prénoms dont on a touché la carte.
 * Personnels — le partenaire ne les voit pas.
 */
export default function NameFavoritesScreen() {
  const { data: favorites = [], isLoading } = useNameFavorites();
  const toggleFavorite = useToggleNameFavorite();

  return (
    <NameListScreen
      title="Favoris"
      subtitle="Vos coups de cœur, rien que pour vous."
      icon="heart-outline"
      items={favorites.map((favorite) => ({
        gender: favorite.gender as NameGender,
        name: favorite.name,
      }))}
      isLoading={isLoading}
      emptyTitle="Aucun favori pour l’instant"
      emptyText="Pendant le jeu, touchez une carte pour garder un prénom ici."
      image={require('@/assets/images/Prenoms_favoris.png')}
      itemNoun={{ singular: 'favori', plural: 'favoris' }}
      sectionSubtitle={(gender) =>
        `Vos prénoms ${GENDER_META[gender].label}s préférés.`
      }
      onRemove={(item) =>
        toggleFavorite.mutate({
          gender: item.gender,
          name: item.name,
          favorite: false,
        })
      }
    />
  );
}

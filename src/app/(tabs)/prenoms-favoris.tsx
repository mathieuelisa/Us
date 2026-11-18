import { useTranslation } from 'react-i18next';
import { NameListScreen } from '@/components/names/name-list-screen';
import type { NameGender } from '@/features/names/catalog';
import {
  useNameFavorites,
  useToggleNameFavorite,
} from '@/features/names/hooks';

/**
 * « Favoris » du match des prénoms : les prénoms dont on a touché la carte,
 * ou saisis à la main (« Ajouter un prénom »). Personnels — le partenaire
 * ne les voit pas.
 */
export default function NameFavoritesScreen() {
  const { t } = useTranslation();
  const { data: favorites = [], isLoading } = useNameFavorites();
  const toggleFavorite = useToggleNameFavorite();

  return (
    <NameListScreen
      title={t('names.modules.favorites')}
      subtitle={t('names.favorites.subtitle')}
      icon="heart-outline"
      items={favorites.map((favorite) => ({
        gender: favorite.gender as NameGender,
        name: favorite.name,
      }))}
      isLoading={isLoading}
      emptyTitle={t('names.favorites.empty')}
      emptyText={t('names.favorites.emptyText')}
      image={require('@/assets/images/Prenoms_favoris.png')}
      formatCount={(count) => t('names.favoriteCount', { count })}
      sectionSubtitle={(gender) => t(`names.favorites.section.${gender}`)}
      // Saisie libre (demande explicite) : même enregistrement qu'un cœur
      // touché pendant le jeu.
      onAddName={async (gender, name) => {
        await toggleFavorite.mutateAsync({ gender, name, favorite: true });
      }}
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

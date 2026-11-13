import { NameListScreen } from '@/components/names/name-list-screen';
import { GENDER_META } from '@/features/names/catalog';
import { useNameMatches } from '@/features/names/hooks';

/**
 * « Vos matchs » du match des prénoms : les prénoms gardés (swipe à
 * droite) par les deux parents.
 */
export default function NameMatchesScreen() {
  const { matches, isLoading } = useNameMatches();

  return (
    <NameListScreen
      title="Vos matchs"
      subtitle="Les prénoms que vous avez gardés tous les deux."
      icon="heart-circle-outline"
      items={matches}
      isLoading={isLoading}
      emptyTitle="Pas encore de match"
      emptyText="Swipez chacun de votre côté : un prénom gardé par vous deux apparaîtra ici."
      image={require('@/assets/images/Prenoms_matchs.png')}
      itemNoun={{ singular: 'match', plural: 'matchs' }}
      sectionSubtitle={(gender) =>
        `Les prénoms ${GENDER_META[gender].label}s gardés par vous deux.`
      }
    />
  );
}

import { useTranslation } from 'react-i18next';
import { NameListScreen } from '@/components/names/name-list-screen';
import { useNameMatches } from '@/features/names/hooks';

/**
 * « Vos matchs » du match des prénoms : les prénoms gardés (swipe à
 * droite) par les deux parents.
 */
export default function NameMatchesScreen() {
  const { t } = useTranslation();
  const { matches, isLoading } = useNameMatches();

  return (
    <NameListScreen
      title={t('names.modules.matches')}
      subtitle={t('names.matches.subtitle')}
      icon="heart-circle-outline"
      items={matches}
      isLoading={isLoading}
      emptyTitle={t('names.noMatchYet')}
      emptyText={t('names.matches.emptyText')}
      image={require('@/assets/images/Prenoms_matchs.png')}
      formatCount={(count) => t('names.matchCount', { count })}
      sectionSubtitle={(gender) => t(`names.matches.section.${gender}`)}
    />
  );
}

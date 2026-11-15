import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { useThemeAccent } from '@/features/settings/hooks';

/**
 * Tirer vers le bas recharge les données de l'écran (demande explicite,
 * d'abord sur l'accueil, puis partout où l'app affiche des données) :
 * toutes les requêtes affichées sont relancées, d'où les changements faits
 * entre-temps par l'autre parent. Indicateur à la couleur du thème.
 *
 * À passer tel quel à `refreshControl` d'une `ScrollView` :
 * `<ScrollView refreshControl={usePullToRefresh()}>`.
 */
export function usePullToRefresh() {
  const queryClient = useQueryClient();
  const accent = useThemeAccent();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries({ type: 'active' });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <RefreshControl
      refreshing={isRefreshing}
      onRefresh={refresh}
      tintColor={accent}
      colors={[accent]}
    />
  );
}

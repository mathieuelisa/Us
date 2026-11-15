import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

/**
 * Retour dans l'app = données rechargées (demande explicite : il fallait
 * quitter et relancer l'app). Sur le web, TanStack Query écoute déjà le
 * focus de la fenêtre ; sur téléphone, il faut lui dire quand l'app revient
 * au premier plan. Avec `refetchOnWindowFocus` (actif par défaut), les
 * requêtes affichées et périmées (`staleTime` : 30 s) sont alors relancées
 * — l'humeur ou les symptômes notés entre-temps par l'autre parent
 * apparaissent sans geste. Complète le tirer-pour-rafraîchir de l'accueil.
 */
if (Platform.OS !== 'web') {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (status) => {
      handleFocus(status === 'active');
    });
    return () => subscription.remove();
  });
}

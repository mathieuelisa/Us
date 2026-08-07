import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { supabase } from './client';

/**
 * Où Supabase doit renvoyer l'utilisateur après le clic sur le lien magique.
 *
 * Sans cette valeur, Supabase retombe sur le `Site URL` du projet — par
 * défaut `http://localhost:3000`, qui ne correspond à rien ici : le lien
 * aboutit à une erreur de connexion.
 *
 * - **Web** : l'origine courante, port de dev inclus.
 * - **Natif** : un deep link vers l'app. `Linking.createURL()` produit la
 *   bonne forme selon le contexte d'exécution (`exp://…` sous Expo Go,
 *   `us://…` en build de développement ou en production).
 *
 * ⚠️ Chaque forme d'URL produite ici doit être autorisée dans
 * `Authentication > URL Configuration` du projet Supabase, sinon la
 * redirection est refusée silencieusement — Supabase retombe alors sur le
 * `Site URL` sans prévenir.
 *
 * Le `/` final n'est pas cosmétique : les entrées de la liste blanche sont
 * de la forme `http://localhost:8081/**`, et un glob `/**` ne matche pas
 * une origine nue sans slash.
 */
export function getAuthRedirectTo(): string {
  if (Platform.OS === 'web') {
    return `${window.location.origin}/`;
  }
  return Linking.createURL('/');
}

/**
 * Ouvre une session à partir d'une URL de retour de lien magique. Supabase
 * place les jetons dans le **fragment** (`#access_token=…`), jamais dans la
 * query string — d'où le découpage sur `#`.
 */
async function setSessionFromUrl(url: string): Promise<boolean> {
  const fragment = url.split('#')[1];
  if (!fragment) return false;

  const params = new URLSearchParams(fragment);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return false;

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  return !error;
}

/**
 * Récupère la session quand l'app est **ouverte par** le lien magique.
 *
 * Volontairement exécuté au chargement du module, avant le premier rendu :
 * sur web, le routeur normalise l'URL très tôt et efface le fragment. Le
 * layout racine attend cette promesse avant son premier `getSession()`.
 */
async function recoverSessionFromInitialUrl(): Promise<void> {
  if (Platform.OS !== 'web') {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) await setSessionFromUrl(initialUrl);
    return;
  }

  if (typeof window === 'undefined') return;

  const hash = window.location.hash;
  if (!hash?.includes('access_token')) return;

  // Le jeton est à usage unique : on le retire de l'URL quoi qu'il arrive.
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search,
  );

  await setSessionFromUrl(`#${hash.replace(/^#/, '')}`);
}

export const initialSessionRecovery = recoverSessionFromInitialUrl();

/**
 * Traite les liens magiques reçus alors que l'app **tourne déjà** (cas
 * courant sur mobile : l'app est en arrière-plan, l'utilisateur clique le
 * lien depuis sa boîte mail). Sans ce listener, seul le démarrage à froid
 * fonctionnerait. Sans objet sur web, où le clic provoque un chargement.
 */
export function useMagicLinkListener(): void {
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void setSessionFromUrl(url);
    });

    return () => subscription.remove();
  }, []);
}

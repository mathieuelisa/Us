import { Platform } from 'react-native';

import { supabase } from './client';

/**
 * On web, the magic-link email redirects back with the session tokens in
 * the URL hash (`#access_token=...&refresh_token=...`). GoTrueClient can
 * parse that itself via `detectSessionInUrl`, but that requires trusting
 * its internal timing relative to when the app mounts — this reads the
 * hash explicitly instead, at module-evaluation time (before React/the
 * router renders anything), and clears it from the URL immediately since
 * the token is one-time-use. No-op on native: magic links there arrive via
 * a deep link (custom URL scheme), not `window.location`, and aren't
 * handled yet (see DOCS/02-ACTION-PLAN.md).
 *
 * The root layout awaits this promise before calling `getSession()`.
 */
function recoverSessionFromUrl(): Promise<unknown> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return Promise.resolve();
  }

  const hash = window.location.hash;
  if (!hash?.includes('access_token')) {
    return Promise.resolve();
  }

  const params = new URLSearchParams(hash.slice(1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');

  // Clean the one-time-use token out of the URL regardless of outcome.
  window.history.replaceState(
    null,
    '',
    window.location.pathname + window.location.search,
  );

  if (!access_token || !refresh_token) {
    return Promise.resolve();
  }

  return supabase.auth.setSession({ access_token, refresh_token });
}

export const webSessionRecovery = recoverSessionFromUrl();

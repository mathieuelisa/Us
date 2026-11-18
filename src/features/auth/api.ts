import type { AuthError } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { unregisterPushToken } from '@/features/notifications/setup';
import i18n from '@/i18n';
import {
  createSessionFromUrl,
  getAuthRedirectTo,
} from '@/lib/supabase/auth-redirect';
import { supabase } from '@/lib/supabase/client';

/**
 * Connexion et compte (décision du 2026-11-11) : email + mot de passe, ou
 * Google. Le lien magique est abandonné. La session ouverte ici est captée
 * par `onAuthStateChange` dans le layout racine, qui route ensuite vers
 * l'onboarding ou le hub — rien à naviguer à la main.
 */

/** Longueur minimale imposée côté app (Supabase en exige 6 par défaut). */
export const PASSWORD_MIN_LENGTH = 8;

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
}

/**
 * Crée le compte. Renvoie `needsEmailConfirmation: true` quand Supabase
 * exige une confirmation par email (réglage « Confirm email » du projet) :
 * aucune session n'est alors ouverte avant le clic sur le lien.
 */
/**
 * Rôle annoncé à l'inscription (demande explicite) : la personne qui attend
 * le bébé crée son espace (onboarding) ; le ou la partenaire rejoint celui
 * de l'autre avec un code. Envoyé dans les métadonnées de l'inscription,
 * d'où `handle_new_user` remplit `profiles.is_partner` — c'est ce champ du
 * profil que l'app lit ensuite (`useMyProfile`).
 */
export type SignupRole = 'pregnant' | 'partner';

export async function signUpWithPassword(
  email: string,
  password: string,
  role: SignupRole = 'pregnant',
): Promise<{ needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: getAuthRedirectTo(),
      data: { signup_role: role },
    },
  });
  if (error) throw error;
  return { needsEmailConfirmation: data.session === null };
}

/**
 * Envoie l'email de réinitialisation. Le lien ouvre une session dans l'app
 * (`auth-redirect.ts`), d'où l'on choisit un nouveau mot de passe dans
 * Réglages.
 */
export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: getAuthRedirectTo() },
  );
  if (error) throw error;
}

/**
 * Connexion (ou inscription, c'est le même geste) avec Google.
 *
 * - **Web** : Supabase redirige la page vers Google puis la ramène sur
 *   l'origine de l'app, où `initialSessionRecovery` lit les jetons.
 * - **Natif** : la page Google s'ouvre dans une session de navigateur
 *   dédiée, qui se referme d'elle-même au retour sur le deep link ; on ouvre
 *   la session à partir de l'URL reçue.
 *
 * Renvoie `false` si l'utilisateur a refermé la fenêtre sans aller au bout.
 * Nécessite le fournisseur Google activé dans le dashboard Supabase.
 */
export async function signInWithGoogle(): Promise<boolean> {
  const redirectTo = getAuthRedirectTo();

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
    return true;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;
  return createSessionFromUrl(result.url);
}

/**
 * Déconnexion. On tente d'abord de fermer la session côté serveur (portée
 * `global` par défaut) ; si l'appel échoue — hors ligne, typiquement —
 * Supabase garde la session sur l'appareil et l'utilisateur resterait
 * connecté sans explication. On se rabat alors sur une déconnexion
 * **locale**, qui efface toujours la session de l'appareil : c'est ce que
 * l'utilisateur demande en appuyant sur le bouton.
 */
export async function signOut() {
  // Plus d'alertes de ce compte sur cet appareil (avant la déconnexion : la
  // fonction exige la session). Sans réseau, tant pis : le token sera
  // réattribué au prochain compte connecté sur ce téléphone.
  await unregisterPushToken().catch(() => {});
  const { error } = await supabase.auth.signOut();
  if (error) {
    await supabase.auth.signOut({ scope: 'local' });
  }
}

/** Erreur levée quand le mot de passe actuel saisi est faux. */
export const INVALID_CURRENT_PASSWORD = 'invalid_current_password';

/**
 * Change le mot de passe. `currentPassword` (demande explicite) est vérifié
 * côté serveur en se reconnectant avec lui avant la mise à jour — même
 * compte, la session est simplement renouvelée. `null` après un lien
 * « Mot de passe oublié » : l'utilisateur ne connaît plus l'ancien, le lien
 * reçu par email fait office de preuve.
 */
export async function changePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string | null;
  newPassword: string;
}) {
  if (currentPassword !== null) {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) throw new Error('No email on the current user');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInError) {
      throw signInError.code === 'invalid_credentials'
        ? Object.assign(new Error(INVALID_CURRENT_PASSWORD), {
            code: INVALID_CURRENT_PASSWORD,
          })
        : signInError;
    }
  }
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/** Email de réinitialisation pour l'utilisateur connecté. */
export async function sendPasswordResetToMe(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email) throw new Error('No email on the current user');
  await sendPasswordReset(email);
  return email;
}

/**
 * Supprime le compte via l'Edge Function `delete-account` (la clé
 * `service_role` ne quitte jamais le serveur), puis ferme la session
 * locale — le jeton ne vaut plus rien côté serveur.
 */
export async function deleteMyAccount() {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
}

/**
 * Message d'erreur en français à partir d'une erreur Supabase Auth. Les
 * codes viennent de `AuthError.code` ; le texte brut sert de repli pour les
 * cas que Supabase ne code pas (fournisseur désactivé).
 */
export function getAuthErrorMessage(error: unknown): string {
  const authError = error as Partial<AuthError> | null;
  const code = authError?.code;
  const message = authError?.message ?? '';

  switch (code) {
    case 'invalid_credentials':
      return i18n.t('auth.errors.invalidCredentials');
    case 'email_not_confirmed':
      return i18n.t('auth.errors.emailNotConfirmed');
    case 'user_already_exists':
    case 'email_exists':
      return i18n.t('auth.errors.userExists');
    case 'weak_password':
      return i18n.t('auth.errors.weakPassword', {
        count: PASSWORD_MIN_LENGTH,
      });
    case INVALID_CURRENT_PASSWORD:
      return i18n.t('auth.errors.wrongCurrentPassword');
    case 'same_password':
      return i18n.t('auth.errors.samePassword');
    case 'email_address_invalid':
    case 'validation_failed':
      if (/provider is not enabled/i.test(message)) {
        return i18n.t('auth.errors.googleDisabled');
      }
      return i18n.t('auth.errors.invalidEmail');
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return i18n.t('auth.errors.rateLimit');
    case 'signup_disabled':
      return i18n.t('auth.errors.signupDisabled');
    case 'reauthentication_needed':
      return i18n.t('auth.errors.reauthNeeded');
    default:
      if (/provider is not enabled/i.test(message)) {
        return i18n.t('auth.errors.googleDisabled');
      }
      if (/network|fetch/i.test(message)) {
        return i18n.t('auth.errors.network');
      }
      return i18n.t('auth.errors.unknown');
  }
}

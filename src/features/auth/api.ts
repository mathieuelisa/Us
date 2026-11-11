import type { AuthError } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

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
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<{ needsEmailConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { emailRedirectTo: getAuthRedirectTo() },
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

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
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
      return 'Email ou mot de passe incorrect.';
    case 'email_not_confirmed':
      return 'Confirmez d’abord votre adresse : un lien vous a été envoyé par email.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Un compte existe déjà avec cet email. Connectez-vous plutôt.';
    case 'weak_password':
      return `Mot de passe trop faible : ${PASSWORD_MIN_LENGTH} caractères minimum, mélangez lettres et chiffres.`;
    case 'same_password':
      return 'Le nouveau mot de passe doit être différent de l’actuel.';
    case 'email_address_invalid':
    case 'validation_failed':
      if (/provider is not enabled/i.test(message)) {
        return 'La connexion avec Google n’est pas encore activée.';
      }
      return 'Cette adresse email n’est pas valide.';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Trop de tentatives. Réessayez dans quelques minutes.';
    case 'signup_disabled':
      return 'Les inscriptions sont fermées pour le moment.';
    case 'reauthentication_needed':
      return 'Reconnectez-vous avant de changer votre mot de passe.';
    default:
      if (/provider is not enabled/i.test(message)) {
        return 'La connexion avec Google n’est pas encore activée.';
      }
      if (/network|fetch/i.test(message)) {
        return 'Connexion impossible. Vérifiez votre réseau.';
      }
      return 'Une erreur est survenue. Réessayez.';
  }
}

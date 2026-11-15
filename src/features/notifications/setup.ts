import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase/client';

/** Pas de notifications dans l'aperçu web : tout est ignoré sans erreur. */
export const areNotificationsSupported = Platform.OS !== 'web';

/**
 * Canaux Android (réglables un par un dans les paramètres du téléphone).
 * `partner` est aussi celui qu'indique l'Edge Function `send-push`.
 */
export const NOTIFICATION_CHANNELS = {
  reminders: 'reminders',
  partner: 'partner',
} as const;

let isConfigured = false;

/** Affichage des notifications app ouverte, et canaux Android. Idempotent. */
export async function configureNotifications(): Promise<void> {
  if (!areNotificationsSupported || isConfigured) return;
  isConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CHANNELS.reminders,
      {
        name: 'Rappels',
        description: 'Rendez-vous et démarches',
        importance: Notifications.AndroidImportance.HIGH,
      },
    );
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CHANNELS.partner,
      {
        name: 'Votre partenaire',
        description: 'Ce que partage l’autre parent',
        importance: Notifications.AndroidImportance.HIGH,
      },
    );
  }
}

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!areNotificationsSupported) return 'denied';
  const { status } = await Notifications.getPermissionsAsync();
  return status as NotificationPermission;
}

/**
 * Demande l'autorisation une seule fois (le système ne repropose pas la
 * fenêtre après un refus : il faut alors passer par les réglages du
 * téléphone, cf. Réglages de l'app).
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await getNotificationPermission();
  if (current === 'granted') return true;
  if (current === 'denied') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Les push ne marchent ni sur simulateur, ni dans Expo Go sur Android
 * (retirées depuis le SDK 53) : il faut un build. Les rappels locaux, eux,
 * fonctionnent partout sauf sur le web.
 */
function canUseRemotePush(): boolean {
  if (!areNotificationsSupported || !Device.isDevice) return false;
  return !(
    Platform.OS === 'android' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

let registeredToken: string | null = null;

/**
 * Enregistre le token Expo de l'appareil pour le compte connecté
 * (`register_push_token`) : c'est lui que vise l'Edge Function `send-push`.
 * Silencieux si l'appareil ne peut pas recevoir de push.
 */
export async function registerPushToken(): Promise<void> {
  if (!canUseRemotePush()) return;
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) return;

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  const { error } = await supabase.rpc('register_push_token', {
    p_token: token,
    p_platform: Platform.OS,
  });
  if (error) throw error;
  registeredToken = token;
}

/**
 * À la déconnexion : l'appareil ne doit plus recevoir les alertes de ce
 * compte. À appeler avant `auth.signOut()` (la fonction exige la session).
 */
export async function unregisterPushToken(): Promise<void> {
  if (!registeredToken) return;
  const token = registeredToken;
  registeredToken = null;
  await supabase.rpc('unregister_push_token', { p_token: token });
}

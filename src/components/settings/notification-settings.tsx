import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Pressable,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import {
  useNotificationPermission,
  useUpdateNotificationPreferences,
} from '@/features/notifications/hooks';
import {
  areNotificationsSupported,
  ensureNotificationPermission,
  registerPushToken,
} from '@/features/notifications/setup';
import type { NotificationPreferences } from '@/features/profile/api';
import { useMyProfile } from '@/features/profile/hooks';
import { hexToRgba } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const ROWS: {
  key: keyof NotificationPreferences;
  icon: IoniconName;
  label: 'appointments' | 'procedures' | 'vaccines' | 'mood' | 'partner';
  isPartnerOnly?: boolean;
}[] = [
  {
    key: 'notify_appointments',
    icon: 'calendar-outline',
    label: 'appointments',
  },
  {
    key: 'notify_procedures',
    icon: 'document-text-outline',
    label: 'procedures',
  },
  {
    key: 'notify_vaccines',
    icon: 'medkit-outline',
    label: 'vaccines',
  },
  {
    key: 'notify_mood_reminder',
    icon: 'happy-outline',
    label: 'mood',
  },
  {
    key: 'notify_partner',
    icon: 'heart-outline',
    label: 'partner',
    isPartnerOnly: true,
  },
];

/**
 * Section Notifications de Réglages (demande explicite) : un interrupteur
 * par type, enregistré dans le profil (`profiles.notify_*`) — lu par l'app
 * pour les rappels locaux et par la base pour les push de l'autre parent.
 * Si le téléphone bloque les notifications, on le dit et on mène à ses
 * réglages : l'app ne peut pas redemander l'autorisation elle-même.
 */
export function NotificationSettings({
  accent,
  isSolo,
  cardStyle,
}: {
  accent: string;
  isSolo: boolean;
  cardStyle: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  const { data: profile } = useMyProfile();
  const updatePreferences = useUpdateNotificationPreferences();
  const permissionQuery = useNotificationPermission();
  const permission = permissionQuery.data;

  const enableNotifications = async () => {
    const isGranted = await ensureNotificationPermission();
    if (isGranted) await registerPushToken().catch(() => {});
    permissionQuery.refetch();
  };

  const rows = ROWS.filter((row) => !(row.isPartnerOnly && isSolo));

  return (
    <View className="gap-3">
      {!areNotificationsSupported ? (
        <Notice
          accent={accent}
          icon="phone-portrait-outline"
          text={t('settings.notifications.webOnly')}
        />
      ) : permission === 'denied' ? (
        <Notice
          accent={accent}
          icon="notifications-off-outline"
          text={t('settings.notifications.blocked')}
          actionLabel={t('settings.notifications.openSettings')}
          onAction={() => Linking.openSettings()}
        />
      ) : permission === 'undetermined' ? (
        <Notice
          accent={accent}
          icon="notifications-outline"
          text={t('settings.notifications.enablePrompt')}
          actionLabel={t('settings.notifications.enable')}
          onAction={enableNotifications}
        />
      ) : null}

      <View className="overflow-hidden rounded-[24px]" style={cardStyle}>
        {rows.map((row, index) => (
          <View
            key={row.key}
            className={`flex-row items-center gap-3.5 px-3.5 py-3 ${
              index > 0 ? 'border-t border-black/5' : ''
            }`}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: hexToRgba(accent, 0.1) }}
            >
              <Ionicons name={row.icon} size={20} color={accent} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text
                className="text-[15.5px] font-medium"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {t(`settings.notifications.${row.label}`)}
              </Text>
              <Text
                className="text-[12.5px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {t(`settings.notifications.${row.label}Hint`)}
              </Text>
            </View>
            <ToggleSwitch
              accessibilityLabel={t('settings.notifications.toggleLabel', {
                label: t(`settings.notifications.${row.label}`),
              })}
              value={profile?.[row.key] ?? true}
              disabled={!profile}
              onValueChange={(value) =>
                updatePreferences.mutate({ [row.key]: value })
              }
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function Notice({
  accent,
  icon,
  text,
  actionLabel,
  onAction,
}: {
  accent: string;
  icon: IoniconName;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-[20px] px-3.5 py-3"
      style={{ backgroundColor: hexToRgba(accent, 0.08) }}
    >
      <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text
        className="flex-1 text-[13px] leading-[18px]"
        style={{ color: GLASS_BODY_COLOR }}
      >
        {text}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          className="rounded-full px-3.5 py-2 active:opacity-70"
          style={{ backgroundColor: accent }}
        >
          <Text className="text-[13px] font-semibold text-white">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

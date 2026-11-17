import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import type { Appointment } from '@/features/health/api';
import { hexToRgba, lightenHex } from '@/lib/color';
import { daysBetween, todayIso } from '@/lib/date';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Fiche d'un rendez-vous, ouverte depuis « Nos prochains rendez-vous » de
 * l'accueil (demande explicite) : modale centrée qui reprend toutes ses
 * infos — date complète, heure, lieu et notes, partage, auteur.
 *
 * « Modifier » n'apparaît que pour son créateur (demande explicite, et
 * c'est aussi ce qu'impose la RLS `appointments_update_creator`) : il ouvre
 * la feuille de modification existante (`AppointmentFormModal`), qui porte
 * aussi la suppression. Pour un rendez-vous de l'autre parent, la fiche est
 * en lecture seule et le dit.
 *
 * Un seul `Modal` à la fois : l'écran appelant ferme cette fiche avant
 * d'ouvrir le formulaire, deux `Modal` superposées se comportant mal selon
 * les plateformes.
 */
export function AppointmentDetailModal({
  appointment,
  isMine,
  isSolo,
  partnerName,
  accent,
  onEdit,
  onOpenAgenda,
  onClose,
}: {
  /** Rendez-vous affiché ; `null` ferme la fiche. */
  appointment: Appointment | null;
  isMine: boolean;
  /** Espace « Seul·e » : ni partage, ni auteur à afficher. */
  isSolo: boolean;
  partnerName: string | null;
  accent: string;
  onEdit: () => void;
  onOpenAgenda: () => void;
  onClose: () => void;
}) {
  if (!appointment) {
    return null;
  }

  const relativeDay = formatRelativeDay(appointment.appointment_date);
  const time = appointment.appointment_time
    ? formatTime(appointment.appointment_time)
    : null;
  const partnerLabel = partnerName || 'votre partenaire';

  const sharing = isSolo
    ? null
    : isMine
      ? appointment.is_shared
        ? {
            icon: 'people-outline' as const,
            label: 'Partagé',
            value: `Visible par vous et ${partnerLabel}`,
          }
        : {
            icon: 'lock-closed-outline' as const,
            label: 'Non partagé',
            value: 'Visible par vous seul·e',
          }
      : {
          icon: 'person-outline' as const,
          label: 'Ajouté par',
          value: capitalize(partnerLabel),
        };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(180)}
        className="flex-1 items-center justify-center bg-black/45 px-5"
      >
        {/* Toucher le voile ferme la fiche. */}
        <Pressable
          accessibilityLabel="Fermer"
          accessibilityRole="button"
          onPress={onClose}
          className="absolute inset-0"
        />

        <Animated.View
          entering={ZoomIn.duration(220)}
          className="max-h-[88%] w-full max-w-[440px] overflow-hidden rounded-[32px] bg-white"
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 18 },
            shadowOpacity: 0.18,
            shadowRadius: 30,
            elevation: 12,
          }}
        >
          {/* Tache pâle en haut à gauche, comme les autres fiches. */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -80,
              left: -90,
              width: 230,
              height: 200,
              borderRadius: 115,
              backgroundColor: lightenHex(accent, 0.6),
              opacity: 0.3,
            }}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-5 px-6 pb-6 pt-6"
          >
            <View className="flex-row items-start gap-3">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: hexToRgba(accent, 0.12) }}
              >
                <Ionicons name="calendar" size={22} color={accent} />
              </View>

              <View className="flex-1 gap-1.5 pr-10">
                <Text
                  className="text-[22px] font-extrabold leading-7"
                  style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
                >
                  {appointment.title}
                </Text>
                {relativeDay ? (
                  <View
                    className="self-start rounded-full px-2.5 py-1"
                    style={{ backgroundColor: hexToRgba(accent, 0.1) }}
                  >
                    <Text
                      className="text-[12px] font-semibold"
                      style={{ color: accent }}
                    >
                      {relativeDay}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View
              className="gap-3.5 rounded-[22px] px-4 py-4"
              style={{ backgroundColor: hexToRgba(accent, 0.05) }}
            >
              <InfoRow icon="calendar-outline" label="Date" accent={accent}>
                {capitalize(formatLongDate(appointment.appointment_date))}
              </InfoRow>
              <InfoRow icon="time-outline" label="Heure" accent={accent}>
                {time ?? 'Non précisée'}
              </InfoRow>
              {appointment.address ? (
                <InfoRow
                  icon="location-outline"
                  label="Adresse, notes"
                  accent={accent}
                >
                  {appointment.address}
                </InfoRow>
              ) : null}
              {appointment.notes ? (
                <InfoRow
                  icon="document-text-outline"
                  label="Notes"
                  accent={accent}
                >
                  {appointment.notes}
                </InfoRow>
              ) : null}
              {sharing ? (
                <InfoRow
                  icon={sharing.icon}
                  label={sharing.label}
                  accent={accent}
                >
                  {sharing.value}
                </InfoRow>
              ) : null}
            </View>

            <View className="gap-3">
              {isMine ? (
                <PillButton
                  label="Modifier le rendez-vous"
                  icon="create-outline"
                  size="compact"
                  onPress={onEdit}
                />
              ) : (
                <Text
                  className="text-center text-[12.5px] leading-[18px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  Seul·e {partnerLabel} peut modifier ce rendez-vous.
                </Text>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={onOpenAgenda}
                className="flex-row items-center justify-center gap-1.5 py-1"
              >
                <Text
                  className="text-[14px] font-semibold"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  Voir tout l’agenda
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={GLASS_TITLE_COLOR}
                />
              </Pressable>
            </View>
          </ScrollView>

          <View className="absolute right-4 top-4">
            <Pressable
              accessibilityLabel="Fermer"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-white"
              style={{
                shadowColor: accent,
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.14,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Ionicons name="close" size={20} color={GLASS_TITLE_COLOR} />
            </Pressable>
            <SparkLines
              color={hexToRgba(accent, 0.55)}
              style={{
                top: 42,
                right: -8,
                transform: [{ rotate: '60deg' }, { scale: 0.8 }],
              }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/** Ligne d'info : pastille d'icône, petit libellé, valeur. */
function InfoRow({
  icon,
  label,
  accent,
  children,
}: {
  icon: IoniconName;
  label: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
        <Ionicons name={icon} size={17} color={accent} />
      </View>
      <View className="flex-1 gap-0.5 pt-0.5">
        <Text className="text-[11.5px] font-semibold uppercase tracking-wide text-[#9a9a9a]">
          {label}
        </Text>
        <Text
          className="text-[15px] leading-5"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {children}
        </Text>
      </View>
    </View>
  );
}

/** « 2026-11-18 » → « mercredi 18 novembre 2026 ». */
function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** « 10:30:00 » → « 10h30 ». */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}h${minutes}`;
}

/** Aujourd'hui, demain, dans N jours ; rien pour un rendez-vous passé. */
function formatRelativeDay(isoDate: string): string | null {
  const days = daysBetween(todayIso(), isoDate);
  if (days < 0) return null;
  if (days === 0) return 'Aujourd’hui';
  if (days === 1) return 'Demain';
  return `Dans ${days} jours`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { Fragment } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import type { Appointment } from '@/features/health/api';
import { useThemeBackground } from '@/features/settings/hooks';
import { darkenHex, deepenPastel, hexToRgba, lightenHex } from '@/lib/color';
import { daysBetween, todayIso } from '@/lib/date';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Pastilles de couleur fixes par type d'info, comme sur la référence :
 * l'heure en ambre, le lieu en rose, les personnes en lavande. La date,
 * elle, prend l'accent du thème.
 */
const INFO_TONES = {
  amber: { color: '#d99a2b', background: '#fdf1dc' },
  pink: { color: '#e0607a', background: '#fde6ea' },
  lavender: { color: '#8270d0', background: '#efebfc' },
} as const;

/**
 * Illustration fournie (fond transparent, étincelles incluses) : calendrier
 * de bureau vert, case du jour cochée en ambre. Verte, elle ne suit pas le
 * thème.
 */
const CALENDAR_ILLUSTRATION = require('@/assets/images/Appointment_calendar.png');

type InfoTone = keyof typeof INFO_TONES | 'accent';

type InfoItem = {
  key: string;
  icon: IoniconName;
  tone: InfoTone;
  label: string;
  value: string;
};

/**
 * Fiche d'un rendez-vous, ouverte depuis « Nos prochains rendez-vous » de
 * l'accueil (demande explicite) : modale centrée qui reprend toutes ses
 * infos — date complète, heure, lieu et notes, partage, auteur.
 *
 * Habillage d'après une capture de référence (demande explicite : plus
 * moderne, plus proche du reste de l'app) : en-tête teinté de l'accent avec
 * une vague et un calendrier illustré, pastille d'icône et puce « Dans N
 * jours » sous le titre, infos en lignes séparées par des filets avec une
 * pastille colorée chacune, bouton gélule en dégradé.
 *
 * Le calendrier est une illustration fournie (`Appointment_calendar.png`).
 *
 * « Modifier » n'apparaît que pour son créateur (demande explicite, et
 * c'est aussi ce qu'impose la RLS `appointments_update_creator`) : il ouvre
 * la feuille de modification existante (`AppointmentFormModal`), qui porte
 * aussi la suppression. Pour un rendez-vous de l'autre parent, la fiche est
 * en lecture seule et le dit ; « Voir tout l'agenda » devient alors le
 * bouton principal.
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
  const partnerLabel = partnerName || 'votre partenaire';

  const infos: InfoItem[] = [
    {
      key: 'date',
      icon: 'calendar-outline',
      tone: 'accent',
      label: 'Date',
      value: capitalize(formatLongDate(appointment.appointment_date)),
    },
    {
      key: 'time',
      icon: 'time-outline',
      tone: 'amber',
      label: 'Heure',
      value: appointment.appointment_time
        ? formatTime(appointment.appointment_time)
        : 'Non précisée',
    },
  ];
  if (appointment.address) {
    infos.push({
      key: 'address',
      icon: 'location-outline',
      tone: 'pink',
      label: 'Adresse, notes',
      value: appointment.address,
    });
  }
  if (appointment.notes) {
    infos.push({
      key: 'notes',
      icon: 'document-text-outline',
      tone: 'pink',
      label: 'Notes',
      value: appointment.notes,
    });
  }
  if (!isSolo) {
    infos.push(
      isMine
        ? {
            key: 'sharing',
            icon: appointment.is_shared ? 'people-outline' : 'eye-off-outline',
            tone: 'lavender',
            label: appointment.is_shared ? 'Partagé' : 'Non partagé',
            value: appointment.is_shared
              ? `Visible par vous et ${partnerLabel}`
              : 'Visible par vous seul·e',
          }
        : {
            key: 'author',
            icon: 'person-outline',
            tone: 'lavender',
            label: 'Ajouté par',
            value: capitalize(partnerLabel),
          },
    );
  }

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
          className="max-h-[90%] w-full max-w-[440px] overflow-hidden rounded-[34px] bg-white"
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 18 },
            shadowOpacity: 0.2,
            shadowRadius: 30,
            elevation: 12,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <Header
              title={appointment.title}
              relativeDay={relativeDay}
              accent={accent}
            />

            <View className="gap-4 px-5 pb-6">
              <View
                className="rounded-[24px] px-4"
                style={{
                  backgroundColor: hexToRgba(accent, 0.035),
                  borderWidth: 1,
                  borderColor: hexToRgba(accent, 0.1),
                }}
              >
                {infos.map((info, index) => (
                  <Fragment key={info.key}>
                    {index > 0 ? (
                      <View
                        className="ml-[60px] h-px"
                        style={{ backgroundColor: hexToRgba(accent, 0.1) }}
                      />
                    ) : null}
                    <InfoRow info={info} accent={accent} />
                  </Fragment>
                ))}
              </View>

              {isMine ? null : (
                <View
                  className="flex-row items-center gap-3 rounded-full py-2 pl-2 pr-4"
                  style={{ backgroundColor: hexToRgba(accent, 0.07) }}
                >
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                    <Ionicons
                      name="lock-closed-outline"
                      size={17}
                      color={accent}
                    />
                  </View>
                  <Text
                    className="flex-1 text-[13px] leading-[18px]"
                    style={{ color: GLASS_BODY_COLOR }}
                  >
                    Seul·e {partnerLabel} peut modifier ce rendez-vous.
                  </Text>
                </View>
              )}

              {isMine ? (
                <>
                  <GradientPill
                    label="Modifier le rendez-vous"
                    icon="create-outline"
                    accent={accent}
                    onPress={onEdit}
                  />
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
                </>
              ) : (
                <GradientPill
                  label="Voir tout l’agenda"
                  icon="calendar-clear-outline"
                  hasArrow
                  accent={accent}
                  onPress={onOpenAgenda}
                />
              )}
            </View>
          </ScrollView>

          <Pressable
            accessibilityLabel="Fermer"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: accent,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.16,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Ionicons name="close" size={22} color={GLASS_TITLE_COLOR} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/**
 * En-tête teinté : vague claire en bas, calendrier illustré à droite,
 * pastille d'icône, titre et puce « Dans N jours ».
 */
function Header({
  title,
  relativeDay,
  accent,
}: {
  title: string;
  relativeDay: string | null;
  accent: string;
}) {
  // Pastel du thème (le fond des écrans) plutôt qu'une transparence de
  // l'accent : avec un accent foncé, cette dernière tire au gris.
  const themeBackground = useThemeBackground();

  return (
    <View className="pb-6">
      {/* Dégradé diagonal comme sur la référence : menthe franche en haut
          à gauche, presque blanc vers la droite. */}
      <LinearGradient
        colors={[
          deepenPastel(themeBackground, 0.07),
          deepenPastel(themeBackground, 0.03),
          lightenHex(themeBackground, 0.03),
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.7 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      {/* Deux vagues superposées, la dernière blanche, pour fondre
          l'en-tête dans le corps de la fiche. */}
      <Svg
        pointerEvents="none"
        width="100%"
        height={64}
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
      >
        <Path
          d="M0 40 C 90 6, 170 50, 260 30 C 320 16, 370 10, 400 22 L 400 64 L 0 64 Z"
          fill={deepenPastel(themeBackground, 0.05)}
          opacity={0.85}
        />
        <Path
          d="M0 48 C 80 28, 150 62, 250 44 C 320 32, 370 34, 400 40 L 400 64 L 0 64 Z"
          fill="#ffffff"
        />
      </Svg>

      <View
        pointerEvents="none"
        style={{ position: 'absolute', right: 62, top: 28 }}
      >
        <Image
          source={CALENDAR_ILLUSTRATION}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
          style={{ width: 112, height: 106 }}
        />
      </View>

      <View className="flex-row items-center gap-3.5 px-5 pb-8 pr-[168px] pt-11">
        <View
          className="h-16 w-16 items-center justify-center rounded-[20px]"
          style={{
            backgroundColor: deepenPastel(themeBackground, 0.1),
            shadowColor: accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
          }}
        >
          <Ionicons name="calendar" size={30} color={darkenHex(accent, 0.08)} />
        </View>

        <View className="flex-1 gap-2">
          <Text
            numberOfLines={3}
            className="text-[25px] font-extrabold leading-[30px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
          >
            {title}
          </Text>
          {relativeDay ? (
            <View
              className="flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5"
              style={{ backgroundColor: deepenPastel(themeBackground, 0.08) }}
            >
              <Ionicons
                name="calendar-outline"
                size={13}
                color={darkenHex(accent, 0.08)}
              />
              <Text
                className="text-[13px] font-bold"
                style={{ color: darkenHex(accent, 0.08) }}
              >
                {relativeDay}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** Ligne d'info : pastille d'icône colorée, petit libellé, valeur. */
function InfoRow({ info, accent }: { info: InfoItem; accent: string }) {
  // Menthe du thème comme l'en-tête, plutôt qu'une transparence grise de
  // l'accent.
  const themeBackground = useThemeBackground();
  const tone =
    info.tone === 'accent'
      ? {
          color: darkenHex(accent, 0.04),
          background: deepenPastel(themeBackground, 0.08),
        }
      : INFO_TONES[info.tone];

  return (
    <View className="flex-row items-center gap-3.5 py-3.5">
      <View
        className="h-11 w-11 items-center justify-center rounded-[14px]"
        style={{ backgroundColor: tone.background }}
      >
        <Ionicons name={info.icon} size={21} color={tone.color} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[11.5px] font-bold uppercase tracking-wide text-[#8f939b]">
          {info.label}
        </Text>
        <Text
          className="text-[16px] font-medium leading-[21px]"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {info.value}
        </Text>
      </View>
    </View>
  );
}

/** Gélule en dégradé d'accent : icône, libellé, flèche facultative. */
function GradientPill({
  label,
  icon,
  hasArrow = false,
  accent,
  onPress,
}: {
  label: string;
  icon: IoniconName;
  hasArrow?: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-14 overflow-hidden rounded-full"
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 5,
      })}
    >
      <LinearGradient
        colors={[lightenHex(accent, 0.1), accent, darkenHex(accent, 0.06)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      {/* Reflet clair à droite. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -24,
          top: -18,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: 'rgba(255, 255, 255, 0.09)',
        }}
      />
      <View className="flex-1 flex-row items-center justify-center gap-2.5 px-5">
        <Ionicons name={icon} size={20} color="#ffffff" />
        <Text className="text-[16px] font-bold text-white">{label}</Text>
        {hasArrow ? (
          <Ionicons name="arrow-forward" size={19} color="#ffffff" />
        ) : null}
      </View>
    </Pressable>
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

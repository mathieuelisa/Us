import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { IconBubble, IconInput } from '@/components/ui/icon-input';
import { PillButton } from '@/components/ui/pill-button';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import { WheelTimePicker } from '@/components/wheel-time-picker';
import type { Appointment } from '@/features/health/api';
import { parseTimeInput } from '@/features/health/constants';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';
import { todayIso } from '@/lib/date';

/**
 * Écran 4g, ouvert par l'un ou l'autre parent. Le choix partagé/non partagé
 * est fait **à la création** : c'est lui qui décide si l'autre parent verra
 * ce rendez-vous (RLS `appointments_select_own_or_shared` — un rendez-vous
 * non partagé n'est visible que de son créateur). Partagé par défaut
 * (demande explicite), décochable au cas par cas.
 *
 * `animationType="none"` sur `Modal` (même parti pris que `HowItWorksModal`) :
 * le fond opaque apparaît instantanément, seule la carte glisse
 * (`SlideInDown`/`SlideOutDown`, Reanimated).
 *
 * Habillage d'après une capture de référence (demande explicite) : titre
 * souligné et sous-titre, bouton de fermeture rond, champs en gélule à
 * icône d'accent, partage dans une bande teintée, « Ajouter au calendrier »
 * en `PillButton`. Sans les flèches gauche/droite de la capture autour de
 * la date (demande explicite), et resserrée pour tenir sans défiler.
 *
 * Pas de rendez-vous dans le passé (demande explicite) : la molette part
 * d'aujourd'hui, et un jour passé choisi sur le calendrier avant
 * l'ouverture est ramené à aujourd'hui.
 *
 * **Modification** (`editingAppointment` fourni, demande explicite) : même
 * feuille, pré-remplie, titrée « Modifier le rendez-vous », avec
 * « Enregistrer les modifications » et un lien de suppression. Un
 * rendez-vous déjà passé garde sa date : la molette ne descend alors pas
 * plus bas qu'elle, pour pouvoir corriger son titre sans la déplacer.
 */
export function AppointmentFormModal({
  visible,
  isSaving,
  initialDate,
  editingAppointment = null,
  onSubmit,
  onDelete,
  isDeleting = false,
  onCancel,
}: {
  visible: boolean;
  isSaving: boolean;
  /** Date déjà choisie sur le calendrier avant l'ouverture, le cas échéant. */
  initialDate?: string | null;
  /** Rendez-vous à modifier ; absent pour une création. */
  editingAppointment?: Appointment | null;
  /** Suppression depuis la feuille, en modification seulement. */
  onDelete?: () => void;
  isDeleting?: boolean;
  onSubmit: (input: {
    title: string;
    appointmentDate: string;
    appointmentTime: string | null;
    address: string | null;
    isShared: boolean;
  }) => void;
  onCancel: () => void;
}) {
  const accent = useThemeAccent();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<string>(todayIso());
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [isShared, setIsShared] = useState(true);

  const isEditing = editingAppointment !== null;
  const today = todayIso();
  const minDate =
    editingAppointment && editingAppointment.appointment_date < today
      ? editingAppointment.appointment_date
      : today;

  useEffect(() => {
    if (!visible) return;
    if (editingAppointment) {
      setTitle(editingAppointment.title);
      setDate(editingAppointment.appointment_date);
      // `HH:MM:SS` en base → « 10:30 », format de la molette d'heure.
      setTime(editingAppointment.appointment_time?.slice(0, 5) ?? '');
      setAddress(editingAppointment.address ?? '');
      setIsShared(editingAppointment.is_shared);
      return;
    }
    setTitle('');
    const currentDay = todayIso();
    setDate(initialDate && initialDate > currentDay ? initialDate : currentDay);
    setTime('');
    setAddress('');
    setIsShared(true);
  }, [visible, initialDate, editingAppointment]);

  const canSubmit =
    title.trim().length > 0 && date >= minDate && !isSaving && !isDeleting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="max-h-[94%] overflow-hidden rounded-t-[32px] bg-white"
        >
          {/* Tache pâle en haut à droite, derrière le bouton de fermeture. */}
          <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
          >
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -70,
                right: -60,
                width: 220,
                height: 200,
                borderRadius: 110,
                backgroundColor: lightenHex(accent, 0.55),
                opacity: 0.35,
              }}
            />
          </View>

          {/* La feuille doit tenir sans défiler (demande explicite) : tailles
              resserrées, molettes de date et d'heure compactes. Le `ScrollView` ne reste qu'en filet de sécurité (très
              petit écran, clavier ouvert). */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-3.5 px-5 pb-7 pt-2.5"
          >
            <View className="h-1.5 w-11 self-center rounded-full bg-[#e6e6ea]" />

            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1.5">
                <Text
                  className="text-[22px] font-extrabold leading-7"
                  style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
                >
                  {isEditing
                    ? 'Modifier le rendez-vous'
                    : 'Nouveau rendez-vous'}
                </Text>
                <Svg width={92} height={10} viewBox="0 0 92 10">
                  <Path
                    d="M3 7 C 27 2, 62 1.5, 89 4"
                    stroke={hexToRgba(accent, 0.5)}
                    strokeWidth={3}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
                <Text
                  className="text-[13px] leading-[18px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {isEditing
                    ? 'Mettez à jour les informations de votre rendez-vous.'
                    : 'Ajoutez les informations de votre rendez-vous.'}
                </Text>
              </View>
              <View>
                <Pressable
                  accessibilityLabel="Fermer"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={onCancel}
                  className="h-9 w-9 items-center justify-center rounded-full bg-white"
                  style={{
                    shadowColor: accent,
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.14,
                    shadowRadius: 10,
                    elevation: 4,
                  }}
                >
                  <Ionicons name="close" size={19} color={GLASS_TITLE_COLOR} />
                </Pressable>
                <SparkLines
                  color={hexToRgba(accent, 0.55)}
                  style={{
                    top: 40,
                    right: -10,
                    transform: [{ rotate: '60deg' }, { scale: 0.85 }],
                  }}
                />
              </View>
            </View>

            <IconInput
              icon="calendar-clear-outline"
              placeholder="Titre — ex. Écho T2"
              value={title}
              onChangeText={setTitle}
              accent={accent}
            />

            <View className="gap-2">
              <View className="flex-row items-center gap-2.5">
                <IconBubble icon="calendar-outline" color={accent} />
                <Text
                  className="text-[14px] font-semibold"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  Date
                </Text>
              </View>
              <WheelDatePicker
                value={date}
                minDate={minDate}
                onChange={setDate}
                compact
              />
            </View>

            {/* Heure à la molette (demande explicite, plus pratique qu'une
                saisie au clavier). Facultative : sans heure, un simple
                bouton ; « Retirer » revient à un rendez-vous sans heure. */}
            <View className="gap-2">
              <View className="flex-row items-center gap-2.5">
                <IconBubble icon="time-outline" color={accent} />
                <Text
                  className="flex-1 text-[14px] font-semibold"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  Heure
                </Text>
                {time ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Retirer l'heure du rendez-vous"
                    hitSlop={8}
                    onPress={() => setTime('')}
                    className="flex-row items-center gap-1 rounded-full px-2.5 py-1 active:opacity-70"
                    style={{ backgroundColor: hexToRgba(accent, 0.08) }}
                  >
                    <Ionicons name="close" size={13} color={accent} />
                    <Text
                      className="text-[12px] font-semibold"
                      style={{ color: accent }}
                    >
                      Retirer
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {time ? (
                <WheelTimePicker value={time} onChange={setTime} compact />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setTime('09:00')}
                  className="h-11 flex-row items-center justify-center gap-1.5 rounded-[16px] active:opacity-70"
                  style={{
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: hexToRgba(accent, 0.35),
                    backgroundColor: hexToRgba(accent, 0.04),
                  }}
                >
                  <Ionicons name="add" size={17} color={accent} />
                  <Text
                    className="text-[13.5px] font-semibold"
                    style={{ color: accent }}
                  >
                    Ajouter une heure
                  </Text>
                  <Text className="text-[12.5px]" style={{ color: '#a3a1b0' }}>
                    (facultatif)
                  </Text>
                </Pressable>
              )}
            </View>

            <IconInput
              icon="document-text-outline"
              placeholder="Adresse, notes… (facultatif)"
              value={address}
              onChangeText={setAddress}
              accent={accent}
            />

            <View
              className="flex-row items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3"
              style={{ backgroundColor: hexToRgba(accent, 0.07) }}
            >
              <View className="h-[34px] w-[34px] items-center justify-center rounded-full bg-white">
                <Ionicons name="people" size={17} color={accent} />
              </View>
              <Text
                className="flex-1 text-[14px]"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                Visible par les deux parents
              </Text>
              <Switch
                value={isShared}
                onValueChange={setIsShared}
                trackColor={{ true: accent }}
              />
            </View>

            <PillButton
              label={
                isEditing
                  ? isSaving
                    ? 'Enregistrement…'
                    : 'Enregistrer les modifications'
                  : isSaving
                    ? 'Ajout en cours…'
                    : 'Ajouter au calendrier'
              }
              icon={isEditing ? 'save-outline' : 'calendar-outline'}
              size="compact"
              isDisabled={!canSubmit}
              onPress={() =>
                onSubmit({
                  title: title.trim(),
                  appointmentDate: date,
                  appointmentTime: parseTimeInput(time),
                  address: address.trim() || null,
                  isShared,
                })
              }
            />

            <View className="flex-row items-center justify-center gap-6">
              <Pressable
                accessibilityRole="button"
                className="items-center"
                onPress={onCancel}
              >
                <Text
                  className="text-[14.5px] font-semibold"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  Annuler
                </Text>
              </Pressable>
              {isEditing && onDelete ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isDeleting || isSaving }}
                  disabled={isDeleting || isSaving}
                  onPress={onDelete}
                  className="flex-row items-center gap-1.5"
                >
                  <Ionicons name="trash-outline" size={16} color="#d14b3a" />
                  <Text className="text-[14.5px] font-semibold text-[#d14b3a]">
                    {isDeleting ? 'Suppression…' : 'Supprimer'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

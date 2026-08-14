import { Button } from 'heroui-native';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { WheelDatePicker } from '@/components/wheel-date-picker';
import { parseTimeInput } from '@/features/health/constants';
import { todayIso } from '@/lib/date';

/**
 * Écran 4g. Le choix partagé/non partagé est fait **à la création** : c'est
 * lui qui décide si le co-parent verra ce rendez-vous (RLS
 * `appointments_select_scoped`). Non partagé par défaut — sur un pilier
 * santé, le défaut doit être le moins divulgant.
 *
 * `animationType="none"` sur `Modal` (même parti pris que `HowItWorksModal`) :
 * le fond opaque apparaît instantanément, seule la carte glisse
 * (`SlideInDown`/`SlideOutDown`, Reanimated).
 */
export function AppointmentFormModal({
  visible,
  isSaving,
  initialDate,
  onSubmit,
  onCancel,
}: {
  visible: boolean;
  isSaving: boolean;
  /** Date déjà choisie sur le calendrier avant l'ouverture, le cas échéant. */
  initialDate?: string | null;
  onSubmit: (input: {
    title: string;
    appointmentDate: string;
    appointmentTime: string | null;
    address: string | null;
    isShared: boolean;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<string>(todayIso());
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [isShared, setIsShared] = useState(true);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setDate(initialDate ?? todayIso());
      setTime('');
      setAddress('');
      setIsShared(true);
    }
  }, [visible, initialDate]);

  const isTimeInvalid = time.trim().length > 0 && parseTimeInput(time) === null;
  const canSubmit = title.trim().length > 0 && !isTimeInvalid && !isSaving;

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
          className="max-h-[88%] rounded-t-3xl bg-white px-6 pb-8 pt-6"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4"
          >
            <Text className="text-[18px] font-bold text-[#1a1a1a]">
              Nouveau rendez-vous
            </Text>

            <PlainInput
              placeholder="Titre — ex. Écho T2"
              value={title}
              onChangeText={setTitle}
            />

            <View className="gap-2">
              <Text className="text-[13px] font-medium text-[#6b6b6b]">
                Date
              </Text>
              <WheelDatePicker value={date} onChange={setDate} />
            </View>

            <View className="gap-1.5">
              <PlainInput
                placeholder="Heure — ex. 10h30 (facultatif)"
                value={time}
                onChangeText={setTime}
              />
              {isTimeInvalid ? (
                <Text className="text-[12.5px] text-red-600">
                  Heure non reconnue. Formats acceptés : 10h30, 10:30.
                </Text>
              ) : null}
            </View>

            <PlainInput
              placeholder="Adresse, notes… (facultatif)"
              value={address}
              onChangeText={setAddress}
            />

            <View className="flex-row items-center justify-between gap-3 rounded-xl bg-[#f4f4f4] px-3.5 py-3">
              <Text className="flex-1 text-[14px] text-[#1a1a1a]">
                Visible par les deux parents
              </Text>
              <Switch
                value={isShared}
                onValueChange={setIsShared}
                trackColor={{ true: '#2D5E5A' }}
              />
            </View>

            <Button
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
            >
              <Button.Label>
                {isSaving ? 'Ajout en cours…' : 'Ajouter au calendrier'}
              </Button.Label>
            </Button>

            <Pressable
              accessibilityRole="button"
              className="items-center py-1"
              onPress={onCancel}
            >
              <Text className="text-[14px] text-[#6b6b6b]">Annuler</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * `TextInput` brut plutôt que `Input` de Hero UI Native : dans une `Modal`,
 * les champs de la bibliothèque rendent un fond sombre hérité du thème qui
 * jure avec la feuille blanche (même famille de soucis que le variant
 * `outline`, cf. DOCS/05-DETTE-ET-POINTS-OUVERTS.md).
 */
function PlainInput(props: {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <TextInput
      placeholder={props.placeholder}
      placeholderTextColor="#9a9a9a"
      value={props.value}
      onChangeText={props.onChangeText}
      className="rounded-xl border border-[#e0e0e0] px-3.5 py-3 text-[14px] text-[#1a1a1a]"
    />
  );
}

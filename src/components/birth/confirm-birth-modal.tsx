import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { formatBirthDateLong } from '@/features/birth/constants';

/**
 * Dernier palier avant l'écriture de `households.birth_date`. Une pop-up
 * plutôt qu'un appui direct sur le bouton de l'écran 7a : la date saisie à
 * la molette se choisit d'un geste continu, et c'est un événement pivot
 * partagé par les deux parents — la relire en toutes lettres évite de
 * déclarer la naissance au mauvais jour d'un coup de pouce malheureux.
 *
 * Même ossature que `HowItWorksModal` (feuille basse, `animationType="none"`
 * + `SlideInDown`) pour ne pas introduire un troisième langage de modale.
 */
export function ConfirmBirthModal({
  visible,
  birthDate,
  isSubmitting,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  birthDate: string | null;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="gap-5 rounded-t-[24px] bg-white px-6 pb-8 pt-4"
        >
          <View className="h-1 w-10 self-center rounded-full bg-[#e0e0e0]" />

          <View className="gap-1.5">
            <Text className="text-[18px] font-bold text-[#1a1a1a]">
              Confirmer cette date ?
            </Text>
            <Text className="text-[14px] leading-5 text-[#6b6b6b]">
              Vos échéances de démarches seront recalculées à partir d’elle.
            </Text>
          </View>

          <View className="items-center gap-1 rounded-2xl bg-accent/10 px-4 py-4">
            <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
              DATE DE NAISSANCE
            </Text>
            <Text className="text-center text-[17px] font-semibold text-accent">
              {birthDate ? formatBirthDateLong(birthDate) : '—'}
            </Text>
          </View>

          <View className="flex-row items-start gap-2">
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#8a8a8a"
            />
            <Text className="flex-1 text-[12.5px] leading-[18px] text-[#8a8a8a]">
              Vous pourrez la corriger depuis cet écran si vous vous trompez.
            </Text>
          </View>

          <View className="gap-2.5">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: isSubmitting,
                busy: isSubmitting,
              }}
              disabled={isSubmitting}
              onPress={onConfirm}
              className={`items-center rounded-full bg-accent py-3.5 ${
                isSubmitting ? 'opacity-60' : ''
              }`}
            >
              <Text className="text-[15px] font-semibold text-accent-foreground">
                {isSubmitting ? 'Enregistrement…' : 'Oui, bébé est arrivé'}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={onClose}
              className="items-center py-2"
            >
              <Text className="text-[14px] text-[#6b6b6b]">
                Modifier la date
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

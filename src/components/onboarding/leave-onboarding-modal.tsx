import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { signOut } from '@/features/auth/api';
import { hexToRgba } from '@/lib/color';

/**
 * Confirmation avant de quitter l'onboarding pour la page de connexion
 * (demande explicite : pouvoir revenir en arrière depuis le premier écran).
 *
 * Le compte existe déjà et la session est ouverte : revenir à la connexion,
 * c'est se déconnecter — le layout racine renvoie alors vers `/login`. À la
 * reconnexion, l'onboarding reprend (toujours pas de foyer). D'où la
 * confirmation : la flèche ou le retour système Android se touchent par
 * réflexe.
 *
 * Même ossature que les autres feuilles basses de l'app (`Modal`
 * transparente + `SlideInDown`).
 */
export function LeaveOnboardingModal({
  visible,
  accent,
  onClose,
}: {
  visible: boolean;
  accent: string;
  onClose: () => void;
}) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) setErrorMessage(null);
  }, [visible]);

  // Hors ligne, `signOut()` se rabat sur une déconnexion locale : l'échec
  // reste improbable, mais on ne laisse pas l'écran bloqué sur « … ».
  const leave = async () => {
    setIsLeaving(true);
    setErrorMessage(null);
    try {
      await signOut();
    } catch {
      setErrorMessage('Impossible de vous déconnecter. Réessayez.');
      setIsLeaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={isLeaving ? () => {} : onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="gap-5 rounded-t-[28px] bg-white px-6 pb-8 pt-4"
        >
          <View className="h-1 w-10 self-center rounded-full bg-[#e0e0e0]" />

          <View className="flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: hexToRgba(accent, 0.12) }}
            >
              <Ionicons name="log-out-outline" size={22} color={accent} />
            </View>
            <Text
              className="flex-1 text-[20px] font-extrabold"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              Revenir à la connexion ?
            </Text>
          </View>

          <Text
            className="text-[14px] leading-5"
            style={{ color: GLASS_BODY_COLOR }}
          >
            Vous serez déconnecté. Votre compte est conservé : vous reprendrez
            l’inscription là où elle en est en vous reconnectant.
          </Text>

          {errorMessage ? (
            <Text className="text-[12.5px] text-[#c9553d]">{errorMessage}</Text>
          ) : null}

          <View className="gap-2">
            <PillButton
              label="Rester"
              onPress={onClose}
              isDisabled={isLeaving}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isLeaving, busy: isLeaving }}
              disabled={isLeaving}
              onPress={leave}
              className="items-center py-2"
            >
              <Text
                className="text-[14px] font-semibold"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {isLeaving ? 'Déconnexion…' : 'Revenir à la connexion'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

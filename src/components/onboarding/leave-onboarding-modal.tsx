import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { deleteMyAccount, signOut } from '@/features/auth/api';
import { useMyHousehold } from '@/features/household/hooks';
import { hexToRgba } from '@/lib/color';

const DANGER_RED = '#d14b3a';

type Mode = 'leave' | 'delete';

/**
 * Confirmation avant de quitter l'onboarding pour la page de connexion
 * (demande explicite : pouvoir revenir en arrière depuis le premier écran).
 *
 * Le compte existe déjà et la session est ouverte : revenir à la connexion,
 * c'est se déconnecter — le layout racine renvoie alors vers `/login`. Les
 * réponses de l'onboarding ne vivent qu'en mémoire (`onboardingDraftAtom`) :
 * à la reconnexion, l'inscription **reprend depuis le début**, ce que le
 * texte dit (il promettait à tort une reprise « là où elle en est »).
 * D'où la confirmation : la flèche ou le retour système Android se
 * touchent par réflexe.
 *
 * « Supprimer mon compte » (choix validé, plutôt qu'une suppression
 * automatique au retour, irréversible sur un geste réflexe) : lien rouge
 * discret qui bascule la feuille sur une seconde confirmation, puis appelle
 * l'Edge Function `delete-account` — la même que Réglages. Proposé
 * seulement sans foyer : il n'y a alors que le compte et le profil à
 * effacer. Le co-parent qui a déjà rejoint un espace (« Faire
 * connaissance ») passe par Réglages, dont la confirmation détaille ce qui
 * disparaît.
 *
 * Même ossature que les autres feuilles basses de l'app (`Modal`
 * transparente + `SlideInDown`), avec les réglages Android bord à bord.
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
  const insets = useSafeAreaInsets();
  const { data: household } = useMyHousehold();
  // `null` = résolu, sans foyer ; `undefined` = pas encore chargé.
  const canDeleteAccount = household === null;

  const [mode, setMode] = useState<Mode>('leave');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setMode('leave');
      setErrorMessage(null);
    }
  }, [visible]);

  // Hors ligne, `signOut()` se rabat sur une déconnexion locale : l'échec
  // reste improbable, mais on ne laisse pas l'écran bloqué sur « … ».
  const leave = async () => {
    setIsBusy(true);
    setErrorMessage(null);
    try {
      await signOut();
    } catch {
      setErrorMessage('Impossible de vous déconnecter. Réessayez.');
      setIsBusy(false);
    }
  };

  const deleteAccount = async () => {
    setIsBusy(true);
    setErrorMessage(null);
    try {
      // La session tombe : le layout racine renvoie vers la connexion.
      await deleteMyAccount();
    } catch {
      setErrorMessage(
        'La suppression a échoué. Vérifiez votre connexion et réessayez.',
      );
      setIsBusy(false);
    }
  };

  const showMode = (next: Mode) => {
    setErrorMessage(null);
    setMode(next);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={
        isBusy
          ? () => {}
          : mode === 'delete'
            ? () => showMode('leave')
            : onClose
      }
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="rounded-t-[28px] bg-white px-6 pt-4"
          style={{ paddingBottom: 24 + insets.bottom }}
        >
          <View className="mb-5 h-1 w-10 self-center rounded-full bg-[#e0e0e0]" />

          {mode === 'leave' ? (
            <Animated.View
              key="leave"
              entering={FadeIn.duration(180)}
              className="gap-5"
            >
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
                Vous serez déconnecté. Votre compte est conservé : en vous
                reconnectant, vous reprendrez l’inscription depuis le début.
              </Text>

              {errorMessage ? (
                <Text className="text-[12.5px] text-[#c9553d]">
                  {errorMessage}
                </Text>
              ) : null}

              <View className="gap-1">
                <PillButton
                  label="Rester"
                  onPress={onClose}
                  isDisabled={isBusy}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isBusy, busy: isBusy }}
                  disabled={isBusy}
                  onPress={leave}
                  className="items-center py-2.5"
                >
                  <Text
                    className="text-[14px] font-semibold"
                    style={{ color: GLASS_TITLE_COLOR }}
                  >
                    {isBusy ? 'Déconnexion…' : 'Revenir à la connexion'}
                  </Text>
                </Pressable>
                {canDeleteAccount ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={isBusy}
                    onPress={() => showMode('delete')}
                    className="flex-row items-center justify-center gap-1.5 py-2"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={14}
                      color={DANGER_RED}
                    />
                    <Text
                      className="text-[13px] font-semibold"
                      style={{ color: DANGER_RED }}
                    >
                      Supprimer mon compte
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </Animated.View>
          ) : (
            <Animated.View
              key="delete"
              entering={FadeIn.duration(180)}
              className="gap-5"
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: hexToRgba(DANGER_RED, 0.1) }}
                >
                  <Ionicons name="trash-outline" size={22} color={DANGER_RED} />
                </View>
                <Text
                  className="flex-1 text-[20px] font-extrabold"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  Supprimer votre compte ?
                </Text>
              </View>

              <View
                className="gap-2 rounded-[20px] px-4 py-3.5"
                style={{ backgroundColor: hexToRgba(DANGER_RED, 0.07) }}
              >
                <Text
                  className="text-[14px] leading-5"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  Votre compte et votre profil seront effacés. Vous pourrez
                  recréer un compte plus tard avec la même adresse email.
                </Text>
                <Text
                  className="text-[13px] font-semibold"
                  style={{ color: DANGER_RED }}
                >
                  C’est définitif : rien ne pourra être récupéré.
                </Text>
              </View>

              {errorMessage ? (
                <Text className="text-[12.5px] text-[#c9553d]">
                  {errorMessage}
                </Text>
              ) : null}

              <View className="gap-1">
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isBusy, busy: isBusy }}
                  disabled={isBusy}
                  onPress={deleteAccount}
                  className="h-12 items-center justify-center rounded-full active:opacity-80"
                  style={{
                    backgroundColor: DANGER_RED,
                    opacity: isBusy ? 0.6 : 1,
                  }}
                >
                  <Text className="text-[15px] font-bold text-white">
                    {isBusy ? 'Suppression…' : 'Supprimer définitivement'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isBusy}
                  onPress={() => showMode('leave')}
                  className="items-center py-2.5"
                >
                  <Text
                    className="text-[14px] font-semibold"
                    style={{ color: GLASS_TITLE_COLOR }}
                  >
                    Annuler
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

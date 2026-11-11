import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { IconInput } from '@/components/ui/icon-input';
import { PillButton } from '@/components/ui/pill-button';
import {
  deleteMyAccount,
  getAuthErrorMessage,
  PASSWORD_MIN_LENGTH,
  updatePassword,
} from '@/features/auth/api';
import { useThemeAccent } from '@/features/settings/hooks';

const DANGER_RED = '#d14b3a';

/**
 * Feuille basse commune aux deux modales du compte — même ossature que
 * `ConfirmBirthModal` (`animationType="none"` + `SlideInDown`) pour ne pas
 * introduire un troisième langage de modale.
 */
function Sheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
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
          className="gap-5 rounded-t-[28px] bg-white px-6 pb-8 pt-4"
        >
          <View className="h-1 w-10 self-center rounded-full bg-[#e0e0e0]" />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Nouveau mot de passe, pour les comptes créés par email (un compte Google
 * n'a pas de mot de passe chez nous). Sert aussi après un lien « Mot de
 * passe oublié », qui connecte l'utilisateur sans lui demander l'ancien.
 */
export function ChangePasswordModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const accent = useThemeAccent();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (visible) {
      setPassword('');
      setConfirmation('');
      setErrorMessage(null);
      setIsDone(false);
    }
  }, [visible]);

  const isLongEnough = password.length >= PASSWORD_MIN_LENGTH;
  const doMatch = password === confirmation;
  const canSave = isLongEnough && doMatch && !isSaving;

  const save = async () => {
    if (!canSave) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updatePassword(password);
      setIsDone(true);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const hint =
    password.length > 0 && !isLongEnough
      ? `${PASSWORD_MIN_LENGTH} caractères minimum.`
      : confirmation.length > 0 && !doMatch
        ? 'Les deux mots de passe ne correspondent pas.'
        : null;

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-1.5">
        <Text
          className="text-[20px] font-extrabold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          Changer le mot de passe
        </Text>
        <Text className="text-[13.5px]" style={{ color: GLASS_BODY_COLOR }}>
          Il servira dès votre prochaine connexion.
        </Text>
      </View>

      {isDone ? (
        <View className="gap-4">
          <View
            className="flex-row items-center gap-2.5 rounded-[18px] px-3.5 py-3"
            style={{ backgroundColor: 'rgba(52, 168, 83, 0.1)' }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#2e9a4f" />
            <Text
              className="flex-1 text-[14px]"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              Mot de passe mis à jour.
            </Text>
          </View>
          <PillButton label="Fermer" size="compact" onPress={onClose} />
        </View>
      ) : (
        <View className="gap-3">
          <IconInput
            icon="lock-closed-outline"
            placeholder="Nouveau mot de passe"
            value={password}
            onChangeText={setPassword}
            accent={accent}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <IconInput
            icon="shield-checkmark-outline"
            placeholder="Confirmer le mot de passe"
            value={confirmation}
            onChangeText={setConfirmation}
            accent={accent}
            isInvalid={confirmation.length > 0 && !doMatch}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={save}
          />
          {hint ? (
            <Text className="px-2 text-[12.5px] text-[#c9553d]">{hint}</Text>
          ) : null}
          {errorMessage ? (
            <Text className="px-2 text-[12.5px] text-[#c9553d]">
              {errorMessage}
            </Text>
          ) : null}

          <View className="mt-1 gap-2">
            <PillButton
              label={isSaving ? 'Enregistrement…' : 'Enregistrer'}
              icon="save-outline"
              size="compact"
              isDisabled={!canSave}
              onPress={save}
            />
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              className="items-center py-2"
            >
              <Text className="text-[14px]" style={{ color: GLASS_BODY_COLOR }}>
                Annuler
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Sheet>
  );
}

/**
 * Confirmation de suppression du compte. Les conséquences diffèrent selon le
 * rôle (cascades de la base, cf. `supabase/functions/delete-account`) :
 * supprimer le compte de la personne enceinte supprime l'espace partagé
 * entier, co-parent compris ; celui du co-parent ne retire que ses propres
 * données. Le texte le dit avant le geste, qui est irréversible.
 */
export function DeleteAccountModal({
  visible,
  isPregnant,
  onClose,
}: {
  visible: boolean;
  isPregnant: boolean;
  onClose: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) setErrorMessage(null);
  }, [visible]);

  const confirmDeletion = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      // La session tombe : le layout racine renvoie vers la connexion.
      await deleteMyAccount();
    } catch {
      setErrorMessage(
        'La suppression a échoué. Vérifiez votre connexion et réessayez.',
      );
      setIsDeleting(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={isDeleting ? () => {} : onClose}>
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(209, 75, 58, 0.1)' }}
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
        style={{ backgroundColor: 'rgba(209, 75, 58, 0.07)' }}
      >
        <Text
          className="text-[14px] leading-5"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {isPregnant
            ? 'Votre espace partagé sera supprimé avec toutes ses données — journal, rendez-vous, démarches, valises, informations — y compris pour votre co-parent.'
            : 'Vos humeurs, vos rendez-vous et votre accès à l’espace partagé seront supprimés. L’espace et ses données restent à l’autre parent.'}
        </Text>
        <Text
          className="text-[13px] font-semibold"
          style={{ color: DANGER_RED }}
        >
          C’est définitif : rien ne pourra être récupéré.
        </Text>
      </View>

      {errorMessage ? (
        <Text className="text-[12.5px] text-[#c9553d]">{errorMessage}</Text>
      ) : null}

      <View className="gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isDeleting, busy: isDeleting }}
          disabled={isDeleting}
          onPress={confirmDeletion}
          className="h-12 items-center justify-center rounded-full active:opacity-80"
          style={{ backgroundColor: DANGER_RED, opacity: isDeleting ? 0.6 : 1 }}
        >
          <Text className="text-[15px] font-bold text-white">
            {isDeleting ? 'Suppression…' : 'Supprimer définitivement'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={isDeleting}
          onPress={onClose}
          className="items-center py-2"
        >
          <Text className="text-[14px]" style={{ color: GLASS_BODY_COLOR }}>
            Annuler
          </Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

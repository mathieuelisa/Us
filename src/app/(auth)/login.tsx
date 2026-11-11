import { Ionicons } from '@expo/vector-icons';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { IconInput } from '@/components/ui/icon-input';
import { PillButton } from '@/components/ui/pill-button';
import {
  getAuthErrorMessage,
  PASSWORD_MIN_LENGTH,
  sendPasswordReset,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from '@/features/auth/api';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassAtom } from '@/lib/atoms/dev-bypass';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

type Mode = 'signIn' | 'signUp';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Écran 1a — connexion et inscription (décision du 2026-11-11) : email +
 * mot de passe, ou Google. Remplace le lien magique, abandonné.
 *
 * Un seul écran pour les deux gestes, basculés par une gélule « Connexion /
 * Inscription » : mêmes champs, l'inscription ajoute la confirmation du mot
 * de passe. Google crée le compte s'il n'existe pas — un seul bouton pour
 * les deux modes.
 *
 * Aucune navigation ici : la session ouverte est captée par le layout
 * racine, qui route vers l'onboarding (pas encore de foyer) ou le hub. Si
 * Supabase exige la confirmation de l'email, aucune session n'est ouverte à
 * l'inscription : l'écran le dit et bascule sur « Connexion ».
 *
 * Le co-parent invité s'inscrit ici avec l'adresse saisie par le premier
 * parent : il est rattaché au foyer à sa première connexion, une fois son
 * email confirmé (`accept_household_invite()`).
 */
export default function LoginScreen() {
  const accent = useThemeAccent();
  const backgroundColor = useThemeBackground();
  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
  const setDevBypass = useSetAtom(devBypassAtom);

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const isSignUp = mode === 'signUp';
  const isBusy = isSubmitting || isGooglePending;
  const trimmedEmail = email.trim();
  const isEmailValid = EMAIL_PATTERN.test(trimmedEmail);
  const isPasswordLongEnough = password.length >= PASSWORD_MIN_LENGTH;
  const doPasswordsMatch = password === passwordConfirmation;

  const canSubmit =
    !isBusy &&
    isEmailValid &&
    password.length > 0 &&
    (!isSignUp || (isPasswordLongEnough && doPasswordsMatch));

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setInfoMessage(null);
    setPasswordConfirmation('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      if (isSignUp) {
        const { needsEmailConfirmation } = await signUpWithPassword(
          trimmedEmail,
          password,
        );
        if (needsEmailConfirmation) {
          setMode('signIn');
          setPassword('');
          setPasswordConfirmation('');
          setInfoMessage(
            'Compte créé ! Confirmez votre adresse avec le lien reçu par email, puis connectez-vous.',
          );
        }
      } else {
        await signInWithPassword(trimmedEmail, password);
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    if (!isEmailValid) {
      setErrorMessage(
        'Saisissez d’abord votre email ci-dessus pour recevoir le lien.',
      );
      return;
    }
    try {
      await sendPasswordReset(trimmedEmail);
      setInfoMessage(
        'Si un compte existe pour cet email, un lien de réinitialisation vient de partir. Il vous connecte : choisissez ensuite un nouveau mot de passe dans Réglages.',
      );
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  const handleGoogle = async () => {
    setIsGooglePending(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsGooglePending(false);
    }
  };

  const passwordHint =
    isSignUp && password.length > 0 && !isPasswordLongEnough
      ? `${PASSWORD_MIN_LENGTH} caractères minimum.`
      : isSignUp && passwordConfirmation.length > 0 && !doPasswordsMatch
        ? 'Les deux mots de passe ne correspondent pas.'
        : null;

  const eyeToggle = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isPasswordVisible
          ? 'Masquer le mot de passe'
          : 'Afficher le mot de passe'
      }
      hitSlop={10}
      onPress={() => setIsPasswordVisible((visible) => !visible)}
    >
      <Ionicons
        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        size={19}
        color="#a3a1b0"
      />
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="grow justify-center gap-5 px-7 py-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center gap-2">
            <Image
              source={require('@/assets/images/Father_feelings_mother.png')}
              className="h-56 w-56"
              resizeMode="contain"
            />
            <Text
              className="max-w-64 text-center text-[15px] leading-5"
              style={{ color: GLASS_BODY_COLOR }}
            >
              Votre bébé a son carnet de santé. Vous, vous avez US.
            </Text>
          </View>

          <ModeToggle mode={mode} accent={accent} onChange={switchMode} />

          <View className="gap-3">
            <IconInput
              icon="mail-outline"
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              accent={accent}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isBusy}
              returnKeyType="next"
            />
            <IconInput
              icon="lock-closed-outline"
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              accent={accent}
              secureTextEntry={!isPasswordVisible}
              autoCapitalize="none"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              textContentType={isSignUp ? 'newPassword' : 'password'}
              editable={!isBusy}
              returnKeyType={isSignUp ? 'next' : 'go'}
              onSubmitEditing={isSignUp ? undefined : handleSubmit}
              trailing={eyeToggle}
            />
            {isSignUp ? (
              <IconInput
                icon="shield-checkmark-outline"
                placeholder="Confirmer le mot de passe"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                accent={accent}
                isInvalid={passwordConfirmation.length > 0 && !doPasswordsMatch}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!isBusy}
                returnKeyType="go"
                onSubmitEditing={handleSubmit}
              />
            ) : null}

            {passwordHint ? (
              <Text className="px-2 text-[12.5px] text-[#c9553d]">
                {passwordHint}
              </Text>
            ) : null}

            {!isSignUp ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={handleForgotPassword}
                className="self-end px-2"
              >
                <Text
                  className="text-[13px] font-semibold"
                  style={{ color: accent }}
                >
                  Mot de passe oublié ?
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View className="gap-3">
            <PillButton
              label={
                isSubmitting
                  ? isSignUp
                    ? 'Création…'
                    : 'Connexion…'
                  : isSignUp
                    ? 'Créer mon compte'
                    : 'Se connecter'
              }
              icon={isSignUp ? 'person-add-outline' : 'log-in-outline'}
              isDisabled={!canSubmit}
              onPress={handleSubmit}
            />

            {errorMessage ? (
              <Text className="text-center text-[13px] leading-[18px] text-[#c9553d]">
                {errorMessage}
              </Text>
            ) : null}
            {infoMessage ? (
              <View
                className="flex-row items-start gap-2.5 rounded-[18px] px-3.5 py-3"
                style={{ backgroundColor: hexToRgba(accent, 0.1) }}
              >
                <Ionicons name="mail-unread-outline" size={18} color={accent} />
                <Text
                  className="flex-1 text-[13px] leading-[18px]"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  {infoMessage}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-black/10" />
            <Text className="text-[12.5px]" style={{ color: GLASS_BODY_COLOR }}>
              ou
            </Text>
            <View className="h-px flex-1 bg-black/10" />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isBusy }}
            disabled={isBusy}
            onPress={handleGoogle}
            className="h-14 flex-row items-center justify-center gap-3 rounded-full bg-white active:opacity-70"
            style={{
              opacity: isBusy ? 0.5 : 1,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.06)',
              shadowColor: accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 3,
            }}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text
              className="text-[15.5px] font-semibold"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              {isGooglePending
                ? 'Ouverture de Google…'
                : 'Continuer avec Google'}
            </Text>
          </Pressable>

          {/* ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts. Absent des
              builds de production. */}
          {__DEV__ ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setDevBypass('onboarding')}
              className="mt-2 items-center rounded-xl border border-dashed border-[#d0d0d0] py-3"
            >
              <Text className="text-[13px] font-medium text-[#9a9a9a]">
                DEV — passer à l’onboarding sans connexion
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Gélule « Connexion / Inscription » : le mode actif se remplit d'accent. */
function ModeToggle({
  mode,
  accent,
  onChange,
}: {
  mode: Mode;
  accent: string;
  onChange: (mode: Mode) => void;
}) {
  const options: { value: Mode; label: string }[] = [
    { value: 'signIn', label: 'Connexion' },
    { value: 'signUp', label: 'Inscription' },
  ];

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-full p-1"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}
    >
      {options.map((option) => {
        const isActive = option.value === mode;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            className="h-11 flex-1 items-center justify-center rounded-full"
            style={{ backgroundColor: isActive ? accent : 'transparent' }}
          >
            <Text
              className="text-[15px] font-semibold"
              style={{ color: isActive ? '#ffffff' : GLASS_BODY_COLOR }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

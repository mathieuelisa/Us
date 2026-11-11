import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { PlainInput } from '@/components/plain-input';
import {
  FeedbackBanner,
  type FeedbackBannerTone,
} from '@/components/ui/feedback-banner';
import { PillButton } from '@/components/ui/pill-button';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useMyProfile, useUpdateMyProfile } from '@/features/profile/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassFirstNameAtom } from '@/lib/atoms/dev-bypass';
import { sessionAtom } from '@/lib/atoms/session';

const SafeAreaView = withUniwind(RNSafeAreaView);

/** Durée d'affichage du bandeau de confirmation et de « Enregistré ». */
const FEEDBACK_DURATION_MS = 2500;

/**
 * Onglet « Profil ». Enregistrer le prénom confirme visiblement le résultat
 * (demande explicite) : bandeau « Prénom mis à jour » en haut de l'écran et
 * bouton « Enregistré » pendant 2,5 s, ou bandeau d'erreur en rouge en cas
 * d'échec. Pas de redirection vers l'accueil (choix explicite) : on reste
 * sur l'écran, l'initiale de l'avatar et la salutation du hub suivent
 * d'elles-mêmes.
 */
export default function ProfileScreen() {
  const session = useAtomValue(sessionAtom);
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  const [feedback, setFeedback] = useState<{
    tone: FeedbackBannerTone;
    message: string;
  } | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    },
    [],
  );

  const showFeedback = (tone: FeedbackBannerTone, message: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setFeedback({ tone, message });
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimeoutRef.current = null;
    }, FEEDBACK_DURATION_MS);
  };

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts. Sans utilisateur
  // réel, `useMyProfile()` ne renvoie rien : on reprend le prénom saisi à
  // l'onboarding, comme la salutation du hub.
  const devBypassFirstName = useAtomValue(devBypassFirstNameAtom);
  const savedFirstName = profile?.first_name || devBypassFirstName;

  const [firstName, setFirstName] = useState(savedFirstName);

  useEffect(() => {
    setFirstName(savedFirstName);
  }, [savedFirstName]);

  const initials = (savedFirstName || '?').trim().charAt(0).toUpperCase();
  const hasChanges = firstName.trim() !== savedFirstName.trim();
  const justSaved = feedback?.tone === 'success';

  const save = () => {
    if (!hasChanges || updateProfile.isPending || firstName.trim() === '') {
      return;
    }
    updateProfile.mutate(firstName.trim(), {
      onSuccess: () => showFeedback('success', 'Prénom mis à jour'),
      onError: () =>
        showFeedback(
          'error',
          'Impossible d’enregistrer votre prénom. Réessayez.',
        ),
    });
  };

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <View className="flex-1 gap-6 px-6 pt-4">
        <Text className="text-[26px] font-bold text-[#1a1a1a]">Mon profil</Text>

        <View className="items-center gap-2">
          {/* `Avatar` (Hero UI Native) n'a jamais reçu ses variables
              --default/--surface pour nos 4 thèmes custom — même famille de
              bug que les champs de saisie, cf. `PlainInput`. Cercle maison
              en attendant une vraie photo. */}
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Text className="text-[22px] font-bold text-accent-foreground">
              {initials}
            </Text>
          </View>
          <Text className="text-[12.5px] text-[#9a9a9a]">
            Photo de profil — bientôt disponible
          </Text>
        </View>

        <View className="gap-3.5">
          <Text className="text-[13px] font-medium text-[#6b6b6b]">
            Prénom affiché
          </Text>
          <PlainInput
            placeholder="Votre prénom"
            value={firstName}
            onChangeText={setFirstName}
            editable={!isLoading}
            autoCapitalize="words"
          />

          {/* « Enregistré » reste pleinement visible (pas grisé) le temps de
              la confirmation, puis le bouton reprend son état normal. */}
          <PillButton
            label={
              updateProfile.isPending
                ? 'Enregistrement…'
                : justSaved && !hasChanges
                  ? 'Enregistré'
                  : 'Enregistrer'
            }
            icon={
              justSaved && !hasChanges ? 'checkmark-circle' : 'save-outline'
            }
            isDisabled={
              !(justSaved && !hasChanges) &&
              (!hasChanges ||
                updateProfile.isPending ||
                firstName.trim() === '')
            }
            onPress={save}
          />
        </View>

        <View className="gap-1">
          <Text className="text-[13px] font-medium text-[#6b6b6b]">Email</Text>
          <Text className="text-[15px] text-[#1a1a1a]">
            {session?.user.email}
          </Text>
        </View>
      </View>

      <FeedbackBanner
        message={feedback?.message ?? null}
        tone={feedback?.tone}
        accent={accent}
      />
    </SafeAreaView>
  );
}

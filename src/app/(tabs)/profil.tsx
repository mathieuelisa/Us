import { Ionicons } from '@expo/vector-icons';
import { useAtomValue } from 'jotai';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import {
  FeedbackBanner,
  useFeedbackBanner,
} from '@/components/ui/feedback-banner';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useMyProfile, useUpdateMyProfile } from '@/features/profile/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassFirstNameAtom } from '@/lib/atoms/dev-bypass';
import { sessionAtom } from '@/lib/atoms/session';
import { hexToRgba, lightenHex } from '@/lib/color';
import { NO_WEB_FOCUS_OUTLINE } from '@/lib/web-styles';

const SafeAreaView = withUniwind(RNSafeAreaView);

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Onglet « Profil ».
 *
 * Habillage d'après une capture de référence (demande explicite, « plus
 * design et moderne ») : grand titre et sous-titre, avatar en grand rond
 * d'accent cerclé d'un halo et surmonté de petits traits, informations dans
 * une carte blanche à lignes (tuile d'icône, libellé, valeur), bouton
 * « Enregistrer » en gélule. Trois écarts assumés avec la capture :
 * - pas de bouton retour : c'est un onglet racine, comme Réglages ;
 * - pas de chevrons : le prénom se modifie directement dans sa ligne (un
 *   crayon l'indique) et l'email n'ouvre aucun écran — une flèche promettrait
 *   une navigation qui n'existe pas ;
 * - pas d'appareil photo sur l'avatar : le choix de la photo viendra plus
 *   tard (demande explicite).
 *
 * Enregistrer confirme visiblement le résultat : bandeau « Prénom mis à
 * jour » et bouton « Enregistré » pendant 2,5 s, ou bandeau d'erreur rouge.
 * Pas de redirection vers l'accueil (choix explicite).
 */
export default function ProfileScreen() {
  const session = useAtomValue(sessionAtom);
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  const { feedback, showFeedback } = useFeedbackBanner();

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts. Sans utilisateur
  // réel, `useMyProfile()` ne renvoie rien : on reprend le prénom saisi à
  // l'onboarding, comme la salutation du hub.
  const devBypassFirstName = useAtomValue(devBypassFirstNameAtom);
  const savedFirstName = profile?.first_name || devBypassFirstName;

  const [firstName, setFirstName] = useState(savedFirstName);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setFirstName(savedFirstName);
  }, [savedFirstName]);

  const initials = (savedFirstName || '?').trim().charAt(0).toUpperCase();
  const hasChanges = firstName.trim() !== savedFirstName.trim();
  const justSaved = feedback?.tone === 'success' && !hasChanges;

  const save = () => {
    if (!hasChanges || updateProfile.isPending || firstName.trim() === '') {
      return;
    }
    updateProfile.mutate(firstName.trim(), {
      onSuccess: () => {
        nameInputRef.current?.blur();
        showFeedback('success', 'Prénom mis à jour');
      },
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

      <ScrollView
        contentContainerClassName="gap-7 px-6 pb-8 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1.5">
          <Text
            className="text-[32px] font-extrabold leading-[38px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.7 }}
          >
            Mon profil
          </Text>
          <Text className="text-[15px]" style={{ color: GLASS_BODY_COLOR }}>
            Gérez vos informations personnelles.
          </Text>
          {/* Même trait dessiné que sous l'en-tête de Réglages. */}
          <Svg width={110} height={12} viewBox="0 0 110 12">
            <Path
              d="M4 8 C 32 3, 74 2, 106 5"
              stroke={hexToRgba(accent, 0.5)}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>

        <View className="items-center gap-3">
          <ProfileAvatar initials={initials} accent={accent} />
          <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
            Photo de profil — bientôt disponible
          </Text>
        </View>

        <View
          className="overflow-hidden rounded-[28px]"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.95)',
            shadowColor: accent,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.1,
            shadowRadius: 22,
            elevation: 4,
          }}
        >
          <Pressable
            accessibilityLabel="Modifier le prénom affiché"
            onPress={() => nameInputRef.current?.focus()}
            className="flex-row items-center gap-3.5 px-4 py-4"
            style={{
              backgroundColor: isEditingName
                ? hexToRgba(accent, 0.05)
                : 'transparent',
            }}
          >
            <InfoTile icon="person-outline" accent={accent} />
            <View className="flex-1 gap-0.5">
              <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
                Prénom affiché
              </Text>
              <TextInput
                ref={nameInputRef}
                accessibilityLabel="Prénom affiché"
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setIsEditingName(true)}
                onBlur={() => setIsEditingName(false)}
                onSubmitEditing={save}
                returnKeyType="done"
                editable={!isLoading}
                autoCapitalize="words"
                placeholder="Votre prénom"
                placeholderTextColor="#a3a1b0"
                className="text-[17px] font-bold"
                // Pas de contour de focus du navigateur (web) : la ligne
                // entière se teinte déjà quand le champ est actif.
                style={[
                  { color: GLASS_TITLE_COLOR, paddingVertical: 0 },
                  NO_WEB_FOCUS_OUTLINE,
                ]}
              />
            </View>
            <Ionicons
              name={isEditingName ? 'create' : 'create-outline'}
              size={20}
              color={isEditingName ? accent : '#a8a8b3'}
            />
          </Pressable>

          <View className="mx-4 h-px bg-black/5" />

          <View className="flex-row items-center gap-3.5 px-4 py-4">
            <InfoTile icon="mail-outline" accent={accent} />
            <View className="flex-1 gap-0.5">
              <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
                Email
              </Text>
              <Text
                className="text-[17px] font-bold"
                style={{ color: GLASS_TITLE_COLOR }}
                numberOfLines={1}
              >
                {session?.user.email ?? '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* « Enregistré » reste pleinement visible (pas grisé) le temps de
            la confirmation, puis le bouton reprend son état normal. */}
        <PillButton
          label={
            updateProfile.isPending
              ? 'Enregistrement…'
              : justSaved
                ? 'Enregistré'
                : 'Enregistrer'
          }
          icon={justSaved ? 'checkmark-circle' : 'save-outline'}
          isDisabled={
            !justSaved &&
            (!hasChanges || updateProfile.isPending || firstName.trim() === '')
          }
          onPress={save}
        />
      </ScrollView>

      <FeedbackBanner
        message={feedback?.message ?? null}
        tone={feedback?.tone}
        accent={accent}
      />
    </SafeAreaView>
  );
}

/**
 * Avatar : initiale blanche sur un grand rond d'accent, cerclé d'un halo
 * clair et surmonté de petits traits (même vocabulaire que la barre
 * d'onglets). En attendant une vraie photo — `Avatar` de Hero UI Native n'a
 * jamais reçu ses variables pour nos thèmes custom.
 */
function ProfileAvatar({
  initials,
  accent,
}: {
  initials: string;
  accent: string;
}) {
  return (
    <View className="h-[156px] w-[156px] items-center justify-center">
      <View
        className="absolute h-[156px] w-[156px] rounded-full"
        style={{ backgroundColor: hexToRgba(accent, 0.1) }}
      />
      <View
        className="h-[132px] w-[132px] items-center justify-center rounded-full"
        style={{
          backgroundColor: accent,
          borderWidth: 4,
          borderColor: lightenHex(accent, 0.75),
          shadowColor: accent,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.28,
          shadowRadius: 22,
          elevation: 8,
        }}
      >
        <Text
          className="text-[54px] font-extrabold text-white"
          style={{ letterSpacing: -1 }}
        >
          {initials}
        </Text>
      </View>
      <SparkLines
        color={hexToRgba(accent, 0.75)}
        style={{ top: -6, right: 0, transform: [{ scale: 1.3 }] }}
      />
    </View>
  );
}

/** Tuile d'icône teintée d'accent, en tête de chaque ligne d'information. */
function InfoTile({ icon, accent }: { icon: IoniconName; accent: string }) {
  return (
    <View
      className="h-12 w-12 items-center justify-center rounded-2xl"
      style={{ backgroundColor: hexToRgba(accent, 0.1) }}
    >
      <Ionicons name={icon} size={22} color={accent} />
    </View>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { useAtomValue } from 'jotai';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';
import { useTabBarContentInset } from '@/components/navigation/use-tab-bar-height';
import { AvatarPickerModal } from '@/components/profile/avatar-picker-modal';
import { DueDateSheet } from '@/components/profile/due-date-sheet';
import {
  FeedbackBanner,
  useFeedbackBanner,
} from '@/components/ui/feedback-banner';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { KeyboardScrollView } from '@/components/ui/keyboard-scroll-view';
import { PillButton } from '@/components/ui/pill-button';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { getWeeksOfAmenorrhea } from '@/features/health/constants';
import { useMyHousehold, useUpdateDueDate } from '@/features/household/hooks';
import { getProfileAvatar } from '@/features/profile/avatars';
import {
  useMyProfile,
  useUpdateMyAvatar,
  useUpdateMyProfile,
} from '@/features/profile/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { useLocale } from '@/i18n/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';
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
 * - pas d'appareil photo sur l'avatar : on y choisit un avatar simple
 *   dans une modale (`AvatarPickerModal`, demande explicite du
 *   2026-11-14), la photo viendra plus tard.
 *
 * Enregistrer confirme visiblement le résultat : bandeau « Prénom mis à
 * jour » et bouton « Enregistré » pendant 2,5 s, ou bandeau d'erreur rouge.
 * Pas de redirection vers l'accueil (choix explicite).
 *
 * « Date du terme » (demande explicite) : la personne enceinte peut
 * corriger celle saisie à l'onboarding, dans une feuille à molette
 * (`DueDateSheet`). Pas pour le co-parent, qui la voit sans la modifier
 * ailleurs dans l'app, ni une fois la naissance déclarée (le terme ne sert
 * plus).
 */
export default function ProfileScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const session = useAtomValue(sessionAtom);
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const updateAvatar = useUpdateMyAvatar();
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<'name' | 'avatar' | null>(null);
  const avatarKey = profile?.avatar ?? null;
  const { data: household } = useMyHousehold();
  const updateDueDate = useUpdateDueDate(household);
  const role = useAtomValue(currentRoleAtom);
  const [isDueDateOpen, setIsDueDateOpen] = useState(false);
  const dueDate = household?.due_date ?? null;
  const canEditDueDate =
    role === 'pregnant' && Boolean(household) && !household?.birth_date;
  const dueDateWeeks = getWeeksOfAmenorrhea(dueDate);

  const saveDueDate = (nextDueDate: string) => {
    updateDueDate.mutate(nextDueDate, {
      onSuccess: () => {
        setIsDueDateOpen(false);
        showFeedback('success', t('profile.dueDateUpdated'));
      },
      onError: () => showFeedback('error', t('profile.dueDateError')),
    });
  };

  const chooseAvatar = (avatar: string | null) => {
    if (avatar === avatarKey) {
      setIsAvatarPickerOpen(false);
      return;
    }
    updateAvatar.mutate(avatar, {
      onSuccess: () => {
        setLastSaved('avatar');
        setIsAvatarPickerOpen(false);
        showFeedback('success', t('profile.avatarUpdated'));
      },
      onError: () => showFeedback('error', t('profile.avatarError')),
    });
  };
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  const { feedback, showFeedback } = useFeedbackBanner();

  const savedFirstName = profile?.first_name ?? '';

  const [firstName, setFirstName] = useState(savedFirstName);
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setFirstName(savedFirstName);
  }, [savedFirstName]);

  const initials = (savedFirstName || '?').trim().charAt(0).toUpperCase();
  const hasChanges = firstName.trim() !== savedFirstName.trim();
  // « Enregistré » sur le bouton ne concerne que le prénom, pas l'avatar.
  const justSaved =
    feedback?.tone === 'success' && lastSaved === 'name' && !hasChanges;

  const save = () => {
    if (!hasChanges || updateProfile.isPending || firstName.trim() === '') {
      return;
    }
    const newFirstName = firstName.trim();
    updateProfile.mutate(newFirstName, {
      onSuccess: () => {
        setLastSaved('name');
        nameInputRef.current?.blur();
        // Message plus chaleureux, avec le nouveau prénom (demande
        // explicite).
        showFeedback(
          'success',
          t('profile.nameUpdated', { name: newFirstName }),
        );
      },
      onError: () => showFeedback('error', t('profile.nameError')),
    });
  };

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <KeyboardScrollView
        contentContainerClassName="gap-7 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1.5">
          <Text
            className="text-[32px] font-extrabold leading-[38px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.7 }}
          >
            {t('profile.title')}
          </Text>
          <Text className="text-[15px]" style={{ color: GLASS_BODY_COLOR }}>
            {t('profile.subtitle')}
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
          <ProfileAvatar
            initials={initials}
            avatarKey={avatarKey}
            accent={accent}
            onPress={() => setIsAvatarPickerOpen(true)}
          />
          <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
            {t('profile.tapToChooseAvatar')}
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
            accessibilityLabel={t('profile.editDisplayedName')}
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
                {t('profile.displayedName')}
              </Text>
              <TextInput
                ref={nameInputRef}
                accessibilityLabel={t('profile.displayedName')}
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setIsEditingName(true)}
                onBlur={() => setIsEditingName(false)}
                onSubmitEditing={save}
                returnKeyType="done"
                editable={!isLoading}
                autoCapitalize="words"
                placeholder={t('profile.yourFirstName')}
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
                {t('profile.email')}
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

          {canEditDueDate ? (
            <>
              <View className="mx-4 h-px bg-black/5" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  dueDate
                    ? t('profile.editDueDateCurrent', {
                        date: formatDueDate(dueDate, locale),
                      })
                    : t('profile.editDueDate')
                }
                onPress={() => setIsDueDateOpen(true)}
                className="flex-row items-center gap-3.5 px-4 py-4 active:opacity-70"
              >
                <InfoTile icon="calendar-outline" accent={accent} />
                <View className="flex-1 gap-0.5">
                  <Text
                    className="text-[13px]"
                    style={{ color: GLASS_BODY_COLOR }}
                  >
                    {t('profile.dueDate')}
                  </Text>
                  <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
                    <Text
                      className="text-[17px] font-bold"
                      style={{ color: GLASS_TITLE_COLOR }}
                    >
                      {dueDate
                        ? formatDueDate(dueDate, locale)
                        : t('profile.toFill')}
                    </Text>
                    {dueDateWeeks !== null ? (
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: hexToRgba(accent, 0.1) }}
                      >
                        <Text
                          className="text-[11.5px] font-bold"
                          style={{ color: accent }}
                        >
                          {dueDateWeeks} SA
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Ionicons name="create-outline" size={20} color="#a8a8b3" />
              </Pressable>
            </>
          ) : null}
        </View>

        {/* « Enregistré » reste pleinement visible (pas grisé) le temps de
            la confirmation, puis le bouton reprend son état normal. */}
        <PillButton
          label={
            updateProfile.isPending
              ? t('profile.saving')
              : justSaved
                ? t('profile.saved')
                : t('profile.save')
          }
          icon={justSaved ? 'checkmark-circle' : 'save-outline'}
          isDisabled={
            !justSaved &&
            (!hasChanges || updateProfile.isPending || firstName.trim() === '')
          }
          onPress={save}
        />
      </KeyboardScrollView>

      <AvatarPickerModal
        visible={isAvatarPickerOpen}
        accent={accent}
        initials={initials}
        selected={avatarKey}
        isSaving={updateAvatar.isPending}
        onSelect={chooseAvatar}
        onClose={() => setIsAvatarPickerOpen(false)}
      />

      <DueDateSheet
        visible={isDueDateOpen}
        dueDate={dueDate}
        accent={accent}
        isSaving={updateDueDate.isPending}
        onSave={saveDueDate}
        onClose={() => setIsDueDateOpen(false)}
      />

      <FeedbackBanner
        message={feedback?.message ?? null}
        tone={feedback?.tone}
        accent={accent}
      />
    </SafeAreaView>
  );
}

/**
 * Avatar : l'animal choisi sur son rond pastel, ou à défaut l'initiale
 * blanche sur un grand rond d'accent — cerclé d'un halo clair et surmonté
 * de petits traits (même vocabulaire que la barre d'onglets). Le toucher
 * ouvre le choix d'avatar (demande explicite), un crayon l'indique.
 * `Avatar` de Hero UI Native n'a jamais reçu ses variables pour nos thèmes
 * custom.
 */
function ProfileAvatar({
  initials,
  avatarKey,
  accent,
  onPress,
}: {
  initials: string;
  avatarKey: string | null;
  accent: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const avatar = getProfileAvatar(avatarKey);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        avatar
          ? t('profile.changeAvatarCurrent', { avatar: t(avatar.label) })
          : t('profile.changeAvatar')
      }
      onPress={onPress}
      className="h-[156px] w-[156px] items-center justify-center active:opacity-85"
    >
      <View
        className="absolute h-[156px] w-[156px] rounded-full"
        style={{ backgroundColor: hexToRgba(accent, 0.1) }}
      />
      <View
        className="h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-full"
        style={{
          backgroundColor: avatar ? avatar.bg : accent,
          borderWidth: 4,
          borderColor: lightenHex(accent, 0.75),
          shadowColor: accent,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.28,
          shadowRadius: 22,
          elevation: 8,
        }}
      >
        {avatar ? (
          <Image
            source={avatar.image}
            style={{ width: 124, height: 124, borderRadius: 62 }}
            resizeMode="cover"
          />
        ) : (
          <Text
            className="text-[54px] font-extrabold text-white"
            style={{ letterSpacing: -1 }}
          >
            {initials}
          </Text>
        )}
      </View>
      <View
        className="absolute h-10 w-10 items-center justify-center rounded-full bg-white"
        style={{
          right: 10,
          bottom: 12,
          shadowColor: accent,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Ionicons name="pencil" size={17} color={accent} />
      </View>
      <SparkLines
        color={hexToRgba(accent, 0.75)}
        style={{ top: -6, right: 0, transform: [{ scale: 1.3 }] }}
      />
    </Pressable>
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

/** « 15 juin 2027 ». */
function formatDueDate(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

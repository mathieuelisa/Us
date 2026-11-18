import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { type ComponentProps, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Uniwind, useUniwind, withUniwind } from 'uniwind';
import { useTabBarContentInset } from '@/components/navigation/use-tab-bar-height';
import {
  ChangePasswordModal,
  DeleteAccountModal,
} from '@/components/settings/account-modals';
import { LanguageSheet } from '@/components/settings/language-sheet';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { ShareAppCard } from '@/components/settings/share-app-card';
import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  GlassCard,
  SparkLines,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { signOut } from '@/features/auth/api';
import { useIsSoloHousehold } from '@/features/household/hooks';
import {
  useUpdateMyLanguage,
  useUpdateMyTheme,
} from '@/features/profile/hooks';
import {
  resolveThemeId,
  THEME_OPTIONS,
  type ThemeId,
} from '@/features/settings/constants';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { homeTourReplayAtom } from '@/features/tour/targets';
import { setAppLanguage } from '@/i18n';
import { useAppLanguage } from '@/i18n/hooks';
import { type AppLanguage, LANGUAGE_OPTIONS } from '@/i18n/languages';
import { currentRoleAtom } from '@/lib/atoms/role';
import { sessionAtom } from '@/lib/atoms/session';
import { hexToRgba, lightenHex } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Sous-section CONFIDENTIALITÉ — les 3 documents légaux n'existent pas
 * encore (cf. `legal.tsx`, point bloquant n°3 de
 * DOCS/05-DETTE-ET-POINTS-OUVERTS.md) ; ces liens ouvrent un écran qui le
 * dit franchement plutôt qu'un contenu inventé.
 */
const LEGAL_LINKS = [
  {
    doc: 'privacy',
    labelKey: 'settings.privacy.privacyPolicy',
    icon: 'lock-closed-outline',
  },
  {
    doc: 'terms',
    labelKey: 'settings.privacy.terms',
    icon: 'document-text-outline',
  },
  {
    doc: 'legal-notice',
    labelKey: 'settings.privacy.legalNotice',
    icon: 'chatbubbles-outline',
  },
] as const satisfies readonly {
  doc: string;
  labelKey: string;
  icon: IoniconName;
}[];

/**
 * Écran 10a — Réglages. Périmètre strict du plan d'action §1.7 : personnels
 * et non partagés (déjà garanti par la RLS `profiles_update_own`, juste
 * rappelé ici), 3-4 thèmes visuels prédéfinis.
 *
 * **Langue** (2026-11-18, demande explicite, en avance sur la V2) :
 * français, anglais ou espagnol, dans une feuille basse. Appliquée tout
 * de suite (`setAppLanguage`), puis enregistrée dans le profil.
 *
 * Section **Compte** (ajout du 2026-11-11, avec le passage à la connexion
 * par mot de passe) : email de connexion et moyen utilisé, changement de mot
 * de passe pour les comptes email, suppression du compte (Edge Function
 * `delete-account`, obligatoire pour l'App Store). Section **Notifications**
 * (2026-11-15) : un interrupteur par type (`NotificationSettings`). Le reste
 * de la maquette 10a (aide & support, export de données) reste hors
 * périmètre.
 *
 * ⚠️ Distinct du « Thème sombre » + « Couleur d'accent » de la maquette :
 * ce mécanisme-là est explicitement hors MVP. Ici, un choix fermé de 4
 * palettes nommées (voir `features/settings/constants.ts`), pas un
 * sélecteur clair/sombre ni une roue de couleur libre.
 *
 * Habillage d'après une capture de référence (demande explicite) : titre
 * souligné et bouclier-cadenas en en-tête, thèmes dans une carte blanche,
 * liens légaux en cartes à tuile d'icône, déconnexion en gélule contour.
 * Pas de bouton retour malgré la capture : c'est un onglet racine.
 */
export default function SettingsScreen() {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const updateLanguage = useUpdateMyLanguage();
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const requestHomeTour = useSetAtom(homeTourReplayAtom);
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const session = useAtomValue(sessionAtom);
  const { theme: activeTheme } = useUniwind();
  const updateTheme = useUpdateMyTheme();
  const backgroundColor = useThemeBackground();
  // Espace « Seul·e » : pas de mention du partenaire (demande explicite).
  const isSolo = useIsSoloHousehold();
  const accent = useThemeAccent();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isPregnant =
    (useAtomValue(currentRoleAtom) ?? 'pregnant') === 'pregnant';

  // Un compte Google n'a pas de mot de passe chez nous : pas de
  // changement possible. `providers` liste tous les moyens rattachés.
  const user = session?.user ?? null;
  const providers = (user?.app_metadata.providers as string[] | undefined) ?? [
    user?.app_metadata.provider ?? 'email',
  ];
  const hasPassword = providers.includes('email');
  const isGoogle = providers.includes('google');

  const selectedThemeId = resolveThemeId(activeTheme);

  // Le changement est instantané côté client (Uniwind re-thème toute l'app,
  // pas seulement cet écran) ; l'écriture Supabase ne sert qu'à faire
  // survivre le choix à une reconnexion, sans bloquer l'affichage dessus.
  const selectTheme = (id: ThemeId) => {
    Uniwind.setTheme(id);
    if (session?.user.id) {
      updateTheme.mutate(id);
    }
  };

  const selectLanguage = (next: AppLanguage) => {
    setIsLanguageSheetOpen(false);
    setAppLanguage(next);
    if (session?.user.id) {
      updateLanguage.mutate(next);
    }
  };
  const languageLabel =
    LANGUAGE_OPTIONS.find((option) => option.id === language)?.label ?? '';

  // Hors ligne, `signOut()` se rabat sur une déconnexion locale. Le
  // nettoyage du cache suit le changement de compte (`useApplySession`,
  // layout racine).
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-6 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ShieldIllustration accent={accent} />

          <View className="mt-10 gap-1.5" style={{ maxWidth: '68%' }}>
            <Text
              className="text-[30px] font-extrabold leading-9"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
            >
              {t('settings.title')}
            </Text>
            <Text
              className="text-[14px] leading-5"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {isSolo ? t('settings.subtitleSolo') : t('settings.subtitle')}
            </Text>
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
        </View>

        <View className="gap-3.5">
          <SectionTitle
            icon="person-circle-outline"
            label={t('settings.account.section')}
            accent={accent}
          />
          <View
            className="overflow-hidden rounded-[24px]"
            style={[
              tintedShadow(accent),
              {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.95)',
              },
            ]}
          >
            <View className="flex-row items-center gap-3.5 px-3.5 py-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: hexToRgba(accent, 0.1) }}
              >
                <Ionicons
                  name={
                    isGoogle && !hasPassword ? 'logo-google' : 'mail-outline'
                  }
                  size={20}
                  color={accent}
                />
              </View>
              <View className="flex-1 gap-0.5">
                <Text
                  className="text-[15px] font-semibold"
                  style={{ color: GLASS_TITLE_COLOR }}
                  numberOfLines={1}
                >
                  {user?.email ?? t('settings.account.noAccount')}
                </Text>
                <Text
                  className="text-[12.5px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {!user
                    ? t('settings.account.signInToManage')
                    : isGoogle && hasPassword
                      ? t('settings.account.viaGoogleOrPassword')
                      : isGoogle
                        ? t('settings.account.viaGoogle')
                        : t('settings.account.viaPassword')}
                </Text>
              </View>
            </View>

            {user && hasPassword ? (
              <AccountRow
                icon="key-outline"
                label={t('settings.account.changePassword')}
                accent={accent}
                onPress={() => setIsPasswordModalOpen(true)}
              />
            ) : null}
          </View>
        </View>

        <View className="gap-3.5">
          <SectionTitle
            icon="notifications-outline"
            label={t('settings.notifications.section')}
            accent={accent}
          />
          <NotificationSettings
            accent={accent}
            isSolo={isSolo}
            cardStyle={[
              tintedShadow(accent),
              {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.95)',
              },
            ]}
          />
        </View>

        <View
          className="gap-5 overflow-hidden rounded-[28px] px-5 pb-5 pt-4"
          style={[
            tintedShadow(accent),
            {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.95)',
            },
          ]}
        >
          {/* Tache décorative à droite de la carte. */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -50,
              top: 40,
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: hexToRgba(accent, 0.07),
            }}
          />
          <SectionTitle
            icon="color-palette-outline"
            label={t('settings.appearance.section')}
            accent={accent}
          />

          <View className="flex-row justify-between pr-6">
            {THEME_OPTIONS.map((option) => (
              <ThemeSwatch
                key={option.id}
                label={t(`settings.appearance.themes.${option.id}`)}
                color={option.accent}
                isSelected={option.id === selectedThemeId}
                onPress={() => selectTheme(option.id)}
              />
            ))}
          </View>
        </View>

        <GlassCard
          accessibilityLabel={t('settings.language.a11y', {
            value: languageLabel,
          })}
          accent={accent}
          onPress={() => setIsLanguageSheetOpen(true)}
        >
          <View className="flex-row items-center gap-3.5 px-3.5 py-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: hexToRgba(accent, 0.1) }}
            >
              <Ionicons name="globe-outline" size={22} color={accent} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text
                className="text-[15.5px] font-medium"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {t('settings.language.label')}
              </Text>
              <Text
                className="text-[12.5px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {languageLabel}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a8a8b3" />
          </View>
        </GlassCard>

        {/* Relance la visite guidée de l'accueil (demande explicite). */}
        <GlassCard
          accessibilityLabel={t('settings.tour.a11y')}
          accent={accent}
          onPress={() => {
            router.navigate('/');
            requestHomeTour((count) => count + 1);
          }}
        >
          <View className="flex-row items-center gap-3.5 px-3.5 py-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: hexToRgba(accent, 0.1) }}
            >
              <Ionicons name="compass-outline" size={22} color={accent} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text
                className="text-[15.5px] font-medium"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {t('settings.tour.label')}
              </Text>
              <Text
                className="text-[12.5px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {t('settings.tour.hint')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#a8a8b3" />
          </View>
        </GlassCard>

        <ShareAppCard
          accent={accent}
          cardStyle={[
            tintedShadow(accent),
            {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.95)',
            },
          ]}
        />

        <View className="gap-3.5">
          <SectionTitle
            icon="shield-checkmark"
            label={t('settings.privacy.section')}
            accent={accent}
          />
          <View className="gap-3">
            {LEGAL_LINKS.map((link) => (
              <GlassCard
                key={link.doc}
                accessibilityLabel={t(link.labelKey)}
                accent={accent}
                onPress={() => router.push(`/legal?doc=${link.doc}`)}
              >
                <View className="flex-row items-center gap-3.5 px-3.5 py-3">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: hexToRgba(accent, 0.1) }}
                  >
                    <Ionicons name={link.icon} size={21} color={accent} />
                  </View>
                  <Text
                    className="flex-1 text-[15.5px] font-medium"
                    style={{ color: GLASS_TITLE_COLOR }}
                  >
                    {t(link.labelKey)}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#a8a8b3" />
                </View>
              </GlassCard>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSigningOut }}
          disabled={isSigningOut}
          onPress={handleSignOut}
          className="mt-1 h-14 flex-row items-center justify-center gap-2.5 rounded-full active:opacity-70"
          style={{
            borderWidth: 1.5,
            borderColor: accent,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            opacity: isSigningOut ? 0.5 : 1,
          }}
        >
          <Ionicons name="log-out-outline" size={21} color={accent} />
          <Text
            className="text-[16.5px] font-semibold"
            style={{ color: accent }}
          >
            {isSigningOut
              ? t('settings.account.signingOut')
              : t('settings.account.signOut')}
          </Text>
        </Pressable>

        {user ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsDeleteModalOpen(true)}
            className="flex-row items-center justify-center gap-2 py-2 active:opacity-60"
          >
            <Ionicons name="trash-outline" size={17} color="#d14b3a" />
            <Text className="text-[14.5px] font-semibold text-[#d14b3a]">
              {t('settings.account.deleteAccount')}
            </Text>
          </Pressable>
        ) : null}

        <DashedLoopDoodle color={accent} />
      </ScrollView>

      <LanguageSheet
        visible={isLanguageSheetOpen}
        selected={language}
        accent={accent}
        onSelect={selectLanguage}
        onClose={() => setIsLanguageSheetOpen(false)}
      />
      <ChangePasswordModal
        visible={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <DeleteAccountModal
        visible={isDeleteModalOpen}
        isPregnant={isPregnant}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </SafeAreaView>
  );
}

/** Ligne d'action sous l'identité du compte, séparée par un filet. */
function AccountRow({
  icon,
  label,
  accent,
  onPress,
}: {
  icon: IoniconName;
  label: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-3.5 border-t border-black/5 px-3.5 py-3 active:opacity-70"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: hexToRgba(accent, 0.1) }}
      >
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text
        className="flex-1 text-[15.5px] font-medium"
        style={{ color: GLASS_TITLE_COLOR }}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#a8a8b3" />
    </Pressable>
  );
}

const tintedShadow = (accent: string) =>
  ({
    shadowColor: accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  }) as const;

/** Titre de section : icône dans un rond teinté, libellé en gras. */
function SectionTitle({
  icon,
  label,
  accent,
}: {
  icon: IoniconName;
  label: string;
  accent: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(accent, 0.12) }}
      >
        <Ionicons name={icon} size={22} color={accent} />
      </View>
      <Text
        className="text-[19px] font-bold"
        style={{ color: GLASS_TITLE_COLOR }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Pastille de thème. Choisie : anneau de sa propre couleur autour d'elle et
 * coche en bas à droite — l'état reste lisible même sans distinguer les
 * couleurs.
 */
function ThemeSwatch({
  label,
  color,
  isSelected,
  onPress,
}: {
  label: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('settings.appearance.themeLabel', { label })}
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      className="items-center gap-2"
    >
      <View
        className="h-[58px] w-[58px] items-center justify-center rounded-full"
        style={{
          borderWidth: 3,
          borderColor: isSelected ? color : 'transparent',
        }}
      >
        <View
          className="h-11 w-11 rounded-full"
          style={{
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        />
        {isSelected ? (
          <View
            className="absolute -bottom-0.5 -right-0.5 h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white"
            style={{ backgroundColor: color }}
          >
            <Ionicons name="checkmark" size={12} color="#ffffff" />
          </View>
        ) : null}
      </View>
      <Text
        className="text-[13px]"
        style={{
          color: isSelected ? GLASS_TITLE_COLOR : GLASS_BODY_COLOR,
          fontWeight: isSelected ? '700' : '400',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Bouclier-cadenas en haut à droite : rappelle que ces réglages sont
 * personnels. Composé d'icônes (aucune illustration de ce type dans les
 * assets), sur une tache d'accent, avec petits traits et cœur dessiné.
 */
function ShieldIllustration({ accent }: { accent: string }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 130,
        height: 130,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: 124,
          height: 124,
          borderRadius: 62,
          backgroundColor: hexToRgba(accent, 0.1),
        }}
      />
      <Ionicons
        name="shield"
        size={92}
        color={lightenHex(accent, 0.12)}
        style={{
          textShadowColor: hexToRgba(accent, 0.3),
          textShadowOffset: { width: 0, height: 6 },
          textShadowRadius: 12,
        }}
      />
      <Ionicons
        name="lock-closed"
        size={32}
        color="#ffffff"
        style={{ position: 'absolute', top: 44 }}
      />
      <SparkLines
        color={hexToRgba(accent, 0.7)}
        style={{ top: -6, right: -8 }}
      />
      <SparkLines
        color={hexToRgba(accent, 0.45)}
        style={{ top: 10, left: -30, transform: [{ rotate: '-80deg' }] }}
      />
      <Ionicons
        name="heart-outline"
        size={24}
        color={hexToRgba(accent, 0.5)}
        style={{
          position: 'absolute',
          bottom: -6,
          right: -4,
          transform: [{ rotate: '12deg' }],
        }}
      />
    </View>
  );
}

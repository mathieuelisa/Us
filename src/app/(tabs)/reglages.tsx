import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAtomValue, useSetAtom } from 'jotai';
import { type ComponentProps, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Uniwind, useUniwind, withUniwind } from 'uniwind';
import {
  ChangePasswordModal,
  DeleteAccountModal,
} from '@/components/settings/account-modals';
import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  GlassCard,
  SparkLines,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { signOut } from '@/features/auth/api';
import { useUpdateMyTheme } from '@/features/profile/hooks';
import {
  resolveThemeId,
  THEME_OPTIONS,
  type ThemeId,
} from '@/features/settings/constants';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassAtom, resetDevBypassAtom } from '@/lib/atoms/dev-bypass';
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
const LEGAL_LINKS: { doc: string; label: string; icon: IoniconName }[] = [
  {
    doc: 'privacy',
    label: 'Politique de confidentialité',
    icon: 'lock-closed-outline',
  },
  {
    doc: 'terms',
    label: "Conditions d'utilisation",
    icon: 'document-text-outline',
  },
  {
    doc: 'legal-notice',
    label: 'Mentions légales',
    icon: 'chatbubbles-outline',
  },
];

/**
 * Écran 10a — Réglages. Périmètre strict du plan d'action §1.7 : personnels
 * et non partagés (déjà garanti par la RLS `profiles_update_own`, juste
 * rappelé ici), 3-4 thèmes visuels prédéfinis, pas de sélecteur de langue.
 *
 * Section **Compte** (ajout du 2026-11-11, avec le passage à la connexion
 * par mot de passe) : email de connexion et moyen utilisé, changement de mot
 * de passe pour les comptes email, suppression du compte (Edge Function
 * `delete-account`, obligatoire pour l'App Store). Le reste de la maquette
 * 10a (notifications, aide & support, export de données) reste hors
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
  const session = useAtomValue(sessionAtom);
  const { theme: activeTheme } = useUniwind();
  const updateTheme = useUpdateMyTheme();
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();
  const [isSigningOut, setIsSigningOut] = useState(false);
  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
  const isDevBypass = useAtomValue(devBypassAtom) !== 'off';
  const resetDevBypass = useSetAtom(resetDevBypassAtom);
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
  // survivre le choix à une reconnexion, sans bloquer l'affichage dessus —
  // et n'a d'ailleurs aucun effet sans session réelle (mode contournement
  // DEV compris, où le thème reste malgré tout modifiable).
  const selectTheme = (id: ThemeId) => {
    Uniwind.setTheme(id);
    if (session?.user.id) {
      updateTheme.mutate(id);
    }
  };

  // Hors ligne, `signOut()` se rabat sur une déconnexion locale ; en mode
  // contournement DEV, il n'y a pas de session : on sort du mode à la place.
  // Le nettoyage du cache suit le changement de compte
  // (`useResetOnAccountChange`, layout racine).
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      if (isDevBypass) {
        resetDevBypass();
        return;
      }
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
        contentContainerClassName="gap-6 px-6 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <ShieldIllustration accent={accent} />

          <View className="mt-10 gap-1.5" style={{ maxWidth: '68%' }}>
            <Text
              className="text-[30px] font-extrabold leading-9"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
            >
              Réglages
            </Text>
            <Text
              className="text-[14px] leading-5"
              style={{ color: GLASS_BODY_COLOR }}
            >
              Personnels — non partagés avec votre co-parent.
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
            label="Compte"
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
                  {user?.email ?? 'Mode DEV — aucun compte connecté'}
                </Text>
                <Text
                  className="text-[12.5px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {!user
                    ? 'Connectez-vous pour gérer votre compte.'
                    : isGoogle && hasPassword
                      ? 'Connexion par Google ou mot de passe'
                      : isGoogle
                        ? 'Connexion avec Google'
                        : 'Connexion par email et mot de passe'}
                </Text>
              </View>
            </View>

            {user && hasPassword ? (
              <AccountRow
                icon="key-outline"
                label="Changer le mot de passe"
                accent={accent}
                onPress={() => setIsPasswordModalOpen(true)}
              />
            ) : null}
          </View>
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
            label="Apparence"
            accent={accent}
          />

          <View className="flex-row justify-between pr-6">
            {THEME_OPTIONS.map((option) => (
              <ThemeSwatch
                key={option.id}
                label={option.label}
                color={option.accent}
                isSelected={option.id === selectedThemeId}
                onPress={() => selectTheme(option.id)}
              />
            ))}
          </View>
        </View>

        <View
          className="flex-row items-center gap-3.5 rounded-[24px] px-3.5 py-3"
          style={{ backgroundColor: hexToRgba(accent, 0.08) }}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
            <Ionicons name="globe-outline" size={20} color={accent} />
          </View>
          <Text
            className="flex-1 text-[13px] leading-[18px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            L’application reste en français pour l’instant — pas de sélecteur de
            langue.
          </Text>
        </View>

        <View className="gap-3.5">
          <SectionTitle
            icon="shield-checkmark"
            label="Confidentialité"
            accent={accent}
          />
          <View className="gap-3">
            {LEGAL_LINKS.map((link) => (
              <GlassCard
                key={link.doc}
                accessibilityLabel={link.label}
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
                    {link.label}
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
            {isSigningOut ? 'Déconnexion…' : 'Se déconnecter'}
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
              Supprimer mon compte
            </Text>
          </Pressable>
        ) : null}

        <DashedLoopDoodle color={accent} />
      </ScrollView>

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Thème ${label}`}
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

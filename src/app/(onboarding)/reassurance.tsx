import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { type ComponentProps, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { PaywallModal } from '@/components/onboarding/paywall-modal';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { GLASS_BODY_COLOR } from '@/components/ui/glass-card';
import { shouldInvitePartner } from '@/features/onboarding/constants';
import { useThemeAccent } from '@/features/settings/hooks';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';
import { hexToRgba } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Écran 1y — réassurance sociale, hors parcours numéroté.
 *
 * Modernisé d'après une capture de référence (demande explicite) :
 * illustration au-dessus du titre, titre souligné, badge « Configuration
 * terminée » teinté, chiffres clés en cartes à pastille d'icône.
 */
export default function ReassuranceStep() {
  const draft = useAtomValue(onboardingDraftAtom);
  const accent = useThemeAccent();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  // Fermer le paywall (demande explicite : c'est une pop-up, pas une route)
  // continue exactement où l'ancienne route menait.
  const closePaywallAndContinue = () => {
    setIsPaywallOpen(false);
    const nextRoute = shouldInvitePartner(
      draft.accompanimentType,
      draft.partnerUsesApp,
    )
      ? '/invitation'
      : '/finalisation';
    router.push(nextRoute);
  };

  return (
    <>
      <OnboardingStepShell
        step={null}
        centered
        title="Vous avez fait le bon choix"
        subtitle="Des milliers de parents utilisent déjà US pour vivre cette étape sereinement"
        primaryLabel="Suivant"
        onPrimaryPress={() => setIsPaywallOpen(true)}
        hero={<PartyIllustration />}
      >
        <View className="items-center gap-5">
          <View
            className="flex-row items-center gap-2 rounded-full px-4 py-2"
            style={{ backgroundColor: hexToRgba(accent, 0.12) }}
          >
            <Ionicons name="checkmark-circle" size={20} color={accent} />
            <Text className="text-[14px] font-bold" style={{ color: accent }}>
              Configuration terminée
            </Text>
          </View>

          <View className="w-full flex-row gap-3">
            <StatCard
              icon="download-outline"
              iconColor={accent}
              iconTint={hexToRgba(accent, 0.12)}
              value="50 000 +"
              label="Téléchargements"
              accent={accent}
            />
            <StatCard
              icon="star"
              iconColor="#f2b84b"
              iconTint="#fdf3dc"
              value="4,8"
              label="Note moyenne"
              accent={accent}
            />
          </View>
        </View>
      </OnboardingStepShell>

      <PaywallModal visible={isPaywallOpen} onClose={closePaywallAndContinue} />
    </>
  );
}

/**
 * Famille d'oursons qui fait la fête, entourée de feuilles et de cœurs —
 * ouvre l'écran au-dessus du titre (capture de référence).
 */
function PartyIllustration() {
  const accent = useThemeAccent();
  return (
    <View className="items-center pb-2" pointerEvents="none">
      <View style={{ width: 300, height: 220 }}>
        <Ionicons
          name="leaf"
          size={46}
          color={hexToRgba(accent, 0.28)}
          style={{
            position: 'absolute',
            left: 4,
            bottom: 18,
            transform: [{ rotate: '-35deg' }],
          }}
        />
        <Ionicons
          name="leaf"
          size={46}
          color={hexToRgba(accent, 0.28)}
          style={{
            position: 'absolute',
            right: 4,
            bottom: 18,
            transform: [{ rotate: '35deg' }, { scaleX: -1 }],
          }}
        />
        <Image
          source={require('@/assets/images/Father_mother_baby_party.png')}
          style={{ width: 300, height: 220 }}
          resizeMode="contain"
        />
        <Ionicons
          name="heart"
          size={22}
          color="#f08aa8"
          style={{ position: 'absolute', left: 18, top: 40 }}
        />
        <Ionicons
          name="heart"
          size={18}
          color="#f08aa8"
          style={{ position: 'absolute', right: 22, top: 58 }}
        />
      </View>
    </View>
  );
}

/** Carte de chiffre clé : pastille d'icône, valeur en accent, libellé. */
function StatCard({
  icon,
  iconColor,
  iconTint,
  value,
  label,
  accent,
}: {
  icon: IoniconName;
  iconColor: string;
  iconTint: string;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <View
      className="flex-1 flex-row items-center gap-2.5 rounded-[24px] px-3 py-3.5"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 3,
      }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: iconTint }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="text-[18px] font-extrabold"
          style={{ color: accent }}
        >
          {value}
        </Text>
        <Text className="text-[12px]" style={{ color: GLASS_BODY_COLOR }}>
          {label}
        </Text>
      </View>
    </View>
  );
}

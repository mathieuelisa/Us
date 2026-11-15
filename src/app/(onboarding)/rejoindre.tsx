import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { QrScannerModal } from '@/components/onboarding/qr-scanner-modal';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { signOut } from '@/features/auth/api';
import {
  getJoinErrorMessage,
  JOIN_CODE_LENGTH,
  parseJoinCode,
} from '@/features/household/api';
import { useJoinHouseholdByCode } from '@/features/household/hooks';
import { useUpdateMyIsPartner } from '@/features/profile/hooks';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';
import { NO_WEB_FOCUS_OUTLINE } from '@/lib/web-styles';

/**
 * « Rejoindre l'espace de votre partenaire » (demande explicite) : le
 * parcours de qui a choisi « Je suis partenaire » à l'inscription, à la
 * place de l'onboarding. Le code d'espace (6 caractères) se saisit à la
 * main ou se lit dans le QR code affiché par l'autre parent. Une fois
 * rattaché, `AuthGate` bascule d'elle-même dans l'app.
 *
 * `?code=` préremplit le code (lien encodé dans le QR code).
 */
export default function JoinHouseholdScreen() {
  const accent = useThemeAccent();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const joinHousehold = useJoinHouseholdByCode();
  const updateIsPartner = useUpdateMyIsPartner();

  useEffect(() => {
    const fromLink = params.code ? parseJoinCode(params.code) : null;
    if (fromLink) setCode(fromLink);
  }, [params.code]);

  const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const isComplete = normalized.length === JOIN_CODE_LENGTH;

  const join = (value: string = normalized) => {
    if (value.length !== JOIN_CODE_LENGTH || joinHousehold.isPending) return;
    setErrorMessage(null);
    joinHousehold.mutate(value, {
      onError: (error) => setErrorMessage(getJoinErrorMessage(error)),
    });
  };

  // Finalement la personne qui attend le bébé : n'est plus partenaire, et
  // passe à l'onboarding pour créer son espace.
  const createOwnSpace = () =>
    updateIsPartner.mutate(false, {
      // La présentation a déjà été vue : droit à l'onboarding.
      onSuccess: () => router.replace('/'),
      onError: () =>
        setErrorMessage('Impossible de changer de parcours. Réessayez.'),
    });

  return (
    <>
      <OnboardingStepShell
        step={null}
        title="Rejoindre l’espace de votre partenaire"
        subtitle="Saisissez le code à 6 caractères affiché dans son application, ou scannez son QR code."
        illustration={<JoinIllustration accent={accent} />}
        primaryLabel={joinHousehold.isPending ? 'Connexion…' : 'Rejoindre'}
        onPrimaryPress={() => join()}
        isPrimaryDisabled={!isComplete || joinHousehold.isPending}
        secondaryLabel="J’attends un bébé : je crée mon espace"
        onSecondaryPress={createOwnSpace}
      >
        <View className="gap-4">
          <View
            className="items-center rounded-[24px] bg-white px-4 py-5"
            style={{
              borderWidth: 1.5,
              borderColor: errorMessage ? '#d14b3a' : hexToRgba(accent, 0.25),
              shadowColor: accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            <Text
              className="text-[12px] font-bold"
              style={{ color: GLASS_BODY_COLOR, letterSpacing: 1.2 }}
            >
              CODE DE L’ESPACE
            </Text>
            <TextInput
              accessibilityLabel="Code de l’espace"
              value={normalized}
              onChangeText={(text) => {
                setErrorMessage(null);
                setCode(text.slice(0, JOIN_CODE_LENGTH + 2));
              }}
              placeholder="ABC123"
              placeholderTextColor="#c9c7d3"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={JOIN_CODE_LENGTH}
              returnKeyType="go"
              onSubmitEditing={() => join()}
              className="mt-1 w-full text-center text-[34px] font-extrabold"
              style={[
                {
                  color: GLASS_TITLE_COLOR,
                  letterSpacing: 8,
                  paddingVertical: 4,
                },
                NO_WEB_FOCUS_OUTLINE,
              ]}
            />
          </View>

          {errorMessage ? (
            <View className="flex-row items-center gap-2 px-1">
              <Ionicons name="alert-circle" size={17} color="#d14b3a" />
              <Text className="flex-1 text-[13px] text-[#c9553d]">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center gap-3 px-2">
            <View className="h-px flex-1 bg-[#e3e1ea]" />
            <Text className="text-[12.5px]" style={{ color: GLASS_BODY_COLOR }}>
              ou
            </Text>
            <View className="h-px flex-1 bg-[#e3e1ea]" />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setIsScannerOpen(true)}
            className="h-14 flex-row items-center justify-center gap-2.5 rounded-full bg-white active:opacity-75"
            style={{
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.06)',
              shadowColor: accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 3,
            }}
          >
            <Ionicons name="qr-code-outline" size={21} color={accent} />
            <Text
              className="text-[15.5px] font-semibold"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              Scanner un QR code
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => signOut()}
            className="items-center py-1"
          >
            <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
              Se déconnecter
            </Text>
          </Pressable>
        </View>
      </OnboardingStepShell>

      <QrScannerModal
        visible={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanned={(scanned) => {
          setIsScannerOpen(false);
          setCode(scanned);
          join(scanned);
        }}
      />
    </>
  );
}

/** QR code sur une tache d'accent, avec de petits traits. */
function JoinIllustration({ accent }: { accent: string }) {
  return (
    <View style={{ width: 124, height: 124 }}>
      <View
        style={{
          position: 'absolute',
          left: 8,
          top: 10,
          width: 112,
          height: 112,
          borderRadius: 56,
          backgroundColor: hexToRgba(accent, 0.1),
        }}
      />
      <View className="flex-1 items-center justify-center">
        <View
          className="h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-white"
          style={{
            shadowColor: accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 14,
            elevation: 4,
          }}
        >
          <Ionicons name="qr-code" size={36} color={accent} />
        </View>
      </View>
      <SparkLines color={hexToRgba(accent, 0.6)} style={{ right: 4, top: 4 }} />
    </View>
  );
}

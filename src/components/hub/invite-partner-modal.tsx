import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { getJoinErrorMessage } from '@/features/household/api';
import { useCreateHouseholdJoinCode } from '@/features/household/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';

const STEPS = [
  'Votre partenaire installe US et crée son compte.',
  'À l’inscription, il ou elle choisit « Je suis partenaire ».',
  'Il ou elle saisit ce code, ou scanne le QR code.',
];

/**
 * « Ajouter votre partenaire » (demande explicite) : un code **temporaire**
 * créé à l'ouverture (30 min, usage unique — `create_household_join_code`),
 * en grand avec son compte à rebours, son QR code, les étapes pour l'autre
 * parent et le partage du code. Expiré, il se renouvelle d'un toucher.
 * Le QR contient un lien `…/rejoindre?code=XXXXXX`, que le scanner de
 * l'écran « Rejoindre » lit (`parseJoinCode`). Même feuille que les autres
 * modales de l'app.
 */
export function InvitePartnerModal({
  visible,
  accent,
  partnerName,
  onClose,
}: {
  visible: boolean;
  accent: string;
  partnerName: string | null;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [shareError, setShareError] = useState<string | null>(null);
  const createCode = useCreateHouseholdJoinCode();
  const joinCode = createCode.data?.code ?? null;
  const expiresAt = createCode.data
    ? Date.parse(createCode.data.expiresAt)
    : null;
  const [now, setNow] = useState(() => Date.now());

  // Un code à chaque ouverture (ou le code en cours, côté base).
  // biome-ignore lint/correctness/useExhaustiveDependencies: seule l'ouverture doit redemander un code.
  useEffect(() => {
    if (visible) {
      setShareError(null);
      createCode.mutate();
    }
  }, [visible]);

  // Compte à rebours, rafraîchi chaque seconde tant que la modale est ouverte.
  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [visible]);

  const remainingMs = expiresAt === null ? 0 : expiresAt - now;
  const isExpired = expiresAt !== null && remainingMs <= 0;
  const countdown = `${Math.floor(Math.max(0, remainingMs) / 60000)}:${String(
    Math.floor((Math.max(0, remainingMs) % 60000) / 1000),
  ).padStart(2, '0')}`;
  const qrValue = joinCode
    ? Linking.createURL('/rejoindre', { queryParams: { code: joinCode } })
    : '';
  const spacedCode = joinCode
    ? `${joinCode.slice(0, 3)} ${joinCode.slice(3)}`
    : '';

  const share = async () => {
    if (!joinCode || isExpired) return;
    setShareError(null);
    try {
      await Share.share({
        message: `Rejoins-moi sur US : à l’inscription, choisis « Je suis partenaire » puis saisis le code ${joinCode} (valable 30 minutes).`,
      });
    } catch {
      setShareError(
        'Le partage n’est pas disponible ici : transmettez le code tel quel.',
      );
    }
  };

  return (
    <Modal
      statusBarTranslucent
      navigationBarTranslucent
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="overflow-hidden rounded-t-[32px] bg-white px-6 pt-3"
          style={{ paddingBottom: 40 + insets.bottom }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -70,
              right: -60,
              width: 220,
              height: 200,
              borderRadius: 110,
              backgroundColor: lightenHex(accent, 0.55),
              opacity: 0.35,
            }}
          />
          <View className="mb-4 h-1.5 w-11 self-center rounded-full bg-[#e5e5ea]" />

          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1.5">
              <Text
                className="text-[22px] font-extrabold leading-7"
                style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
              >
                {partnerName
                  ? `Inviter ${partnerName}`
                  : 'Inviter votre partenaire'}
              </Text>
              <Svg width={92} height={10} viewBox="0 0 92 10">
                <Path
                  d="M3 7 C 27 2, 62 1.5, 89 4"
                  stroke={hexToRgba(accent, 0.5)}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              <Text
                className="text-[13px] leading-[18px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                Partagez ce code ou faites scanner le QR code pour rejoindre
                votre espace.
              </Text>
            </View>
            <View>
              <Pressable
                accessibilityLabel="Fermer"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onClose}
                className="h-9 w-9 items-center justify-center rounded-full bg-white"
                style={{
                  shadowColor: accent,
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.14,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <Ionicons name="close" size={19} color={GLASS_TITLE_COLOR} />
              </Pressable>
              <SparkLines
                color={hexToRgba(accent, 0.55)}
                style={{
                  top: 40,
                  right: -10,
                  transform: [{ rotate: '60deg' }, { scale: 0.85 }],
                }}
              />
            </View>
          </View>

          {joinCode ? (
            <View
              className="mt-5 flex-row items-center gap-4"
              style={{ opacity: isExpired ? 0.3 : 1 }}
            >
              <View
                className="items-center justify-center rounded-[22px] bg-white p-3"
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.05)',
                  shadowColor: accent,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.12,
                  shadowRadius: 16,
                  elevation: 3,
                }}
              >
                <QRCode
                  value={qrValue}
                  size={124}
                  color={GLASS_TITLE_COLOR}
                  backgroundColor="#ffffff"
                />
              </View>
              <View className="flex-1 gap-1.5">
                <Text
                  className="text-[11.5px] font-bold"
                  style={{ color: GLASS_BODY_COLOR, letterSpacing: 1.2 }}
                >
                  CODE DE L’ESPACE
                </Text>
                <View
                  className="items-center rounded-[18px] px-3 py-3"
                  style={{ backgroundColor: hexToRgba(accent, 0.1) }}
                >
                  <Text
                    accessibilityLabel={`Code ${joinCode.split('').join(' ')}`}
                    className="text-[26px] font-extrabold"
                    style={{ color: accent, letterSpacing: 4 }}
                  >
                    {spacedCode}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text
              className="mt-5 text-[14px]"
              style={{
                color: createCode.isError ? '#c9553d' : GLASS_BODY_COLOR,
              }}
            >
              {createCode.isError
                ? getJoinErrorMessage(createCode.error)
                : 'Création d’un code sécurisé…'}
            </Text>
          )}

          {joinCode ? (
            <View className="mt-3 flex-row items-center justify-center gap-1.5">
              <Ionicons
                name={isExpired ? 'alert-circle-outline' : 'time-outline'}
                size={15}
                color={isExpired ? '#c9553d' : GLASS_BODY_COLOR}
              />
              <Text
                className="text-[12.5px]"
                style={{ color: isExpired ? '#c9553d' : GLASS_BODY_COLOR }}
              >
                {isExpired
                  ? 'Ce code a expiré.'
                  : `Code temporaire à usage unique · expire dans ${countdown}`}
              </Text>
            </View>
          ) : null}

          <View className="mt-5 gap-2.5">
            {STEPS.map((step, index) => (
              <View key={step} className="flex-row items-center gap-3">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: hexToRgba(accent, 0.12) }}
                >
                  <Text
                    className="text-[13px] font-extrabold"
                    style={{ color: accent }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  className="flex-1 text-[13.5px] leading-[19px]"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-6 gap-2">
            {isExpired ? (
              <PillButton
                label={
                  createCode.isPending ? 'Création…' : 'Générer un nouveau code'
                }
                icon="refresh-outline"
                isDisabled={createCode.isPending}
                onPress={() => createCode.mutate()}
              />
            ) : (
              <PillButton
                label="Partager le code"
                icon="share-social-outline"
                isDisabled={!joinCode}
                onPress={share}
              />
            )}
            {shareError ? (
              <Text
                className="text-center text-[12.5px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {shareError}
              </Text>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

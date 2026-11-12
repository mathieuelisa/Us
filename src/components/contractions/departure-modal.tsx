import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Modal, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { ProgressBar } from '@/components/organisation/progress-bar';
import {
  ChevronBubble,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { formatDuration } from '@/features/contractions/rules';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';

const VALISE_IMAGE = require('@/assets/images/Valise_maternite.png');

/**
 * Modale « Il est temps de partir à la maternité » (demande explicite),
 * ouverte quand la règle de départ est atteinte (`analyzeContractions`).
 * Résume les résultats, puis renvoie vers la valise de maternité (choix
 * explicite : pas d'appel ni d'itinéraire). Même feuille que les modales
 * d'ajout (`InfoItemFormModal`) : fond opaque immédiat, carte qui glisse.
 */
export function DepartureModal({
  visible,
  averageIntervalMs,
  averageDurationMs,
  regularForMs,
  valise,
  onClose,
}: {
  visible: boolean;
  averageIntervalMs: number | null;
  averageDurationMs: number | null;
  regularForMs: number;
  valise: { checked: number; total: number };
  onClose: () => void;
}) {
  const accent = useThemeAccent();
  const summary = [
    averageIntervalMs !== null
      ? `Vos contractions reviennent toutes les ${formatDuration(averageIntervalMs)} environ`
      : 'Vos contractions sont régulières',
    `depuis ${formatDuration(regularForMs)}`,
    averageDurationMs !== null
      ? `et durent ${formatDuration(averageDurationMs)} en moyenne.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const openValise = () => {
    onClose();
    router.push('/organisation?checklist=valise-maternite');
  };

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
          className="overflow-hidden rounded-t-[32px] bg-white px-6 pb-10 pt-3"
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

          <View className="items-center gap-3">
            <View>
              <Image
                source={VALISE_IMAGE}
                style={{ width: 150, height: 116 }}
                resizeMode="contain"
              />
              <SparkLines
                color={hexToRgba(accent, 0.6)}
                style={{
                  left: -14,
                  top: -6,
                  transform: [{ rotate: '-70deg' }],
                }}
              />
            </View>
            <Text
              accessibilityRole="header"
              className="text-center text-[22px] font-extrabold leading-[28px]"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
            >
              Il est temps de partir{'\n'}à la maternité
            </Text>
            <Text
              className="text-center text-[14.5px] leading-[21px]"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {summary} Prenez la route calmement et prévenez la maternité si on
              vous l’a demandé.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Valise de maternité, ${valise.checked} sur ${valise.total} prêts`}
            onPress={openValise}
            className="mt-5 flex-row items-center gap-3 rounded-[22px] px-4 py-3.5 active:opacity-80"
            style={{ backgroundColor: hexToRgba(accent, 0.08) }}
          >
            <Text className="text-[26px]">🧳</Text>
            <View className="flex-1 gap-1.5">
              <Text
                className="text-[15px] font-bold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                Valise de maternité
              </Text>
              <Text
                className="text-[12.5px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {valise.total === 0
                  ? 'Vérifiez que rien ne manque'
                  : `${valise.checked} sur ${valise.total} prêts`}
              </Text>
              {valise.total > 0 ? (
                <ProgressBar progress={valise.checked / valise.total} />
              ) : null}
            </View>
            <ChevronBubble accent={accent} />
          </Pressable>

          <View className="mt-5 gap-3">
            <PillButton
              label="J’ai compris"
              icon="checkmark-circle-outline"
              onPress={onClose}
            />
            <View className="flex-row items-center justify-center gap-1.5 px-2">
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={GLASS_BODY_COLOR}
              />
              <Text
                className="flex-1 text-center text-[11.5px] leading-4"
                style={{ color: GLASS_BODY_COLOR }}
              >
                Repère indicatif : il ne remplace pas l’avis de votre sage-femme
                ou de la maternité.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

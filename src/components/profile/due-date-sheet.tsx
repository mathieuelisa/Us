import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import { getWeeksOfAmenorrhea } from '@/features/health/constants';
import { hexToRgba, lightenHex } from '@/lib/color';
import { todayIso } from '@/lib/date';

/**
 * Feuille « Date du terme » du Profil (demande explicite) : corriger la
 * date saisie à l'onboarding en cas d'erreur. Même habillage que la
 * feuille « Nouveau rendez-vous » (titre souligné, bouton de fermeture
 * rond, molette dans sa carte, `PillButton`, lien « Annuler »), et mêmes
 * réglages Android bord à bord.
 *
 * Sous la molette, les semaines d'aménorrhée qui en découlent se
 * recalculent en direct : on voit l'effet de la date avant de
 * l'enregistrer. Comme à l'onboarding, la date ne peut pas être passée —
 * sauf si le terme enregistré l'est déjà (grossesse qui dépasse le terme) :
 * la molette part alors de lui, pour pouvoir le garder.
 */
export function DueDateSheet({
  visible,
  dueDate,
  accent,
  isSaving,
  onSave,
  onClose,
}: {
  visible: boolean;
  /** Date du terme enregistrée. */
  dueDate: string | null;
  accent: string;
  isSaving: boolean;
  onSave: (dueDate: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<string | null>(dueDate);

  useEffect(() => {
    if (visible) setDraft(dueDate);
  }, [visible, dueDate]);

  const today = todayIso();
  const minDate = dueDate && dueDate < today ? dueDate : today;
  const weeks = getWeeksOfAmenorrhea(draft);
  const hasChanged = draft !== null && draft !== dueDate;
  const canSave = hasChanged && draft >= minDate && !isSaving;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="max-h-[94%] overflow-hidden rounded-t-[32px] bg-white"
        >
          {/* Tache pâle en haut à droite, derrière le bouton de fermeture. */}
          <View pointerEvents="none" className="absolute inset-0">
            <View
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
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4 px-5 pt-2.5"
            contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}
          >
            <View className="h-1.5 w-11 self-center rounded-full bg-[#e6e6ea]" />

            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1.5">
                <Text
                  className="text-[22px] font-extrabold leading-7"
                  style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
                >
                  {t('profile.dueDate')}
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
                  {t('profile.dueDateSheet.hint')}
                </Text>
              </View>
              <View>
                <Pressable
                  accessibilityLabel={t('common.close')}
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

            <WheelDatePicker
              value={draft}
              minDate={minDate}
              onChange={setDraft}
            />

            <View
              className="flex-row items-center gap-2.5 rounded-[18px] px-3.5 py-3"
              style={{ backgroundColor: hexToRgba(accent, 0.07) }}
            >
              <Ionicons name="sparkles-outline" size={17} color={accent} />
              <Text
                className="flex-1 text-[13px] leading-[18px]"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {weeks === null
                  ? t('profile.dueDateSheet.tooFar')
                  : t('profile.dueDateSheet.weeks', { count: weeks })}
              </Text>
            </View>

            <PillButton
              label={
                isSaving ? t('profile.saving') : t('profile.dueDateSheet.save')
              }
              icon="save-outline"
              size="compact"
              isDisabled={!canSave || weeks === null}
              onPress={() => {
                if (draft) onSave(draft);
              }}
            />

            <Pressable
              accessibilityRole="button"
              hitSlop={6}
              onPress={onClose}
              className="items-center self-center px-4 py-2.5"
            >
              <Text
                className="text-[14.5px] font-semibold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {t('common.cancel')}
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

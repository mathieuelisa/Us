import { Ionicons } from '@expo/vector-icons';
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
import { type AppLanguage, LANGUAGE_OPTIONS } from '@/i18n/languages';
import { hexToRgba, lightenHex } from '@/lib/color';

/**
 * Feuille « Langue » de Réglages : français, anglais, espagnol. Même
 * habillage que la feuille « Date du terme » (titre souligné, bouton de
 * fermeture rond, tache pâle), mêmes réglages Android bord à bord. Le choix
 * s'applique au tap et referme la feuille. Chaque langue est écrite dans sa
 * propre langue, pour qu'on retrouve la sienne même dans une interface
 * qu'on ne lit pas.
 *
 * La coche est une icône posée dans une pastille dont seul le fond change :
 * pas de `rounded-full` sur une vue dont le style varie (cf. Android).
 */
export function LanguageSheet({
  visible,
  selected,
  accent,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: AppLanguage;
  accent: string;
  onSelect: (language: AppLanguage) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

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
        <Pressable
          accessibilityLabel={t('common.close')}
          className="absolute inset-0"
          onPress={onClose}
        />
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="max-h-[94%] overflow-hidden rounded-t-[32px] bg-white"
        >
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
            contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
          >
            <View className="h-1.5 w-11 self-center rounded-full bg-[#e6e6ea]" />

            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1.5">
                <Text
                  className="text-[22px] font-extrabold leading-7"
                  style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
                >
                  {t('settings.language.sheetTitle')}
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
                  {t('settings.language.sheetHint')}
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

            <View
              className="overflow-hidden rounded-[24px]"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderWidth: 1,
                borderColor: hexToRgba(accent, 0.12),
              }}
            >
              {LANGUAGE_OPTIONS.map((option, index) => {
                const isSelected = option.id === selected;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={option.label}
                    onPress={() => onSelect(option.id)}
                    className={`flex-row items-center gap-3.5 px-4 py-3.5 active:opacity-70 ${
                      index > 0 ? 'border-t border-black/5' : ''
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? hexToRgba(accent, 0.08)
                        : 'transparent',
                    }}
                  >
                    <Text
                      className="w-8 text-[13px] font-bold uppercase"
                      style={{ color: accent }}
                    >
                      {option.id}
                    </Text>
                    <Text
                      className="flex-1 text-[16px]"
                      style={{
                        color: GLASS_TITLE_COLOR,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {option.label}
                    </Text>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isSelected ? accent : 'transparent',
                        borderWidth: 1.5,
                        borderColor: isSelected ? accent : '#d4d4da',
                      }}
                    >
                      {isSelected ? (
                        <Ionicons name="checkmark" size={14} color="#ffffff" />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

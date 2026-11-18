import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { type AppLanguage, LANGUAGE_OPTIONS } from '@/i18n/languages';
import { hexToRgba } from '@/lib/color';

const LANGUAGES_IMAGE = require('@/assets/images/Icon_langues.png');

/**
 * Mélange une couleur hex avec du blanc (`amount` = part de blanc, 0–1).
 * Donne un fond teinté **opaque** : sur Android, une ombre (`elevation`)
 * sous un fond translucide laisse des artefacts.
 */
function tintHex(hex: string, amount: number): string {
  const num = Number.parseInt(hex.replace('#', ''), 16);
  const mix = (value: number) =>
    Math.round(value + (255 - value) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${mix((num >> 16) & 0xff)}${mix((num >> 8) & 0xff)}${mix(num & 0xff)}`;
}

/**
 * Feuille « Langue » de Réglages : français, anglais, espagnol. Un globe en
 * illustration, une carte par langue (drapeau, nom et salut écrits dans la
 * langue elle-même), la carte choisie teintée de l'accent du thème. Le
 * choix s'applique au tap et referme la feuille.
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
          <SheetBackdrop accent={accent} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-5 pt-2.5"
            contentContainerStyle={{ paddingBottom: 28 + insets.bottom }}
          >
            <View className="h-1.5 w-11 self-center rounded-full bg-black/10" />

            <View className="mt-3 flex-row items-center gap-2">
              <View className="flex-1 gap-2">
                <Text
                  className="text-[26px] font-extrabold leading-[31px]"
                  style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
                >
                  {t('settings.language.sheetTitle')}
                </Text>
                <Svg width={84} height={10} viewBox="0 0 84 10">
                  <Path
                    d="M3 7 C 25 2, 57 1.5, 81 4"
                    stroke={hexToRgba(accent, 0.7)}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              </View>
              <Image
                source={LANGUAGES_IMAGE}
                accessibilityIgnoresInvertColors
                style={{ width: 128, height: 109, marginTop: 34 }}
                resizeMode="contain"
              />
            </View>

            <Text
              className="mt-1 text-[14px] leading-[20px]"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {t('settings.language.sheetHint')}
            </Text>

            <View className="mt-5 gap-3" accessibilityRole="radiogroup">
              {LANGUAGE_OPTIONS.map((option, index) => (
                <Animated.View
                  key={option.id}
                  entering={FadeInDown.delay(120 + index * 70).duration(320)}
                >
                  <LanguageCard
                    label={option.label}
                    greeting={option.greeting}
                    flag={<Flag language={option.id} />}
                    accent={accent}
                    isSelected={option.id === selected}
                    onPress={() => onSelect(option.id)}
                  />
                </Animated.View>
              ))}
            </View>
          </ScrollView>

          <Pressable
            accessibilityLabel={t('common.close')}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: accent,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.18,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Ionicons name="close" size={20} color={GLASS_TITLE_COLOR} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Fond de la feuille : dégradé de l'accent (très pâle) vers le blanc, une
 * tache ronde derrière le globe et une autre en bas à gauche.
 */
function SheetBackdrop({ accent }: { accent: string }) {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="languageSheetFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={tintHex(accent, 0.88)} />
            <Stop offset="0.55" stopColor="#ffffff" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#languageSheetFade)" />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 18,
          right: -30,
          width: 190,
          height: 190,
          borderRadius: 95,
          backgroundColor: tintHex(accent, 0.8),
          opacity: 0.45,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -70,
          left: -60,
          width: 170,
          height: 170,
          borderRadius: 85,
          backgroundColor: tintHex(accent, 0.85),
          opacity: 0.5,
        }}
      />
    </View>
  );
}

function LanguageCard({
  label,
  greeting,
  flag,
  accent,
  isSelected,
  onPress,
}: {
  label: string;
  greeting: string;
  flag: React.ReactNode;
  accent: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-[24px] px-4 py-3.5 active:opacity-80"
      style={{
        backgroundColor: isSelected ? tintHex(accent, 0.86) : '#ffffff',
        borderWidth: 1.5,
        borderColor: isSelected
          ? hexToRgba(accent, 0.45)
          : 'rgba(28, 26, 46, 0.05)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isSelected ? 0.22 : 0.08,
        shadowRadius: 16,
        elevation: isSelected ? 4 : 2,
      }}
    >
      <View
        className="h-[52px] w-[52px] items-center justify-center rounded-[18px]"
        style={{
          backgroundColor: isSelected ? '#ffffff' : '#f6f5f8',
        }}
      >
        {flag}
      </View>

      <View className="flex-1 gap-0.5">
        <Text
          className="text-[18px] font-extrabold"
          style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
        >
          {label}
        </Text>
        <Text
          className="text-[13px] font-medium"
          style={{ color: isSelected ? accent : GLASS_BODY_COLOR }}
        >
          {greeting}
        </Text>
      </View>

      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? accent : 'transparent',
          borderWidth: 2,
          borderColor: isSelected ? accent : '#d6d5dd',
        }}
      >
        {isSelected ? (
          <Ionicons name="checkmark" size={17} color="#ffffff" />
        ) : null}
      </View>
    </Pressable>
  );
}

const FLAG_WIDTH = 32;
const FLAG_HEIGHT = 23;

/** Drapeaux dessinés en SVG (rectangle arrondi), sans dépendance ni image. */
function Flag({ language }: { language: AppLanguage }) {
  return (
    <View
      style={{
        width: FLAG_WIDTH,
        height: FLAG_HEIGHT,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(0, 0, 0, 0.08)',
      }}
    >
      {language === 'fr' ? (
        <Svg width="100%" height="100%" viewBox="0 0 3 2">
          <Rect x={0} y={0} width={1} height={2} fill="#2f4fb8" />
          <Rect x={1} y={0} width={1} height={2} fill="#ffffff" />
          <Rect x={2} y={0} width={1} height={2} fill="#ef4655" />
        </Svg>
      ) : null}
      {language === 'es' ? (
        <Svg width="100%" height="100%" viewBox="0 0 3 2">
          <Rect x={0} y={0} width={3} height={2} fill="#d9283a" />
          <Rect x={0} y={0.5} width={3} height={1} fill="#f7c63e" />
        </Svg>
      ) : null}
      {language === 'en' ? (
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 60 30"
          preserveAspectRatio="xMidYMid slice"
        >
          <Defs>
            <ClipPath id="unionJackDiagonals">
              <Path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
            </ClipPath>
          </Defs>
          <Rect width={60} height={30} fill="#012169" />
          <Path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth={6} />
          <G clipPath="url(#unionJackDiagonals)">
            <Path
              d="M0,0 L60,30 M60,0 L0,30"
              stroke="#c8102e"
              strokeWidth={4}
            />
          </G>
          <Path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth={10} />
          <Path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth={6} />
        </Svg>
      ) : null}
    </View>
  );
}

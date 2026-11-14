import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { PROFILE_AVATARS } from '@/features/profile/avatars';
import { hexToRgba, lightenHex } from '@/lib/color';

const TILE_SIZE = 84;

/**
 * Modale de choix de l'avatar (demande explicite), ouverte en touchant
 * l'avatar de la page Profil. Même feuille que les autres modales de l'app
 * (`InfoItemFormModal`, modale de départ des contractions) : fond opaque
 * immédiat, carte qui glisse, tache d'accent, titre souligné, bouton de
 * fermeture. Grille de 7 ronds : l'initiale du prénom (sans avatar), puis
 * les 6 animaux. Le choix s'applique au toucher, comme le thème.
 */
export function AvatarPickerModal({
  visible,
  accent,
  initials,
  selected,
  isSaving,
  onSelect,
  onClose,
}: {
  visible: boolean;
  accent: string;
  initials: string;
  /** Clé de l'avatar actuel, `null` pour l'initiale. */
  selected: string | null;
  isSaving: boolean;
  onSelect: (avatar: string | null) => void;
  onClose: () => void;
}) {
  const options: {
    key: string | null;
    label: string;
    bg: string;
    content: string;
  }[] = [
    { key: null, label: 'Initiale', bg: accent, content: initials },
    ...PROFILE_AVATARS.map((avatar) => ({
      key: avatar.key,
      label: avatar.label,
      bg: avatar.bg,
      content: avatar.emoji,
    })),
  ];

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

          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1.5">
              <Text
                className="text-[22px] font-extrabold leading-7"
                style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
              >
                Choisir un avatar
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
                Il s’affiche sur votre profil.
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

          <View className="mt-6 flex-row flex-wrap justify-center gap-x-4 gap-y-4">
            {options.map((option) => {
              const isSelected = option.key === selected;
              return (
                <Pressable
                  key={option.key ?? 'initiale'}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: isSelected,
                    disabled: isSaving,
                  }}
                  accessibilityLabel={option.label}
                  disabled={isSaving}
                  onPress={() => onSelect(option.key)}
                  className="items-center gap-1.5 active:opacity-75"
                  style={{ width: TILE_SIZE + 8 }}
                >
                  <View
                    className="items-center justify-center rounded-full"
                    style={{
                      width: TILE_SIZE,
                      height: TILE_SIZE,
                      backgroundColor: option.bg,
                      borderWidth: 3,
                      borderColor: isSelected ? accent : 'transparent',
                      shadowColor: accent,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: isSelected ? 0.22 : 0.08,
                      shadowRadius: 12,
                      elevation: isSelected ? 5 : 2,
                    }}
                  >
                    <Text
                      className={
                        option.key === null
                          ? 'text-[32px] font-extrabold text-white'
                          : ''
                      }
                      style={
                        option.key === null
                          ? { letterSpacing: -0.6 }
                          : { fontSize: 40, lineHeight: 48 }
                      }
                    >
                      {option.content}
                    </Text>
                    {isSelected ? (
                      <View
                        className="absolute h-6 w-6 items-center justify-center rounded-full"
                        style={{
                          right: -2,
                          bottom: -2,
                          backgroundColor: accent,
                          borderWidth: 2,
                          borderColor: '#ffffff',
                        }}
                      >
                        <Ionicons name="checkmark" size={13} color="#ffffff" />
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className="text-[12.5px]"
                    style={{
                      color: isSelected ? accent : GLASS_BODY_COLOR,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

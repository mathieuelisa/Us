import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';
import type { MoodValue } from '@/features/hub/api';
import {
  CARD_SHADOW,
  getMoodImage,
  MOOD_ORDER,
  MOOD_PRESENTATION,
} from '@/features/hub/constants';

/** Les 5 emoji du check-in (écrans 3a/3g) — un tap suffit à enregistrer. */
export function MoodPicker({
  selectedMood,
  pronoun,
  onSelect,
}: {
  selectedMood: MoodValue | null;
  /** Pronom de qui choisit : ours (« il », prénom seul) ou ourse. */
  pronoun: string | null;
  onSelect: (mood: MoodValue) => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-row justify-between">
      {MOOD_ORDER.map((mood) => {
        const isSelected = selectedMood === mood;
        return (
          <View key={mood} className="items-center gap-1.5">
            <Pressable
              accessibilityRole="button"
              style={CARD_SHADOW}
              accessibilityLabel={t(MOOD_PRESENTATION[mood].labelKey)}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(mood)}
              className={`h-20 w-20 items-center justify-center rounded-full border-2 ${
                isSelected
                  ? 'border-accent bg-accent/10'
                  : 'border-transparent bg-white'
              }`}
            >
              {/* <Text className="text-[26px]">{MOOD_PRESENTATION[mood].emoji}</Text> */}
              <Image
                source={getMoodImage(mood, pronoun)}
                className="w-16 h-40"
                resizeMode="contain"
              />
            </Pressable>
            <Text
              className={`text-[11px] ${
                isSelected ? 'font-medium text-accent' : 'text-[#6b6b6b]'
              }`}
            >
              {t(MOOD_PRESENTATION[mood].labelKey)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

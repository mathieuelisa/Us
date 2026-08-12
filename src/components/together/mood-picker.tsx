import { Image, Pressable, View } from 'react-native';

import type { MoodValue } from '@/features/hub/api';
import {
  CARD_SHADOW,
  MOOD_ORDER,
  MOOD_PRESENTATION,
} from '@/features/hub/constants';

/** Les 5 emoji du check-in (écrans 3a/3g) — un tap suffit à enregistrer. */
export function MoodPicker({
  selectedMood,
  onSelect,
}: {
  selectedMood: MoodValue | null;
  onSelect: (mood: MoodValue) => void;
}) {
  return (
    <View className="flex-row justify-between">
      {MOOD_ORDER.map((mood) => {
        const isSelected = selectedMood === mood;
        return (
          <Pressable
            key={mood}
            accessibilityRole="button"
            style={CARD_SHADOW}
            accessibilityLabel={MOOD_PRESENTATION[mood].phrase}
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
              source={MOOD_PRESENTATION[mood].imgUrl}
              className="w-16 h-40"
              resizeMode="contain"
            />
          </Pressable>
        );
      })}
    </View>
  );
}

import { Pressable, Text, View } from 'react-native';

import type { MoodValue } from '@/features/hub/api';
import { MOOD_ORDER, MOOD_PRESENTATION } from '@/features/hub/constants';

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
            accessibilityLabel={MOOD_PRESENTATION[mood].phrase}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(mood)}
            className={`h-14 w-14 items-center justify-center rounded-full border-2 ${
              isSelected
                ? 'border-accent bg-accent/10'
                : 'border-transparent bg-white'
            }`}
          >
            <Text className="text-[26px]">{MOOD_PRESENTATION[mood].emoji}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

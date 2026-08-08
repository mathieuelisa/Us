import { Pressable, Text, View } from 'react-native';

import { STATUS_OPTIONS } from '@/features/procedures/constants';

/** Sélecteur 3 états (écran 5b), modifiable par les deux parents. */
export function StatusSelector({
  status,
  onChange,
}: {
  status: string;
  onChange: (status: 'a_faire' | 'en_cours' | 'fait') => void;
}) {
  return (
    <View className="flex-row gap-2">
      {STATUS_OPTIONS.map((option) => {
        const isSelected = option.value === status;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() =>
              onChange(option.value as 'a_faire' | 'en_cours' | 'fait')
            }
            className={`flex-1 items-center rounded-[12px] border py-3 ${
              isSelected
                ? 'border-accent bg-[#eaf5f0]'
                : 'border-[#e0e0e0] bg-white'
            }`}
          >
            <Text
              className={`text-[13px] ${
                isSelected ? 'font-medium text-accent' : 'text-[#1a1a1a]'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

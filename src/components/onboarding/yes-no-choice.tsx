import { Pressable, Text, View } from 'react-native';

/** Question binaire des maquettes (« Oui / Non »), rendue en segmenté. */
export function YesNoChoice({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <View className="flex-row gap-2.5">
      {[true, false].map((option) => {
        const isSelected = value === option;
        return (
          <Pressable
            key={String(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option)}
            className={`flex-1 items-center rounded-[12px] border py-3 ${
              isSelected
                ? 'border-accent bg-accent'
                : 'border-[#e8e8e8] bg-white'
            }`}
          >
            <Text
              className={`text-[15px] ${
                isSelected
                  ? 'font-medium text-accent-foreground'
                  : 'text-[#1a1a1a]'
              }`}
            >
              {option ? 'Oui' : 'Non'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

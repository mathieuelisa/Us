import { Pressable, Text, View } from 'react-native';

import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';

/**
 * Question binaire des maquettes (« Oui / Non »), rendue en deux gélules :
 * l'option choisie se remplit d'accent, l'autre reste blanche.
 */
export function YesNoChoice({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  const accent = useThemeAccent();

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
            className="h-12 flex-1 items-center justify-center rounded-full"
            style={
              isSelected
                ? {
                    backgroundColor: accent,
                    shadowColor: accent,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    elevation: 4,
                  }
                : {
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.05)',
                  }
            }
          >
            <Text
              className="text-[15.5px]"
              style={{
                color: isSelected ? '#ffffff' : GLASS_TITLE_COLOR,
                fontWeight: isSelected ? '700' : '500',
              }}
            >
              {option ? 'Oui' : 'Non'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

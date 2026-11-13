import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { GLASS_BODY_COLOR } from '@/components/ui/glass-card';
import { STATUS_OPTIONS } from '@/features/procedures/constants';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const STATUS_ICONS: Record<string, IoniconName> = {
  a_faire: 'ellipse-outline',
  en_cours: 'hourglass-outline',
  fait: 'checkmark-circle',
};

/**
 * Sélecteur 3 états (écran 5b), modifiable par les deux parents. Rangée de
 * segments sur une piste claire ; le segment choisi passe en accent, icône
 * et libellé blancs (capture de référence). Le choix s'enregistre au
 * toucher, sans bouton de validation.
 */
export function StatusSelector({
  status,
  onChange,
}: {
  status: string;
  onChange: (status: 'a_faire' | 'en_cours' | 'fait') => void;
}) {
  const accent = useThemeAccent();

  return (
    <View
      accessibilityRole="radiogroup"
      className="flex-row gap-1 rounded-[20px] p-1"
      style={{ backgroundColor: hexToRgba(accent, 0.06) }}
    >
      {STATUS_OPTIONS.map((option) => {
        const isSelected = option.value === status;
        const color = isSelected ? '#ffffff' : GLASS_BODY_COLOR;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            onPress={() =>
              onChange(option.value as 'a_faire' | 'en_cours' | 'fait')
            }
            className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-[16px] active:opacity-80"
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
                : { backgroundColor: 'rgba(255, 255, 255, 0.9)' }
            }
          >
            <Ionicons
              name={STATUS_ICONS[option.value] ?? 'ellipse-outline'}
              size={17}
              color={color}
            />
            <Text
              className="text-[14px]"
              style={{ color, fontWeight: isSelected ? '700' : '600' }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

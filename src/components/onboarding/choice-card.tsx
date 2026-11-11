import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Option sélectionnable des écrans d'onboarding. Sert aussi bien aux choix
 * exclusifs (accompagnement, statut, rythme) qu'aux choix multiples
 * (priorités) — c'est l'écran qui décide de la sémantique, pas la carte.
 *
 * Carte blanche arrondie à ombre douce (capture de référence de l'étape 1) :
 * pastille d'icône teintée facultative à gauche (`icon`), rond de sélection
 * à droite qui se remplit d'accent avec une coche. Choisie, la carte prend
 * un contour et un fond d'accent légers.
 */
export function ChoiceCard({
  label,
  description,
  isSelected,
  onPress,
  icon,
}: {
  label: string;
  description?: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: { name: IoniconName; color: string; tint: string };
}) {
  const accent = useThemeAccent();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-[24px] py-3 pl-3 pr-4"
      style={{
        backgroundColor: isSelected
          ? hexToRgba(accent, 0.06)
          : 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1.5,
        borderColor: isSelected ? accent : 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 2,
      }}
    >
      {icon ? (
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: icon.tint }}
        >
          <Ionicons name={icon.name} size={23} color={icon.color} />
        </View>
      ) : null}

      <View className={`flex-1 gap-0.5 ${icon ? '' : 'py-1 pl-1'}`}>
        <Text
          className="text-[15.5px]"
          style={{
            color: isSelected ? accent : GLASS_TITLE_COLOR,
            fontWeight: isSelected ? '700' : '500',
          }}
        >
          {label}
        </Text>
        {description ? (
          <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
            {description}
          </Text>
        ) : null}
      </View>

      <View
        className="h-6 w-6 items-center justify-center rounded-full"
        style={{
          borderWidth: isSelected ? 0 : 1.5,
          borderColor: '#cfcdd8',
          backgroundColor: isSelected ? accent : 'transparent',
        }}
      >
        {isSelected ? (
          <Ionicons name="checkmark" size={15} color="#ffffff" />
        ) : null}
      </View>
    </Pressable>
  );
}

import { Pressable, Text, View } from 'react-native';

/**
 * Option sélectionnable des écrans d'onboarding. Sert aussi bien aux choix
 * exclusifs (accompagnement, statut, rythme) qu'aux choix multiples
 * (priorités) — c'est l'écran qui décide de la sémantique, pas la carte.
 */
export function ChoiceCard({
  label,
  description,
  isSelected,
  onPress,
}: {
  label: string;
  description?: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      className={`rounded-[14px] border px-4 py-3.5 ${
        isSelected ? 'border-accent bg-[#eaf5f0]' : 'border-[#e8e8e8] bg-white'
      }`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text
            className={`text-[15px] ${
              isSelected
                ? 'font-medium text-accent'
                : 'font-normal text-[#1a1a1a]'
            }`}
          >
            {label}
          </Text>
          {description ? (
            <Text className="text-[13px] text-[#6b6b6b]">{description}</Text>
          ) : null}
        </View>

        <View
          className={`h-5 w-5 items-center justify-center rounded-full border ${
            isSelected ? 'border-accent bg-accent' : 'border-[#d0d0d0]'
          }`}
        >
          {isSelected ? (
            <Text className="text-[11px] font-bold text-white">✓</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

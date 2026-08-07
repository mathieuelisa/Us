import { Pressable, Text, View } from 'react-native';

/**
 * Carte d'un des 3 piliers. Toutes ont volontairement le **même poids
 * visuel** (CONCEPT.md : « exactement 3 piliers de même poids visuel ») :
 * ni couleur, ni taille, ni ordre ne doivent en privilégier un.
 *
 * `state` est un état contextuel — ce qu'il y a à faire maintenant — et non
 * une description de la section.
 */
export function PillarCard({
  emoji,
  title,
  state,
  onPress,
}: {
  emoji: string;
  title: string;
  state: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title} — ${state}`}
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-[16px] bg-white px-4 py-4"
    >
      <View className="h-11 w-11 items-center justify-center rounded-[12px] bg-[#f4f4f4]">
        <Text className="text-[20px]">{emoji}</Text>
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-[16px] font-semibold text-[#1a1a1a]">
          {title}
        </Text>
        <Text className="text-[13px] text-[#6b6b6b]">{state}</Text>
      </View>

      <Text className="text-[20px] text-[#c0c0c0]">›</Text>
    </Pressable>
  );
}

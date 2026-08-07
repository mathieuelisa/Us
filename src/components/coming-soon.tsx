import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Destination d'attente pour les sections que le hub rend déjà accessibles
 * mais dont le contenu arrive dans une phase ultérieure. Préférée à une
 * carte non cliquable : l'utilisateur (et nous) voyons que la navigation
 * fonctionne, et l'écran dit franchement ce qui manque.
 */
export function ComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 gap-3 px-6 pt-4">
        {router.canGoBack() ? (
          <Pressable
            accessibilityLabel="Revenir en arrière"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
            className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-[#f4f4f4]"
          >
            <Text className="text-[17px] leading-[20px] text-[#1a1a1a]">‹</Text>
          </Pressable>
        ) : null}

        <Text className="text-[26px] font-bold text-[#1a1a1a]">{title}</Text>
        <Text className="text-[15px] leading-5 text-[#6b6b6b]">
          {description}
        </Text>
        <Text className="text-[13px] text-[#9a9a9a]">
          Arrive en {phase} du plan d’action.
        </Text>
      </View>
    </SafeAreaView>
  );
}

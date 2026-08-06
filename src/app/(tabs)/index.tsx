import { Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { useMyProfile } from '@/features/profile/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

export default function HomeScreen() {
  const { data: profile } = useMyProfile();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 gap-3 px-6 pt-4">
        <Text className="text-[26px] font-bold text-[#1a1a1a]">
          {profile?.first_name ? `Bonjour ${profile.first_name}` : 'Bonjour'}
        </Text>
        <Text className="text-[15px] leading-5 text-[#6b6b6b]">
          Le hub avec vos 3 piliers (Démarches, Ensemble, Suivi santé) arrivera
          dans une prochaine étape du plan d'action.
        </Text>
      </View>
    </SafeAreaView>
  );
}

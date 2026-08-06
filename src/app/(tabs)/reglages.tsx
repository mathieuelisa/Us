import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { OutlineButton } from '@/components/outline-button';
import { supabase } from '@/lib/supabase/client';

const SafeAreaView = withUniwind(RNSafeAreaView);

export default function SettingsScreen() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 gap-6 px-6 pt-4">
        <Text className="text-[26px] font-bold text-[#1a1a1a]">Réglages</Text>

        <Text className="text-[15px] leading-5 text-[#6b6b6b]">
          Le choix du thème visuel (3-4 thèmes prédéfinis) arrivera dans une
          prochaine étape du plan d'action.
        </Text>

        <OutlineButton
          label={isSigningOut ? 'Déconnexion…' : 'Se déconnecter'}
          isDisabled={isSigningOut}
          onPress={handleSignOut}
        />
      </View>
    </SafeAreaView>
  );
}

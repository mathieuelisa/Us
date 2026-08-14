import { Button } from 'heroui-native';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';
import { PlainInput } from '@/components/plain-input';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useMyProfile, useUpdateMyProfile } from '@/features/profile/hooks';
import { useThemeBackground } from '@/features/settings/hooks';
import { sessionAtom } from '@/lib/atoms/session';

const SafeAreaView = withUniwind(RNSafeAreaView);

export default function ProfileScreen() {
  const session = useAtomValue(sessionAtom);
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const backgroundColor = useThemeBackground();

  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    setFirstName(profile?.first_name ?? '');
  }, [profile?.first_name]);

  const initials = (profile?.first_name ?? '?').trim().charAt(0).toUpperCase();
  const hasChanges = firstName.trim() !== (profile?.first_name ?? '').trim();

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <View className="flex-1 gap-6 px-6 pt-4">
        <Text className="text-[26px] font-bold text-[#1a1a1a]">Mon profil</Text>

        <View className="items-center gap-2">
          {/* `Avatar` (Hero UI Native) n'a jamais reçu ses variables
              --default/--surface pour nos 4 thèmes custom — même famille de
              bug que les champs de saisie, cf. `PlainInput`. Cercle maison
              en attendant une vraie photo. */}
          <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
            <Text className="text-[22px] font-bold text-accent-foreground">
              {initials}
            </Text>
          </View>
          <Text className="text-[12.5px] text-[#9a9a9a]">
            Photo de profil — bientôt disponible
          </Text>
        </View>

        <View className="gap-3.5">
          <Text className="text-[13px] font-medium text-[#6b6b6b]">
            Prénom affiché
          </Text>
          <PlainInput
            placeholder="Votre prénom"
            value={firstName}
            onChangeText={setFirstName}
            editable={!isLoading}
            autoCapitalize="words"
          />

          <Button
            isDisabled={
              !hasChanges || updateProfile.isPending || firstName.trim() === ''
            }
            onPress={() => updateProfile.mutate(firstName.trim())}
          >
            <Button.Label>
              {updateProfile.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button.Label>
          </Button>

          {updateProfile.isError ? (
            <Text className="text-center text-[12.5px] text-red-600">
              Impossible d'enregistrer votre prénom pour le moment.
            </Text>
          ) : null}
        </View>

        <View className="gap-1">
          <Text className="text-[13px] font-medium text-[#6b6b6b]">Email</Text>
          <Text className="text-[15px] text-[#1a1a1a]">
            {session?.user.email}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

import { Button, Input, TextField } from 'heroui-native';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassOnboardingAtom } from '@/lib/atoms/dev-bypass';
import { supabase } from '@/lib/supabase/client';
import { getAuthRedirectTo } from '@/lib/supabase/magic-link';

const SafeAreaView = withUniwind(RNSafeAreaView);

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
  const setDevBypass = useSetAtom(devBypassOnboardingAtom);

  const handleSubmit = async () => {
    setStatus('sending');
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: getAuthRedirectTo() },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }

    setStatus('sent');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center gap-4 px-7">
        <View className="flex-1 items-center justify-center gap-4">
          <View className="h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-accent">
            <Text className="text-[28px] font-semibold text-accent-foreground">
              US
            </Text>
          </View>
          <Text className="text-[28px] font-bold text-[#1a1a1a]">US</Text>
          <Text className="max-w-[240px] text-center text-[15px] leading-5 text-[#6b6b6b]">
            Votre bébé a son carnet de santé. Vous, vous avez US.
          </Text>
        </View>

        {status === 'sent' ? (
          <Text className="text-center text-[15px] text-[#1a1a1a]">
            Vérifiez votre boîte mail : un lien de connexion vient de vous être
            envoyé.
          </Text>
        ) : (
          <View className="gap-3.5">
            <TextField isInvalid={status === 'error'}>
              <Input
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={status !== 'sending'}
              />
            </TextField>

            <Button
              isDisabled={status === 'sending' || email.trim().length === 0}
              onPress={handleSubmit}
            >
              <Button.Label>
                {status === 'sending'
                  ? 'Envoi en cours…'
                  : 'Recevoir mon lien de connexion'}
              </Button.Label>
            </Button>

            {errorMessage ? (
              <Text className="text-center text-[12.5px] text-red-600">
                {errorMessage}
              </Text>
            ) : (
              <Text className="text-center text-[12.5px] text-[#9a9a9a]">
                Aucune donnée personnelle requise.
              </Text>
            )}
          </View>
        )}

        {/* ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts.
            Hors du bloc conditionnel ci-dessus pour rester atteignable même
            après l'envoi du lien, et absent des builds de production. */}
        {__DEV__ ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setDevBypass(true)}
            className="mt-6 items-center rounded-[12px] border border-dashed border-[#d0d0d0] py-3"
          >
            <Text className="text-[13px] font-medium text-[#9a9a9a]">
              DEV — passer à l’onboarding sans connexion
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

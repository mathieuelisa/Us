import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useMyHousehold, useSyncCurrentRole } from '@/features/household/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassOnboardingAtom } from '@/lib/atoms/dev-bypass';
import { sessionAtom } from '@/lib/atoms/session';
import { queryClient } from '@/lib/query/query-client';
import { supabase } from '@/lib/supabase/client';
import {
  initialSessionRecovery,
  useMagicLinkListener,
} from '@/lib/supabase/magic-link';

SplashScreen.preventAutoHideAsync();

/**
 * Trois destinations mutuellement exclusives, dans cet ordre de résolution :
 * pas de session → connexion ; session mais pas encore de foyer →
 * onboarding ; foyer résolu → l'app. Le cas « co-parent invité » est traité
 * en amont par `useMyHousehold`, qui accepte l'invitation en attente avant
 * de conclure à l'absence de foyer — sans quoi le co-parent referait
 * l'onboarding et créerait un second espace.
 */
function AuthGate() {
  const session = useAtomValue(sessionAtom);
  const { data: household, isPending } = useMyHousehold();
  useSyncCurrentRole(household);

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
  const isDevBypass = useAtomValue(devBypassOnboardingAtom);

  const hasSession = !!session;
  const isResolvingHousehold = hasSession && isPending;

  if (isResolvingHousehold) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#2D5E5A" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!hasSession && !isDevBypass}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isDevBypass || (hasSession && !household)}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={!isDevBypass && hasSession && !!household}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setSession = useSetAtom(sessionAtom);
  const [isSessionReady, setIsSessionReady] = useState(false);

  // Liens magiques reçus pendant que l'app tourne déjà (mobile).
  useMagicLinkListener();

  useEffect(() => {
    initialSessionRecovery.finally(() => {
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
        setIsSessionReady(true);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <HeroUINativeProvider>
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <AnimatedSplashOverlay />
            {isSessionReady ? <AuthGate /> : null}
          </ThemeProvider>
        </HeroUINativeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

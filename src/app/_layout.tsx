import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { sessionAtom } from '@/lib/atoms/session';
import { queryClient } from '@/lib/query/query-client';
import { supabase } from '@/lib/supabase/client';
import { webSessionRecovery } from '@/lib/supabase/web-session-recovery';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const session = useAtomValue(sessionAtom);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setSession = useSetAtom(sessionAtom);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    webSessionRecovery.finally(() => {
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

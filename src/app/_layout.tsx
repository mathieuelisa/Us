import '@/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { NavigationBar } from 'expo-navigation-bar';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { HeroUINativeProvider } from 'heroui-native';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Uniwind } from 'uniwind';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useApplySession } from '@/features/auth/hooks';
import { useMyHousehold, useSyncCurrentRole } from '@/features/household/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import {
  DEFAULT_THEME_ID,
  resolveThemeId,
} from '@/features/settings/constants';
import { useThemeBackground } from '@/features/settings/hooks';
import { sessionAtom } from '@/lib/atoms/session';
import { queryClient } from '@/lib/query/query-client';
import {
  initialSessionRecovery,
  useAuthRedirectListener,
} from '@/lib/supabase/auth-redirect';
import { supabase } from '@/lib/supabase/client';

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

  // Applique le thème choisi (Phase 1.7) dès que le profil est connu, pour
  // que l'app entière s'ouvre déjà dans la bonne couleur — pas seulement
  // l'écran Réglages où le choix a été fait.
  const { data: profile } = useMyProfile();
  useEffect(() => {
    if (profile?.theme) {
      Uniwind.setTheme(resolveThemeId(profile.theme));
    }
  }, [profile?.theme]);

  // Tant que le profil n'est pas chargé (tout l'onboarding, avant la
  // création du foyer), Uniwind retombe sur le thème système — `dark` sur un
  // appareil/navigateur en mode sombre, ce qui fait apparaître les champs
  // `Input` de Hero UI Native en noir (leurs couleurs de fond viennent du
  // variant `dark`, pas de nos couleurs de marque). Un défaut explicite dès
  // le montage évite de dépendre du réglage système avant qu'un vrai thème
  // ne soit connu.
  useEffect(() => {
    Uniwind.setTheme(DEFAULT_THEME_ID);
  }, []);

  // Android : barre de navigation du système (boutons ou trait de geste)
  // masquée par défaut (demande explicite), pour que la barre de l'app ne
  // soit pas surmontée d'une seconde barre. Un glissement depuis le bas la
  // fait réapparaître un instant. Aussi déclaré dans `app.json` (plugin
  // `expo-navigation-bar`) pour qu'elle soit masquée dès le lancement.
  useEffect(() => {
    if (Platform.OS === 'android') NavigationBar.setHidden(true);
  }, []);

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
      <Stack.Protected guard={!hasSession}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={hasSession && !household}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={hasSession && !!household}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Enregistre la session et remet l'app à zéro si le compte a changé —
  // avant que les écrans du nouveau compte ne lancent leurs requêtes.
  const setSession = useApplySession();
  const [isSessionReady, setIsSessionReady] = useState(false);
  // Titres de l'onboarding (demande explicite) — voir `ONBOARDING_TITLE_FONT`
  // dans `step-shell.tsx` pour l'usage.
  const [fontsLoaded] = useFonts({
    Provicali: require('@/assets/fonts/Provicali.otf'),
    Tondu: require('@/assets/fonts/Tondu.ttf'),
  });
  // Fond de la racine de l'app, pour que la zone que `AppTabBar` laisse
  // transparente (demande explicite) révèle la bonne couleur au lieu du
  // noir par défaut du conteneur réservé par React Navigation.
  const backgroundColor = useThemeBackground();

  // URL de retour d'Auth (confirmation, réinitialisation) reçues pendant
  // que l'app tourne déjà (mobile).
  useAuthRedirectListener();

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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      <QueryClientProvider client={queryClient}>
        <HeroUINativeProvider>
          <ThemeProvider
            value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <AnimatedSplashOverlay />
            {isSessionReady && fontsLoaded ? <AuthGate /> : null}
          </ThemeProvider>
        </HeroUINativeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/navigation/tab-bar';

const HUB_DESTINATIONS = [
  'demarches',
  'ensemble',
  'sante',
  'partenaire',
  'naissance',
] as const;

/**
 * Icônes réelles (Ionicons) et rendu de la barre entièrement délégués à
 * `AppTabBar` (carte flottante + indicateur animé) — voir
 * `src/components/navigation/tab-bar.tsx` pour le détail et le
 * raisonnement. `title` reste ici, c'est le seul champ que `AppTabBar` lit
 * depuis `options`. CONCEPT.md nomme les 4 onglets en anglais (Home / User
 * / Information / Setting) même si le reste des textes est en français —
 * gardé tel quel.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profil" options={{ title: 'User' }} />
      <Tabs.Screen name="informations" options={{ title: 'Information' }} />
      <Tabs.Screen name="reglages" options={{ title: 'Setting' }} />

      {/* Destinations ouvertes depuis le hub, pas des onglets : la barre
          reste à 4 entrées fixes (CONCEPT.md). `href: null` les retire de
          la barre sans les retirer de la navigation. */}
      {HUB_DESTINATIONS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

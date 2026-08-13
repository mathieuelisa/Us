import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/navigation/tab-bar';

const HUB_DESTINATIONS = [
  'demarches',
  'ensemble',
  'sante',
  'organisation',
  'partenaire',
  'naissance',
] as const;

// Destination ouverte depuis Réglages (sous-section Confidentialité), pas
// depuis le hub — gardée à part de HUB_DESTINATIONS pour ne pas brouiller
// son nom, même traitement `href: null`.
const SETTINGS_DESTINATIONS = ['legal'] as const;

/**
 * Icônes réelles (Ionicons) et rendu de la barre entièrement délégués à
 * `AppTabBar` (carte flottante + indicateur animé) — voir
 * `src/components/navigation/tab-bar.tsx` pour le détail et le
 * raisonnement. `title` reste ici, c'est le seul champ que `AppTabBar` lit
 * depuis `options`.
 *
 * ⚠️ CONCEPT.md nomme les 4 onglets en anglais (Home / User / Information /
 * Setting) ; demande explicite de traduire les libellés visibles en
 * français (Accueil / Profil / Information / Réglages). Les noms de route
 * (`index`, `profil`, `reglages`…) et les clés `TAB_ICONS` restent en
 * anglais/français mêlé sans lien avec ce choix — seul le libellé affiché
 * change.
 */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
      <Tabs.Screen name="informations" options={{ title: 'Information' }} />
      <Tabs.Screen name="reglages" options={{ title: 'Réglages' }} />

      {/* Destinations ouvertes depuis le hub, pas des onglets : la barre
          reste à 4 entrées fixes (CONCEPT.md). `href: null` les retire de
          la barre sans les retirer de la navigation. */}
      {HUB_DESTINATIONS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
      {SETTINGS_DESTINATIONS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

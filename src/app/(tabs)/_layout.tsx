import { Tabs } from 'expo-router';
import { Text } from 'react-native';

const HUB_DESTINATIONS = [
  'demarches',
  'ensemble',
  'sante',
  'partenaire',
  'naissance',
] as const;

/**
 * Emoji placeholders — swap for the real icon set once the Hi-Fi tab bar
 * assets are implemented (see DOCS/01-DESIGN-OVERVIEW.md). CONCEPT.md names
 * the 4 tabs in English (Home / User / Information / Setting) even though
 * the rest of the app copy is French — kept as specified.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2D5E5A',
        tabBarInactiveTintColor: '#9a9a9a',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'User',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="informations"
        options={{
          title: 'Information',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>ℹ️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="reglages"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>⚙️</Text>
          ),
        }}
      />

      {/* Destinations ouvertes depuis le hub, pas des onglets : la barre
          reste à 4 entrées fixes (CONCEPT.md). `href: null` les retire de
          la barre sans les retirer de la navigation. */}
      {HUB_DESTINATIONS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

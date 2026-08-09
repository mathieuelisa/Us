import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { darkenHex } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

type IconPair = {
  outline: IoniconName;
  filled: IoniconName;
};

/**
 * Sous-ensemble de `BottomTabBarProps` (react-navigation), redéfini
 * localement : le package n'est pas une dépendance directe du projet
 * (`expo-router` embarque sa propre copie en interne, sans l'exposer) —
 * seuls les champs réellement utilisés ici sont typés. `_layout.tsx` passe
 * les vraies props sans les annoter explicitement (typage contextuel), donc
 * ce type n'a besoin d'être compatible que par duck-typing.
 */
type AppTabBarNavigation = {
  emit(event: { type: string; target: string; canPreventDefault: boolean }): {
    defaultPrevented: boolean;
  };
  navigate(name: string): void;
};

type AppTabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  // `unknown` + cast local (pas un type structurel précis) : le type réel
  // d'expo-router (`navigation.emit` générique sur les noms d'événements)
  // n'est pas assignable à une signature simple, même en syntaxe méthode
  // (bivariance). Recopier fidèlement ce générique demanderait d'importer
  // depuis le chemin interne d'expo-router — plus fragile que ce cast.
  navigation: unknown;
  insets: { bottom: number };
};

/** Une seule paire d'icônes par onglet fixe (CONCEPT.md) — pas de fallback,
 * la liste des routes visibles ne bouge pas. */
const TAB_ICONS: Record<string, IconPair> = {
  index: { outline: 'home-outline', filled: 'home' },
  profil: { outline: 'person-outline', filled: 'person' },
  informations: {
    outline: 'information-circle-outline',
    filled: 'information-circle',
  },
  reglages: { outline: 'settings-outline', filled: 'settings' },
};

const INACTIVE_COLOR = '#9a9a9a';
const BAR_MARGIN = 16;
const TAB_PADDING = 4;

/**
 * Barre de navigation basse personnalisée (remplace le rendu par défaut de
 * `Tabs`, cf. `_layout.tsx`). Carte flottante arrondie plutôt qu'une barre
 * plate collée au bord — demande explicite de s'inspirer d'un moodboard de
 * patterns de nav mobile plutôt que de la maquette Hi-Fi (qui ne montre que
 * des icônes nues en bas d'écran, sans bar dédiée).
 *
 * Carte de la barre teintée d'un pastel de thème légèrement assombri
 * (`darkenHex`, demande explicite), l'onglet actif se détachant dessus par
 * une pastille **blanche** qui glisse (Reanimated) plutôt que colorée —
 * inversé par rapport à la version précédente (carte blanche, pastille
 * colorée).
 *
 * ⚠️ Le conteneur réservé par `BottomTabView` autour de la carte est
 * repeint du même pastel que le fond de page plutôt que laissé en vrai
 * `transparent` (demande initiale) : en web, une vraie transparence ici
 * laisse voir le fond noir d'un backdrop de `Modal` React Native resté mal
 * masqué quand fermé (`PaywallModal`, `AppointmentFormModal`,
 * `HowItWorksModal`, `NeedNoteOverlay` — tous `bg-black/40-50`), un bug du
 * polyfill web de `Modal`, pas de ce composant. Visuellement identique à du
 * transparent tant que ce pastel reste égal au fond d'écran courant
 * (`src/app/_layout.tsx` applique le même pastel à la racine de l'app).
 *
 * Rendu en flux normal (pas de `position: absolute`) : c'est ce qui permet
 * à `BottomTabView` de réserver automatiquement la place occupée par la
 * barre au-dessus, sans quoi la pastille flotterait par-dessus le bas du
 * contenu des écrans.
 */
export function AppTabBar({
  state,
  descriptors,
  navigation: rawNavigation,
  insets,
}: AppTabBarProps) {
  const navigation = rawNavigation as AppTabBarNavigation;
  const accent = useThemeAccent();
  const pastelBackground = useThemeBackground();
  const cardBackground = darkenHex(pastelBackground, 0.06);
  const [barWidth, setBarWidth] = useState(0);

  // Seuls les 4 onglets fixes (CONCEPT.md) ont une icône : les autres
  // routes du navigateur (`HUB_DESTINATIONS` dans `_layout.tsx`, marquées
  // `href: null`) ne doivent pas apparaître dans la barre.
  const routes = state.routes.filter((route) => route.name in TAB_ICONS);
  const tabWidth = barWidth / routes.length;

  const focusedRouteKey = state.routes[state.index]?.key;
  const activeIndex = routes.findIndex(
    (route) => route.key === focusedRouteKey,
  );

  const pillStyle = useAnimatedStyle(() => ({
    width: tabWidth - TAB_PADDING * 2,
    opacity: activeIndex === -1 ? 0 : 1,
    transform: [
      {
        translateX: withTiming(
          Math.max(activeIndex, 0) * tabWidth + TAB_PADDING,
          {
            duration: 220,
          },
        ),
      },
    ],
  }));

  return (
    <View style={{ backgroundColor: pastelBackground }}>
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={{
          flexDirection: 'row',
          marginHorizontal: BAR_MARGIN,
          marginBottom:
            Math.max(insets.bottom, BAR_MARGIN / 2) + BAR_MARGIN / 2,
          borderRadius: 28,
          backgroundColor: cardBackground,
          paddingVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        {barWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 6,
                bottom: 6,
                borderRadius: 20,
                backgroundColor: '#ffffff',
              },
              pillStyle,
            ]}
          />
        ) : null}

        {routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const isFocused = activeIndex === index;
          const icons = TAB_ICONS[route.name];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: 'center',
                gap: 3,
                paddingVertical: 6,
              }}
            >
              {icons ? (
                <Ionicons
                  name={isFocused ? icons.filled : icons.outline}
                  size={22}
                  color={isFocused ? accent : INACTIVE_COLOR}
                />
              ) : null}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isFocused ? '600' : '400',
                  color: isFocused ? accent : INACTIVE_COLOR,
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

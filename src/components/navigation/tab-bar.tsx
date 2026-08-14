import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
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

const PREMIUM_ICONS: IconPair = {
  outline: 'lock-closed-outline',
  filled: 'lock-closed',
};

const INACTIVE_COLOR = '#9a9a9a';
const BAR_MARGIN = 26;
const ICON_SIZE = 22;
// Accent premium (or) — plus soutenu que le `#e8c874` utilisé sur fond sombre
// (badge de `PremiumTeaserCard`, CTA de `premium.tsx`) : ici l'icône/le
// libellé sont posés sur la carte pastel claire de la barre de nav, où cet or
// clair manquait de contraste (demande explicite). Même teinte que
// `PREMIUM_GOLD_ON_LIGHT` dans `premium.tsx`, pour rester cohérent entre les
// deux endroits où l'accent premium est lu sur fond clair.
const PREMIUM_GOLD = '#b8860b';

/**
 * Colonnes à largeur fixe (pas `flex: 1`) et rangée resserrée autour de son
 * contenu plutôt qu'étirée sur toute la largeur de la carte (demande
 * explicite : la barre à 5 entrées paraissait trop large, les icônes trop
 * espacées). Un espacement (`gap`) modeste les rapproche.
 */
const COLUMN_WIDTH = 64;
const COLUMN_GAP = 8;

// Pastille de sélection : carrée et légèrement arrondie (demande explicite,
// capture de référence à l'appui), et assez haute pour englober l'icône ET
// son libellé (déplacé à l'intérieur de la pastille, demande explicite) —
// avant, seul le libellé de l'onglet actif était affiché, mais en dehors de
// la zone blanche. `PILL_PADDING_TOP`/`PILL_PADDING_BOTTOM` fixent la
// position de l'icône de façon identique pour tous les onglets (actif ou
// non), afin qu'elle ne « saute » pas verticalement quand le libellé
// apparaît/disparaît — et la pastille reste symétrique en haut/bas dans le
// padding de la carte (le padding bas avait disparu tant que ces deux
// constantes n'étaient pas égales).
const PILL_WIDTH = COLUMN_WIDTH - 6;
const PILL_PADDING_TOP = 8;
const PILL_PADDING_BOTTOM = 8;
const ICON_LABEL_GAP = 3;
const LABEL_LINE_HEIGHT = 13;
const PILL_HEIGHT =
  PILL_PADDING_TOP +
  ICON_SIZE +
  ICON_LABEL_GAP +
  LABEL_LINE_HEIGHT +
  PILL_PADDING_BOTTOM;
const PILL_RADIUS = 16;

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
 * masqué quand fermé (`AppointmentFormModal`, `HowItWorksModal`,
 * `NeedNoteOverlay` — tous `bg-black/40-50`), un bug du polyfill web de
 * `Modal`, pas de ce composant. Visuellement identique à du transparent
 * tant que ce pastel reste égal au fond d'écran courant
 * (`src/app/_layout.tsx` applique le même pastel à la racine de l'app).
 *
 * Rendu en flux normal (pas de `position: absolute`) : c'est ce qui permet
 * à `BottomTabView` de réserver automatiquement la place occupée par la
 * barre au-dessus, sans quoi la pastille flotterait par-dessus le bas du
 * contenu des écrans.
 *
 * L'entrée Premium (dernière colonne) navigue vers la route `premium`
 * (`(tabs)/premium.tsx`, enregistrée avec `href: null` dans `_layout.tsx`)
 * plutôt que d'ouvrir un `Modal` — demande explicite : une page simple, pas
 * de modale ni d'animation d'ouverture, et la barre reste visible/utilisable
 * pendant sa consultation puisque c'est un écran du même groupe `(tabs)`.
 * Elle participe donc au même système de pastille/libellé-actif que les 4
 * onglets (5ᵉ position), avec sa propre icône (cadenas) plutôt qu'une paire
 * associée à une route de `TAB_ICONS`.
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

  // Seuls les 4 onglets fixes (CONCEPT.md) ont une icône : les autres
  // routes du navigateur (`HUB_DESTINATIONS`/`SETTINGS_DESTINATIONS` dans
  // `_layout.tsx`, marquées `href: null`) ne doivent pas apparaître dans la
  // barre — sauf `premium`, ajoutée à part en 5ᵉ colonne juste après.
  const routes = state.routes.filter((route) => route.name in TAB_ICONS);
  const premiumRoute = state.routes.find((route) => route.name === 'premium');

  const focusedRouteName = state.routes[state.index]?.name;
  const activeIndex = routes.findIndex(
    (route) => route.name === focusedRouteName,
  );
  const isPremiumFocused = focusedRouteName === 'premium';
  // Position unique de la pastille sur les 5 colonnes : les 4 onglets
  // (0-3), puis Premium (4) — `-1` si aucun des deux ne correspond (ne
  // devrait pas arriver, mais évite une pastille mal positionnée).
  const pillIndex = isPremiumFocused ? routes.length : activeIndex;

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillIndex === -1 ? 0 : 1,
    transform: [
      {
        translateX: withTiming(
          Math.max(pillIndex, 0) * (COLUMN_WIDTH + COLUMN_GAP) +
            (COLUMN_WIDTH - PILL_WIDTH) / 2,
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
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          // `alignSelf: 'center'` (plutôt qu'un simple `marginHorizontal`) :
          // la carte se resserre autour de son contenu au lieu de s'étirer
          // sur toute la largeur disponible — demande explicite, la barre à
          // 5 entrées paraissait trop large même une fois les icônes
          // resserrées entre elles.
          alignSelf: 'center',
          marginHorizontal: BAR_MARGIN,
          marginBottom:
            Math.max(insets.bottom, BAR_MARGIN / 2) + BAR_MARGIN / 2,
          borderRadius: 24,
          backgroundColor: cardBackground,
          borderWidth: 1,
          borderColor: '#2D5E5A',
          paddingHorizontal: 10,
          paddingVertical: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <View style={{ flexDirection: 'row', gap: COLUMN_GAP }}>
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 0,
                width: PILL_WIDTH,
                height: PILL_HEIGHT,
                borderRadius: PILL_RADIUS,
                backgroundColor: '#ffffff',
              },
              pillStyle,
            ]}
          />

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
                  width: COLUMN_WIDTH,
                  alignItems: 'center',
                  gap: ICON_LABEL_GAP,
                  paddingTop: PILL_PADDING_TOP,
                  paddingBottom: PILL_PADDING_BOTTOM,
                }}
              >
                {icons ? (
                  <Ionicons
                    name={isFocused ? icons.filled : icons.outline}
                    size={ICON_SIZE}
                    color={isFocused ? accent : INACTIVE_COLOR}
                  />
                ) : null}
                {/* Libellé toujours affiché, actif ou non (demande
                    explicite) — reste à l'intérieur de la pastille blanche
                    pour l'onglet actif (demande explicite précédente). */}
                <Text
                  style={{
                    fontSize: 11,
                    lineHeight: LABEL_LINE_HEIGHT,
                    fontWeight: isFocused ? '600' : '400',
                    color: isFocused ? accent : INACTIVE_COLOR,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}

          {premiumRoute ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={isPremiumFocused ? { selected: true } : {}}
              accessibilityLabel="Premium"
              onPress={() => {
                if (!isPremiumFocused) {
                  navigation.navigate('premium');
                }
              }}
              style={{
                width: COLUMN_WIDTH,
                alignItems: 'center',
                gap: ICON_LABEL_GAP,
                paddingTop: PILL_PADDING_TOP,
                paddingBottom: PILL_PADDING_BOTTOM,
              }}
            >
              <Ionicons
                name={
                  isPremiumFocused
                    ? PREMIUM_ICONS.filled
                    : PREMIUM_ICONS.outline
                }
                size={ICON_SIZE}
                color={PREMIUM_GOLD}
              />
              <Text
                style={{
                  fontSize: 11,
                  lineHeight: LABEL_LINE_HEIGHT,
                  fontWeight: isPremiumFocused ? '600' : '400',
                  color: PREMIUM_GOLD,
                }}
              >
                Premium
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

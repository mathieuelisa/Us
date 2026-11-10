import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { darkenHex, hexToRgba, lightenHex } from '@/lib/color';

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

const INACTIVE_COLOR = '#8f8f99';
const ACTIVE_CONTENT_COLOR = '#ffffff';
// Accent premium (or) — plus soutenu que le `#e8c874` utilisé sur fond sombre
// (badge de `PremiumTeaserCard`, CTA de `premium.tsx`) : ici l'icône/le
// libellé sont posés sur la carte claire de la barre de nav, où cet or clair
// manquait de contraste. Même teinte que `PREMIUM_GOLD_ON_LIGHT`.
const PREMIUM_GOLD = '#b8860b';

const BAR_MARGIN = 16;
const BAR_RADIUS = 34;
const BAR_PADDING_X = 8;
const BAR_PADDING_Y = 6;
const ICON_SIZE = 22;

/**
 * Colonnes à largeur fixe : 5 × 60 + 4 × 4 + marges tient dans un écran de
 * 375 pt (iPhone SE/mini), là où la version précédente débordait.
 */
const COLUMN_WIDTH = 60;
const COLUMN_GAP = 4;
const COLUMN_STRIDE = COLUMN_WIDTH + COLUMN_GAP;

const ITEM_PADDING_Y = 8;
const ICON_LABEL_GAP = 3;
const LABEL_LINE_HEIGHT = 13;
const ITEM_HEIGHT =
  ITEM_PADDING_Y +
  ICON_SIZE +
  ICON_LABEL_GAP +
  LABEL_LINE_HEIGHT +
  ITEM_PADDING_Y;

/**
 * Bulle de l'onglet actif : plus large et plus haute qu'une colonne, elle
 * **dépasse** du haut de la barre. Le contenu de l'onglet actif remonte de
 * `ACTIVE_LIFT` pour rester centré dans la bulle (centre de la bulle =
 * centre du contenu − `ACTIVE_LIFT`).
 */
const BUBBLE_WIDTH = 70;
const BUBBLE_HEIGHT = 66;
const BUBBLE_TOP = -17;
const ACTIVE_LIFT = ITEM_HEIGHT / 2 - (BUBBLE_TOP + BUBBLE_HEIGHT / 2);
// Bulle « organique » plutôt qu'un cercle parfait : coins légèrement
// asymétriques, plus haute à gauche — dessinée en SVG pour porter un dégradé.
const BUBBLE_PATH =
  'M33 1.5C51 0.5 63 11 63 31C63 52 52 65 31 65C12 65 1 54 1 34C1 13 13 2.5 33 1.5Z';

/**
 * Hauteur réservée au-dessus de la carte pour la bulle qui dépasse **et**
 * ses traits (jusqu'à 12 pt au-dessus d'elle) : hors de cette zone, ils
 * seraient rognés par le conteneur de `BottomTabView`.
 */
const BUBBLE_OVERFLOW = -BUBBLE_TOP - BAR_PADDING_Y + 14;

const DOT_SIZE = 6;

const SPRING = { damping: 15, stiffness: 190, mass: 0.9 };

/**
 * Trois petits traits qui « jaillissent » du coin haut-gauche de la bulle à
 * chaque changement d'onglet. Coordonnées relatives à la bulle : chaque
 * trait est posé le long d'un rayon partant de ce coin, orienté selon ce
 * même rayon.
 */
const SPARKS = [
  { left: 3, top: -12, rotate: '-15deg' },
  { left: -3.5, top: -8.5, rotate: '-45deg' },
  { left: -7, top: -2, rotate: '-75deg' },
];
const SPARK_WIDTH = 3;
const SPARK_HEIGHT = 9;

/**
 * Barre de navigation basse personnalisée (remplace le rendu par défaut de
 * `Tabs`, cf. `_layout.tsx`).
 *
 * Carte flottante en forme de gélule, blanche translucide et cerclée d'un
 * filet de la couleur d'accent. L'onglet actif est porté par une **bulle**
 * au dégradé d'accent qui déborde au-dessus de la carte, avec icône et
 * libellé en blanc ; elle glisse d'un onglet à l'autre avec un ressort,
 * rebondit à l'arrivée et fait jaillir trois petits traits, tandis qu'un
 * point d'accent la suit sur le bord bas de la carte (demande explicite,
 * capture de référence à l'appui). Premium garde son or, bulle comprise.
 *
 * ⚠️ Le conteneur réservé par `BottomTabView` autour de la carte est
 * repeint du même pastel que le fond de page plutôt que laissé en vrai
 * `transparent` : en web, une vraie transparence ici laisse voir le fond
 * noir d'un backdrop de `Modal` React Native resté mal masqué quand fermé
 * (`AppointmentFormModal`, `HowItWorksModal`, `NeedNoteOverlay`), un bug du
 * polyfill web de `Modal`, pas de ce composant.
 *
 * Rendu en flux normal (pas de `position: absolute`) : c'est ce qui permet
 * à `BottomTabView` de réserver automatiquement la place occupée par la
 * barre — bulle débordante comprise, via `BUBBLE_OVERFLOW`.
 *
 * L'entrée Premium (dernière colonne) navigue vers la route `premium`
 * (`(tabs)/premium.tsx`, enregistrée avec `href: null` dans `_layout.tsx`)
 * plutôt que d'ouvrir un `Modal` : la barre reste visible pendant sa
 * consultation. Elle participe au même système de bulle que les 4 onglets
 * (5ᵉ position), avec sa propre icône (cadenas).
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
  // Position unique de la bulle sur les 5 colonnes : les 4 onglets (0-3),
  // puis Premium (4) — `-1` si aucun ne correspond (route masquée de la
  // barre, ex. un écran du hub) : la bulle s'efface alors.
  const bubbleIndex = isPremiumFocused ? routes.length : activeIndex;
  const bubbleColor = isPremiumFocused ? PREMIUM_GOLD : accent;

  const bubbleX = useSharedValue(Math.max(bubbleIndex, 0) * COLUMN_STRIDE);
  const bubbleScale = useSharedValue(1);
  const sparkProgress = useSharedValue(1);

  useEffect(() => {
    if (bubbleIndex === -1) return;
    bubbleX.value = withSpring(bubbleIndex * COLUMN_STRIDE, SPRING);
    // Petit écrasement puis rebond à l'arrivée, et les traits ne jaillissent
    // qu'une fois la bulle presque posée.
    bubbleScale.value = withSequence(
      withTiming(0.86, { duration: 110 }),
      withSpring(1, { damping: 8, stiffness: 230 }),
    );
    sparkProgress.value = 0;
    sparkProgress.value = withDelay(
      160,
      withSpring(1, { damping: 10, stiffness: 200 }),
    );
  }, [bubbleIndex, bubbleX, bubbleScale, sparkProgress]);

  const isBubbleVisible = bubbleIndex !== -1;

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubbleX.value + (COLUMN_WIDTH - BUBBLE_WIDTH) / 2 },
      { scale: bubbleScale.value },
    ],
  }));

  const sparksStyle = useAnimatedStyle(() => ({
    opacity: sparkProgress.value,
    transform: [{ scale: 0.4 + 0.6 * sparkProgress.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleX.value + (COLUMN_WIDTH - DOT_SIZE) / 2 }],
  }));

  return (
    <View
      style={{
        backgroundColor: pastelBackground,
        paddingTop: BUBBLE_OVERFLOW,
      }}
    >
      <View
        style={{
          alignSelf: 'center',
          marginHorizontal: BAR_MARGIN,
          marginBottom: Math.max(insets.bottom, 12) + 8,
          borderRadius: BAR_RADIUS,
          backgroundColor: 'rgba(255, 255, 255, 0.78)',
          borderWidth: 1.5,
          borderColor: hexToRgba(accent, 0.35),
          paddingHorizontal: BAR_PADDING_X,
          paddingVertical: BAR_PADDING_Y,
          shadowColor: accent,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.18,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <View style={{ flexDirection: 'row', gap: COLUMN_GAP }}>
          {isBubbleVisible ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: BUBBLE_TOP,
                  left: 0,
                  width: BUBBLE_WIDTH,
                  height: BUBBLE_HEIGHT,
                  borderRadius: BUBBLE_HEIGHT / 2,
                  shadowColor: bubbleColor,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 10,
                },
                bubbleStyle,
              ]}
            >
              <Svg
                width={BUBBLE_WIDTH}
                height={BUBBLE_HEIGHT}
                // Tracé dessiné sur 64 × 66, étiré à la largeur de la bulle.
                viewBox="0 0 64 66"
                preserveAspectRatio="none"
              >
                <Defs>
                  <LinearGradient
                    id="tabBubbleGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <Stop
                      offset="0"
                      stopColor={lightenHex(bubbleColor, 0.14)}
                    />
                    <Stop offset="1" stopColor={darkenHex(bubbleColor, 0.08)} />
                  </LinearGradient>
                </Defs>
                <Path d={BUBBLE_PATH} fill="url(#tabBubbleGradient)" />
                {/* Reflet doux en haut à gauche : donne du volume à la bulle. */}
                <Ellipse
                  cx={22}
                  cy={16}
                  rx={14}
                  ry={8}
                  fill="#ffffff"
                  opacity={0.16}
                />
              </Svg>

              <Animated.View
                style={[{ position: 'absolute', top: 0, left: 0 }, sparksStyle]}
              >
                {SPARKS.map((spark) => (
                  <View
                    key={spark.rotate}
                    style={{
                      position: 'absolute',
                      left: spark.left,
                      top: spark.top,
                      width: SPARK_WIDTH,
                      height: SPARK_HEIGHT,
                      borderRadius: SPARK_WIDTH / 2,
                      backgroundColor: bubbleColor,
                      transform: [{ rotate: spark.rotate }],
                    }}
                  />
                ))}
              </Animated.View>
            </Animated.View>
          ) : null}

          {routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;
            const isFocused = activeIndex === index;
            const icons = TAB_ICONS[route.name];

            return (
              <TabItem
                key={route.key}
                label={label}
                icon={isFocused ? icons.filled : icons.outline}
                restColor={INACTIVE_COLOR}
                isFocused={isFocused}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              />
            );
          })}

          {premiumRoute ? (
            <TabItem
              label="Premium"
              icon={
                isPremiumFocused ? PREMIUM_ICONS.filled : PREMIUM_ICONS.outline
              }
              restColor={PREMIUM_GOLD}
              isFocused={isPremiumFocused}
              onPress={() => {
                if (!isPremiumFocused) {
                  navigation.navigate('premium');
                }
              }}
            />
          ) : null}

          {isBubbleVisible ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  // Posé à cheval sur le bord bas de la carte.
                  top: ITEM_HEIGHT + BAR_PADDING_Y - DOT_SIZE / 2,
                  left: 0,
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: DOT_SIZE / 2,
                  backgroundColor: bubbleColor,
                },
                dotStyle,
              ]}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

/**
 * Une colonne de la barre. Le contenu de l'onglet actif remonte (ressort)
 * pour se centrer dans la bulle débordante et passe en blanc ; au repos, il
 * reprend sa couleur propre (gris, ou or pour Premium).
 *
 * Le passage au blanc est un fondu **retardé** entre deux calques (couleur
 * de repos / blanc) plutôt qu'un changement de couleur immédiat : sinon le
 * libellé devient blanc sur la carte claire pendant que la bulle est encore
 * en route, et disparaît une fraction de seconde.
 */
function TabItem({
  label,
  icon,
  restColor,
  isFocused,
  onPress,
}: {
  label: string;
  icon: IoniconName;
  restColor: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const lift = useSharedValue(isFocused ? -ACTIVE_LIFT : 0);
  const whiteness = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    lift.value = withSpring(isFocused ? -ACTIVE_LIFT : 0, SPRING);
    whiteness.value = isFocused
      ? withDelay(140, withTiming(1, { duration: 160 }))
      : withTiming(0, { duration: 120 });
  }, [isFocused, lift, whiteness]);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));
  const restLayerStyle = useAnimatedStyle(() => ({
    opacity: 1 - whiteness.value,
  }));
  const whiteLayerStyle = useAnimatedStyle(() => ({
    opacity: whiteness.value,
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: COLUMN_WIDTH, height: ITEM_HEIGHT }}
    >
      <Animated.View style={liftStyle}>
        <Animated.View style={restLayerStyle}>
          <TabItemContent
            label={label}
            icon={icon}
            color={restColor}
            isFocused={isFocused}
          />
        </Animated.View>
        <Animated.View
          style={[
            { position: 'absolute', top: 0, left: 0, right: 0 },
            whiteLayerStyle,
          ]}
        >
          <TabItemContent
            label={label}
            icon={icon}
            color={ACTIVE_CONTENT_COLOR}
            isFocused={isFocused}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function TabItemContent({
  label,
  icon,
  color,
  isFocused,
}: {
  label: string;
  icon: IoniconName;
  color: string;
  isFocused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        gap: ICON_LABEL_GAP,
        paddingVertical: ITEM_PADDING_Y,
      }}
    >
      <Ionicons name={icon} size={ICON_SIZE} color={color} />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 11,
          lineHeight: LABEL_LINE_HEIGHT,
          fontWeight: isFocused ? '600' : '500',
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

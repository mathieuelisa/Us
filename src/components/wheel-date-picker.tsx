import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { CARD_SHADOW } from '@/features/hub/constants';

const MONTH_LABELS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

const WEEKDAY_LABELS = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
];

/** Hauteur d'une ligne : c'est l'unité de snap de toutes les molettes. */
const ITEM_HEIGHT = 40;
/** Impair, pour qu'une ligne tombe pile au centre du bandeau de sélection. */
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const WHEEL_PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

function daysInMonth(year: number, month: number): number {
  // `month` est 1-indexé ; le jour 0 du mois suivant = dernier jour du mois.
  return new Date(year, month, 0).getDate();
}

function toIsoDate(year: number, month: number, day: number): string {
  const clampedDay = Math.min(day, daysInMonth(year, month));
  return `${year}-${String(month).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
}

function parseIsoDate(value: string | null): {
  year: number;
  month: number;
  day: number;
} {
  const today = new Date();
  if (value) {
    const [year, month, day] = value.split('-').map(Number);
    if (year && month && day) return { year, month, day };
  }
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
}

type WheelItem = { value: number; label: string };

function WheelRow({
  item,
  index,
  offset,
}: {
  item: WheelItem;
  index: number;
  offset: SharedValue<number>;
}) {
  // Distance signée (en lignes) entre cette ligne et le centre de la molette :
  // c'est elle qui pilote la rotation, l'échelle et l'opacité, donc le rendu
  // « cylindre » qui distingue une vraie molette d'une simple liste.
  const animatedStyle = useAnimatedStyle(() => {
    const distance = offset.value / ITEM_HEIGHT - index;
    const absolute = Math.abs(distance);

    return {
      opacity: interpolate(
        absolute,
        [0, 1, 2, 3],
        [1, 0.55, 0.28, 0.14],
        Extrapolation.CLAMP,
      ),
      transform: [
        { perspective: 420 },
        {
          rotateX: `${interpolate(
            distance,
            [-2.5, 0, 2.5],
            [58, 0, -58],
            Extrapolation.CLAMP,
          )}deg`,
        },
        {
          scale: interpolate(
            absolute,
            [0, 1, 2],
            [1, 0.88, 0.78],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  // Pas de zone tactile par ligne : l'inclinaison rapproche visuellement les
  // lignes du centre sans déplacer leur zone de toucher d'autant, si bien qu'un
  // appui « sur mars » tombait sur avril. La molette se manipule donc au
  // défilement seul, comme le picker natif iOS.
  return (
    <Animated.View
      style={[{ height: ITEM_HEIGHT }, animatedStyle]}
      className="items-center justify-center"
    >
      <Text
        numberOfLines={1}
        className="text-[19px] leading-[24px] text-[#1a1a1a]"
      >
        {item.label}
      </Text>
    </Animated.View>
  );
}

function WheelColumn({
  items,
  selected,
  onSelect,
  accessibilityLabel,
  flex,
}: {
  items: WheelItem[];
  selected: number;
  onSelect: (value: number) => void;
  accessibilityLabel: string;
  flex: number;
}) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const offset = useSharedValue(0);
  // Index réellement affiché sous le bandeau. Sert à ne remonter au parent que
  // les vrais changements, et à ne repositionner la molette que quand la
  // valeur change *de l'extérieur* (ex. 31 janvier → février, ramené à 28).
  const settledIndexRef = useRef(-1);
  // Un repositionnement programmatique ne doit pas être relu comme un choix de
  // l'utilisateur : sans ce garde-fou, recaler la colonne des jours après un
  // changement de mois renverrait la valeur recalée au parent.
  const isScrollingProgrammaticallyRef = useRef(false);
  const commitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedIndex = Math.max(
    items.findIndex((item) => item.value === selected),
    0,
  );

  const scrollHandler = useAnimatedScrollHandler((event) => {
    offset.value = event.contentOffset.y;
  });

  const clearCommitTimeout = () => {
    if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    commitTimeoutRef.current = null;
  };

  const scrollToIndex = (index: number, animated: boolean) => {
    clearCommitTimeout();
    settledIndexRef.current = index;
    isScrollingProgrammaticallyRef.current = true;
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated });
    // Laisse passer les événements de défilement provoqués par ce `scrollTo`.
    setTimeout(() => {
      isScrollingProgrammaticallyRef.current = false;
    }, 80);
  };

  useEffect(
    () => () => {
      if (commitTimeoutRef.current) clearTimeout(commitTimeoutRef.current);
    },
    [],
  );

  /**
   * La valeur n'est remontée qu'une fois la molette immobile (dernier
   * événement de défilement suivi d'un silence). Remonter chaque ligne
   * traversée pendant le geste faisait ré-entrer les colonnes les unes dans
   * les autres : un mois court raccourcit la liste des jours, qui se recale, ce
   * qui déplace la molette encore en mouvement.
   *
   * Ce minuteur remplace `onMomentumScrollEnd`/`onScrollEndDrag`, qui ne se
   * déclenchent pas pour un défilement à la molette de souris sur le web.
   */
  const scheduleCommit = () => {
    clearCommitTimeout();
    commitTimeoutRef.current = setTimeout(() => {
      commitTimeoutRef.current = null;
      if (isScrollingProgrammaticallyRef.current) return;

      const index = Math.min(
        Math.max(Math.round(offset.value / ITEM_HEIGHT), 0),
        items.length - 1,
      );
      if (index === settledIndexRef.current) return;
      settledIndexRef.current = index;
      onSelect(items[index].value);
    }, 160);
  };

  const activeIndex = useDerivedValue(() =>
    Math.min(
      Math.max(Math.round(offset.value / ITEM_HEIGHT), 0),
      items.length - 1,
    ),
  );

  useAnimatedReaction(
    () => activeIndex.value,
    (index, previous) => {
      if (previous !== null && index !== previous) {
        runOnJS(scheduleCommit)();
      }
    },
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: `scrollToIndex` est recréé à chaque rendu ; le garder en dépendance relancerait l'effet en boucle sans rien changer (il sort tôt quand l'index est déjà le bon).
  useEffect(() => {
    if (selectedIndex === settledIndexRef.current) return;
    // Recalage instantané : une animation laisserait la colonne en mouvement
    // pendant que l'utilisateur manipule encore une autre molette.
    scrollToIndex(selectedIndex, false);
  }, [selectedIndex]);

  return (
    <Animated.ScrollView
      ref={scrollRef}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
      accessibilityValue={{ text: items[selectedIndex]?.label }}
      style={{ flex, height: WHEEL_HEIGHT }}
      contentContainerStyle={{ paddingVertical: WHEEL_PADDING }}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    >
      {items.map((item, index) => (
        <WheelRow key={item.value} item={item} index={index} offset={offset} />
      ))}
    </Animated.ScrollView>
  );
}

/**
 * Sélecteur de date en trois molettes verticales (jour / mois / année), à la
 * manière du picker iOS mais posé dans une carte : bandeau de sélection au
 * centre, lignes voisines inclinées et estompées, et rappel de la date
 * complète en toutes lettres sous les molettes.
 *
 * Unique sélecteur de date de l'app : onboarding, rendez-vous et informations
 * importantes. Les molettes défilent dans une `ScrollView` imbriquée dans celle
 * de l'écran ou de la modale hôte — même direction, mais c'est bien la molette
 * touchée qui capte le geste.
 */
export function WheelDatePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (isoDate: string) => void;
}) {
  const { year, month, day } = parseIsoDate(value);
  const currentYear = new Date().getFullYear();

  // Dernier jour *explicitement* choisi. Changer de mois passe par lui plutôt
  // que par `day`, sinon un aller-retour janvier → février → mars rabote le 31
  // à 28 au passage et ne le rend jamais : le jour survit au mois court, comme
  // sur le picker iOS.
  const desiredDayRef = useRef(day);

  const dayItems = Array.from(
    { length: daysInMonth(year, month) },
    (_, index) => ({ value: index + 1, label: String(index + 1) }),
  );
  const monthItems = MONTH_LABELS.map((label, index) => ({
    value: index + 1,
    label,
  }));
  const yearItems = Array.from({ length: 4 }, (_, index) => {
    const yearValue = currentYear - 1 + index;
    return { value: yearValue, label: String(yearValue) };
  });

  const weekday = WEEKDAY_LABELS[new Date(year, month - 1, day).getDay()];

  return (
    <View className="gap-2">
      <View
        style={CARD_SHADOW}
        className="overflow-hidden rounded-[20px] bg-[#ffffff] px-2 py-1"
      >
        <View style={{ height: WHEEL_HEIGHT }}>
          {/* Bandeau de sélection, derrière les molettes et transparent aux
              gestes pour ne pas bloquer le défilement. */}
          <View
            pointerEvents="none"
            style={{ top: WHEEL_PADDING, height: ITEM_HEIGHT }}
            className="absolute inset-x-1 rounded-[12px] bg-accent/10"
          />

          <View className="flex-1 flex-row">
            <WheelColumn
              items={dayItems}
              selected={day}
              onSelect={(nextDay) => {
                desiredDayRef.current = nextDay;
                onChange(toIsoDate(year, month, nextDay));
              }}
              accessibilityLabel="Jour"
              flex={0.8}
            />
            <WheelColumn
              items={monthItems}
              selected={month}
              onSelect={(nextMonth) =>
                onChange(toIsoDate(year, nextMonth, desiredDayRef.current))
              }
              accessibilityLabel="Mois"
              flex={1.4}
            />
            <WheelColumn
              items={yearItems}
              selected={year}
              onSelect={(nextYear) =>
                onChange(toIsoDate(nextYear, month, desiredDayRef.current))
              }
              accessibilityLabel="Année"
              flex={1}
            />
          </View>
        </View>
      </View>

      {/* Tant que rien n'a été choisi, la molette affiche la date du jour sans
          qu'elle soit pour autant la valeur du formulaire : le dire ici évite
          de laisser croire qu'une date est déjà retenue alors que le bouton
          « Suivant » reste désactivé. */}
      <Text className="text-center text-[13px] text-[#9a9a9a]">
        {value === null
          ? 'Faites défiler pour choisir la date'
          : `${weekday} ${day} ${MONTH_LABELS[month - 1]} ${year}`}
      </Text>
    </View>
  );
}

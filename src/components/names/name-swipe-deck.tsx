import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { FavoriteHeart } from '@/components/names/favorite-heart';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import {
  GENDER_META,
  getNameCountries,
  type NameCard,
  type NameGender,
} from '@/features/names/catalog';
import { hexToRgba } from '@/lib/color';

const CARD_HEIGHT = 360;
/** Au-delà de cette distance (ou de cette vitesse), la carte part. */
const SWIPE_DISTANCE = 110;
const SWIPE_VELOCITY = 800;
const FLY_OFF = 640;

export type SwipeCommand = { direction: 'left' | 'right'; id: number } | null;

/**
 * Paquet de cartes du match des prénoms (demande explicite) : un prénom par
 * carte, glisser à droite pour le garder, à gauche pour l'écarter ;
 * toucher la carte l'ajoute aux favoris (ou l'en retire).
 *
 * Seules les deux premières cartes sont rendues : celle du dessus, qui suit
 * le doigt, et la suivante, en retrait, qui avance à mesure que la première
 * s'éloigne. `command` permet aux boutons sous le paquet de déclencher le
 * même départ animé qu'un geste.
 */
export function NameSwipeDeck({
  cards,
  gender,
  favorites,
  command,
  onSwipe,
  onToggleFavorite,
}: {
  cards: NameCard[];
  gender: NameGender;
  /** Prénoms en favori (pour le cœur de la carte). */
  favorites: Set<string>;
  command: SwipeCommand;
  onSwipe: (card: NameCard, liked: boolean) => void;
  onToggleFavorite: (card: NameCard) => void;
}) {
  const [top, next] = cards;
  // Progression du départ de la carte du dessus (0 → 1), partagée avec la
  // suivante pour qu'elle avance en même temps.
  const progress = useSharedValue(0);

  const nextStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [16, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.94, 1]) },
    ],
    opacity: interpolate(progress.value, [0, 1], [0.7, 1]),
  }));

  return (
    <View style={{ height: CARD_HEIGHT + 20 }}>
      {next ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', left: 0, right: 0 }, nextStyle]}
        >
          <CardFace
            card={next}
            gender={gender}
            isFavorite={favorites.has(next.name)}
          />
        </Animated.View>
      ) : null}
      {top ? (
        <TopCard
          // Remontée à chaque nouveau prénom : position et rotation
          // repartent de zéro.
          key={top.name}
          card={top}
          gender={gender}
          isFavorite={favorites.has(top.name)}
          command={command}
          progress={progress}
          onSwipe={onSwipe}
          onToggleFavorite={onToggleFavorite}
        />
      ) : null}
    </View>
  );
}

function TopCard({
  card,
  gender,
  isFavorite,
  command,
  progress,
  onSwipe,
  onToggleFavorite,
}: {
  card: NameCard;
  gender: NameGender;
  isFavorite: boolean;
  command: SwipeCommand;
  progress: { value: number };
  onSwipe: (card: NameCard, liked: boolean) => void;
  onToggleFavorite: (card: NameCard) => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: on ne réagit qu'au changement de commande ; `progress` et les valeurs animées sont stables.
  useEffect(() => {
    progress.value = 0;
  }, []);

  const finish = (liked: boolean) => onSwipe(card, liked);
  const toggleFavorite = () => onToggleFavorite(card);

  const flyOff = (direction: 1 | -1) => {
    'worklet';
    progress.value = withTiming(1, { duration: 220 });
    translateX.value = withTiming(
      direction * FLY_OFF,
      { duration: 240 },
      (done) => {
        if (done) runOnJS(finish)(direction === 1);
      },
    );
  };

  // Commande déjà présente quand la carte arrive : elle visait la carte
  // précédente, il ne faut pas la rejouer (sinon un seul appui sur un
  // bouton fait partir toutes les cartes à la suite).
  const commandAtMount = useRef(command?.id);

  // biome-ignore lint/correctness/useExhaustiveDependencies: déclenché seulement par une nouvelle commande des boutons.
  useEffect(() => {
    if (!command || command.id === commandAtMount.current) return;
    flyOff(command.direction === 'right' ? 1 : -1);
  }, [command?.id]);

  const pan = Gesture.Pan()
    .minDistance(6)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.25;
      progress.value = Math.min(Math.abs(event.translationX) / 220, 1);
    })
    .onEnd((event) => {
      const goesRight =
        event.translationX > SWIPE_DISTANCE || event.velocityX > SWIPE_VELOCITY;
      const goesLeft =
        event.translationX < -SWIPE_DISTANCE ||
        event.velocityX < -SWIPE_VELOCITY;
      if (goesRight || goesLeft) {
        flyOff(goesRight ? 1 : -1);
        return;
      }
      translateX.value = withSpring(0, { damping: 15, stiffness: 180 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 180 });
      progress.value = withTiming(0, { duration: 180 });
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd((_event, success) => {
      if (success) runOnJS(toggleFavorite)();
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 18}deg` },
    ],
  }));
  const keepStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [20, SWIPE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_DISTANCE, -20],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <Animated.View
        accessibilityRole="button"
        accessibilityLabel={`${card.name}. Glissez à droite pour garder, à gauche pour écarter ; touchez pour ${
          isFavorite ? 'retirer des' : 'ajouter aux'
        } favoris.`}
        style={[{ position: 'absolute', left: 0, right: 0 }, cardStyle]}
      >
        <CardFace card={card} gender={gender} isFavorite={isFavorite} />

        {/* Tampons « Gardé » / « Écarté », qui apparaissent avec le geste. */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 26,
              left: 22,
              transform: [{ rotate: '-14deg' }],
            },
            keepStyle,
          ]}
        >
          <Stamp label="GARDÉ" color="#2f9e6e" />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 26,
              right: 22,
              transform: [{ rotate: '14deg' }],
            },
            passStyle,
          ]}
        >
          <Stamp label="ÉCARTÉ" color="#d14b3a" />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

function Stamp({ label, color }: { label: string; color: string }) {
  return (
    <View
      className="rounded-[12px] px-3 py-1.5"
      style={{
        borderWidth: 3,
        borderColor: color,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
      }}
    >
      <Text
        className="text-[18px] font-extrabold"
        style={{ color, letterSpacing: 1.5 }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Face d'une carte : prénom, pays, cœur de favori. */
function CardFace({
  card,
  gender,
  isFavorite,
}: {
  card: NameCard;
  gender: NameGender;
  isFavorite: boolean;
}) {
  const meta = GENDER_META[gender];
  const countries = getNameCountries(card.countryIds);

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-[34px] px-6"
      style={{
        height: CARD_HEIGHT,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: hexToRgba(meta.color, 0.15),
        shadowColor: meta.color,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
        elevation: 6,
      }}
    >
      {/* Taches de couleur du genre, en fond. */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -70,
          right: -60,
          width: 220,
          height: 200,
          borderRadius: 110,
          backgroundColor: meta.tint,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -80,
          left: -70,
          width: 220,
          height: 190,
          borderRadius: 110,
          backgroundColor: hexToRgba(meta.tint, 0.7),
        }}
      />

      {/* Cœur de favori, animé à l'ajout (éclat rouge, petits cœurs). */}
      <View className="absolute right-4 top-4">
        <FavoriteHeart isFavorite={isFavorite} />
      </View>

      <View
        className="rounded-full px-3 py-1"
        style={{ backgroundColor: hexToRgba(meta.color, 0.1) }}
      >
        <Text className="text-[12.5px] font-bold" style={{ color: meta.color }}>
          Prénom {meta.label}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className="mt-4 text-center font-extrabold"
        style={{
          fontSize: 44,
          lineHeight: 52,
          color: GLASS_TITLE_COLOR,
          letterSpacing: -1,
        }}
      >
        {card.name}
      </Text>

      <View className="mt-4 flex-row flex-wrap justify-center gap-2">
        {countries.map((country) => (
          <View
            key={country.id}
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
          >
            <Text style={{ fontSize: 16 }}>{country.flag}</Text>
            <Text
              className="text-[13.5px] font-semibold"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {country.label}
            </Text>
          </View>
        ))}
      </View>

      <Text
        className="absolute bottom-5 text-center text-[12.5px]"
        style={{ color: GLASS_BODY_COLOR }}
      >
        Touchez la carte pour {isFavorite ? 'la retirer des' : 'l’ajouter aux'}{' '}
        favoris
      </Text>
    </View>
  );
}

/** Boutons sous le paquet : écarter, garder (même départ que le geste). */
export function SwipeButtons({
  onPass,
  onKeep,
  disabled,
}: {
  onPass: () => void;
  onKeep: () => void;
  disabled: boolean;
}) {
  return (
    <View className="flex-row items-center justify-center gap-8">
      <RoundButton
        icon="close"
        color="#d14b3a"
        label="Écarter ce prénom"
        onPress={onPass}
        disabled={disabled}
      />
      <RoundButton
        icon="checkmark"
        color="#2f9e6e"
        label="Garder ce prénom"
        onPress={onKeep}
        disabled={disabled}
      />
    </View>
  );
}

function RoundButton({
  icon,
  color,
  label,
  onPress,
  disabled,
}: {
  icon: 'close' | 'checkmark';
  color: string;
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      className="h-16 w-16 items-center justify-center rounded-full bg-white active:opacity-70"
      style={{
        opacity: disabled ? 0.4 : 1,
        borderWidth: 2,
        borderColor: hexToRgba(color, 0.25),
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
        elevation: 4,
      }}
    >
      <Ionicons name={icon} size={30} color={color} />
    </Pressable>
  );
}

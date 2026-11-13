import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import { CountryPicker } from '@/components/names/country-picker';
import {
  DEFAULT_CARD_HEIGHT,
  MIN_CARD_HEIGHT,
  NameSwipeDeck,
  SwipeButtons,
  type SwipeCommand,
} from '@/components/names/name-swipe-deck';
import { useTabBarContentInset } from '@/components/navigation/use-tab-bar-height';
import {
  FeedbackBanner,
  useFeedbackBanner,
} from '@/components/ui/feedback-banner';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import {
  buildNameDeck,
  GENDER_META,
  MAX_SELECTED_COUNTRIES,
  NAME_COUNTRIES,
  type NameCard,
  type NameGender,
} from '@/features/names/catalog';
import {
  useMyDecidedNames,
  useNameFavorites,
  useNameSwipes,
  useRecordNameSwipe,
  useToggleNameFavorite,
} from '@/features/names/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

/** Illustration de l'en-tête du choix des pays, celle de l'entrée du jeu. */
const GENDER_IMAGES = {
  girl: require('@/assets/images/Prenoms_filles.png'),
  boy: require('@/assets/images/Prenoms_garcons.png'),
} as const;

/**
 * Jeu du match des prénoms (demande explicite), ouvert depuis « Prénoms
 * filles » ou « Prénoms garçons » de `/prenoms` (`?gender=girl|boy`).
 *
 * 1. Choix des pays : 14, 3 au plus (`CountryPicker`).
 * 2. Cartes : un prénom par carte, des pays choisis, sans ceux déjà
 *    swipés. Droite = gardé (alimente « Vos matchs »), gauche = écarté,
 *    toucher = favori. Chaque choix est enregistré tout de suite
 *    (`name_swipes`), le paquet avance sans attendre la requête.
 */
export default function NameGameScreen() {
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const router = useRouter();
  const { gender: genderParam } = useLocalSearchParams<{ gender: string }>();
  const gender: NameGender = genderParam === 'boy' ? 'boy' : 'girl';
  const meta = GENDER_META[gender];
  const accent = useThemeAccent();
  const backgroundColor = useThemeBackground();
  const { feedback, showFeedback } = useFeedbackBanner();

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [deck, setDeck] = useState<NameCard[] | null>(null);
  const [command, setCommand] = useState<SwipeCommand>(null);

  const { isLoading: areSwipesLoading } = useNameSwipes();
  const decided = useMyDecidedNames(gender);
  const { data: favoriteRows = [] } = useNameFavorites();
  const favorites = new Set(
    favoriteRows
      .filter((favorite) => favorite.gender === gender)
      .map((favorite) => favorite.name),
  );
  const recordSwipe = useRecordNameSwipe();
  const toggleFavorite = useToggleNameFavorite();

  // L'écran reste monté entre deux visites (onglets) : changer de genre
  // repart du choix des pays.
  // biome-ignore lint/correctness/useExhaustiveDependencies: seul le genre doit réinitialiser le jeu.
  useEffect(() => {
    setSelectedCountries([]);
    setDeck(null);
    setCommand(null);
  }, [gender]);

  const toggleCountry = (id: string) =>
    setSelectedCountries((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= MAX_SELECTED_COUNTRIES
          ? current
          : [...current, id],
    );

  const startGame = () =>
    setDeck(buildNameDeck(gender, selectedCountries, decided));

  const handleSwipe = (card: NameCard, liked: boolean) => {
    setDeck((current) => (current ? current.slice(1) : current));
    // Commande des boutons consommée : la carte suivante ne doit pas la
    // rejouer.
    setCommand(null);
    recordSwipe.mutate(
      { gender, name: card.name, liked },
      {
        onError: () =>
          showFeedback('error', 'Ce choix n’a pas pu être enregistré.'),
      },
    );
  };

  const handleToggleFavorite = (card: NameCard) => {
    const willBeFavorite = !favorites.has(card.name);
    toggleFavorite.mutate(
      { gender, name: card.name, favorite: willBeFavorite },
      {
        onSuccess: () =>
          showFeedback(
            'success',
            willBeFavorite
              ? `${card.name} est dans vos favoris`
              : `${card.name} n’est plus dans vos favoris`,
          ),
        onError: () =>
          showFeedback('error', 'Le favori n’a pas pu être enregistré.'),
      },
    );
  };

  const goBack = () => {
    if (deck) {
      setDeck(null);
      return;
    }
    router.navigate('/prenoms');
  };

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />
      {/* Voile à la teinte du genre en haut de l'écran (capture de
          référence) : rose pour les filles, bleu pour les garçons. */}
      <LinearGradient
        pointerEvents="none"
        colors={[hexToRgba(meta.tint, 0.95), hexToRgba(meta.tint, 0)]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 460 }}
      />

      <ScrollView
        contentContainerClassName="grow gap-5 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        showsVerticalScrollIndicator={false}
        // Le paquet ne capte que les glissements horizontaux (voir
        // `NameSwipeDeck`) : un glissement vertical fait défiler l'écran,
        // utile sur un petit téléphone où tout ne tient pas.
      >
        <Pressable
          accessibilityLabel={deck ? 'Revenir au choix des pays' : 'Revenir'}
          accessibilityRole="button"
          hitSlop={12}
          onPress={goBack}
          className="h-12 w-12 items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: accent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 3,
          }}
        >
          <Ionicons name="chevron-back" size={22} color={GLASS_TITLE_COLOR} />
        </Pressable>

        {deck ? (
          <View className="gap-1.5">
            <Text
              className="text-[28px] font-extrabold leading-[34px]"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
            >
              {meta.title}
            </Text>
            <Svg width={120} height={10} viewBox="0 0 120 10">
              <Path
                d="M3 7 C 34 2, 80 1.5, 117 4"
                stroke={hexToRgba(meta.color, 0.5)}
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <Text
              className="text-[14.5px] leading-5"
              style={{ color: GLASS_BODY_COLOR }}
            >
              Glissez à droite pour garder, à gauche pour écarter.
            </Text>
          </View>
        ) : (
          // En-tête du choix des pays (capture de référence) : grand titre
          // souligné, sous-titre sur deux lignes, illustration du genre en
          // haut à droite sur une tache et un cœur.
          <View className="min-h-[132px] justify-center">
            <View
              pointerEvents="none"
              style={{ position: 'absolute', top: -46, right: -22 }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 0,
                  width: 200,
                  height: 180,
                  borderTopLeftRadius: 110,
                  borderTopRightRadius: 90,
                  borderBottomLeftRadius: 80,
                  borderBottomRightRadius: 110,
                  backgroundColor: hexToRgba(meta.color, 0.08),
                }}
              />
              <Image
                source={GENDER_IMAGES[gender]}
                style={{
                  width: 172,
                  height: 172,
                  marginLeft: 6,
                  marginTop: 14,
                  transform: [{ rotate: '6deg' }],
                }}
                resizeMode="contain"
              />
              <Ionicons
                name="heart"
                size={30}
                color={hexToRgba(meta.color, 0.75)}
                style={{
                  position: 'absolute',
                  top: 12,
                  left: 128,
                  transform: [{ rotate: '14deg' }],
                }}
              />
            </View>
            <View className="gap-2" style={{ maxWidth: '60%' }}>
              <Text
                className="text-[32px] font-extrabold leading-[38px]"
                style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.8 }}
              >
                {meta.title}
              </Text>
              <Svg width={130} height={10} viewBox="0 0 130 10">
                <Path
                  d="M3 7 C 38 2, 88 1.5, 127 4"
                  stroke={hexToRgba(meta.color, 0.6)}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              <Text
                className="text-[14.5px] leading-[21px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                Choisissez jusqu’à {MAX_SELECTED_COUNTRIES} pays d’origine pour
                découvrir des prénoms.
              </Text>
            </View>
          </View>
        )}

        {deck ? (
          <DeckStep
            deck={deck}
            gender={gender}
            favorites={favorites}
            command={command}
            selectedCountries={selectedCountries}
            onSwipe={handleSwipe}
            onToggleFavorite={handleToggleFavorite}
            onCommand={(direction) => setCommand({ direction, id: Date.now() })}
            onChangeCountries={() => setDeck(null)}
            onSeeMatches={() => router.navigate('/prenoms-matchs')}
          />
        ) : (
          <CountryPicker
            gender={gender}
            selected={selectedCountries}
            onToggle={toggleCountry}
            onStart={startGame}
            isLoading={areSwipesLoading}
          />
        )}
      </ScrollView>

      <FeedbackBanner
        message={feedback?.message ?? null}
        tone={feedback?.tone}
        accent={accent}
      />
    </SafeAreaView>
  );
}

/** Étape 2 : le paquet de cartes, ou la fin du paquet. */
function DeckStep({
  deck,
  gender,
  favorites,
  command,
  selectedCountries,
  onSwipe,
  onToggleFavorite,
  onCommand,
  onChangeCountries,
  onSeeMatches,
}: {
  deck: NameCard[];
  gender: NameGender;
  favorites: Set<string>;
  command: SwipeCommand;
  selectedCountries: string[];
  onSwipe: (card: NameCard, liked: boolean) => void;
  onToggleFavorite: (card: NameCard) => void;
  onCommand: (direction: 'left' | 'right') => void;
  onChangeCountries: () => void;
  onSeeMatches: () => void;
}) {
  // Hauteur disponible pour le paquet, mesurée (voir le rendu).
  const [deckSpace, setDeckSpace] = useState(DEFAULT_CARD_HEIGHT + 20);
  const meta = GENDER_META[gender];
  const flags = NAME_COUNTRIES.filter((country) =>
    selectedCountries.includes(country.id),
  )
    .map((country) => country.flag)
    .join(' ');

  if (deck.length === 0) {
    return (
      <Animated.View
        entering={FadeInDown.duration(260)}
        className="items-center gap-3 rounded-[30px] px-6 py-8"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)' }}
      >
        <Text style={{ fontSize: 46 }}>🎉</Text>
        <Text
          className="text-center text-[19px] font-extrabold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          Vous avez vu tous les prénoms
        </Text>
        <Text
          className="text-center text-[14px] leading-5"
          style={{ color: GLASS_BODY_COLOR }}
        >
          Choisissez d’autres pays pour en découvrir de nouveaux, ou regardez
          les prénoms sur lesquels vous êtes d’accord.
        </Text>
        <View className="mt-2 w-full gap-2.5">
          <PillButton
            label="Choisir d’autres pays"
            icon="earth-outline"
            onPress={onChangeCountries}
          />
          <Pressable
            accessibilityRole="button"
            onPress={onSeeMatches}
            className="h-12 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: hexToRgba(meta.color, 0.1) }}
          >
            <Text
              className="text-[15px] font-bold"
              style={{ color: meta.color }}
            >
              Voir vos matchs
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  return (
    // Remplit la hauteur restante de l'écran : la carte prend la place
    // disponible entre l'en-tête et les boutons, pour que ✕ / ✓ restent
    // au-dessus de la barre du bas sur tous les téléphones (demande
    // explicite, Galaxy S26 Ultra : ils passaient dessous).
    <Animated.View entering={FadeIn.duration(220)} className="flex-1 gap-4">
      <View className="flex-row items-center justify-between px-1">
        <Text style={{ fontSize: 18 }}>{flags}</Text>
        <Text
          className="text-[13px] font-semibold"
          style={{ color: meta.color }}
        >
          {deck.length} prénom{deck.length > 1 ? 's' : ''} à découvrir
        </Text>
      </View>

      <View
        className="flex-1"
        style={{ minHeight: MIN_CARD_HEIGHT + 20 }}
        onLayout={(event) => {
          const available = Math.floor(event.nativeEvent.layout.height);
          setDeckSpace((current) =>
            current === available ? current : available,
          );
        }}
      >
        {/* En position absolue : le paquet ne doit pas imposer sa hauteur
            au conteneur, sinon la mesure ne pourrait jamais rétrécir. */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
          }}
        >
          <NameSwipeDeck
            cards={deck}
            // 20 pt réservés à la carte suivante, qui dépasse en dessous.
            cardHeight={Math.max(
              MIN_CARD_HEIGHT,
              Math.min(DEFAULT_CARD_HEIGHT, deckSpace - 20),
            )}
            gender={gender}
            favorites={favorites}
            command={command}
            onSwipe={onSwipe}
            onToggleFavorite={onToggleFavorite}
          />
        </View>
      </View>

      {/* Un peu plus haut que le reste du contenu : la barre du bas
          estompe ce qui passe dans son fondu. */}
      <View style={{ marginBottom: 28 }}>
        <SwipeButtons
          onPass={() => onCommand('left')}
          onKeep={() => onCommand('right')}
          disabled={deck.length === 0}
        />
      </View>
    </Animated.View>
  );
}

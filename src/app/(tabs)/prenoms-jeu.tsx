import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import {
  NameSwipeDeck,
  SwipeButtons,
  type SwipeCommand,
} from '@/components/names/name-swipe-deck';
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

/**
 * Jeu du match des prénoms (demande explicite), ouvert depuis « Prénoms
 * filles » ou « Prénoms garçons » de `/prenoms` (`?gender=girl|boy`).
 *
 * 1. Choix des pays : une dizaine, 3 au plus.
 * 2. Cartes : un prénom par carte, des pays choisis, sans ceux déjà
 *    swipés. Droite = gardé (alimente « Vos matchs »), gauche = écarté,
 *    toucher = favori. Chaque choix est enregistré tout de suite
 *    (`name_swipes`), le paquet avance sans attendre la requête.
 */
export default function NameGameScreen() {
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

      <ScrollView
        contentContainerClassName="grow gap-5 px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
        // Le paquet capte les glissements horizontaux ; le défilement
        // vertical reste possible autour.
        scrollEnabled={!deck}
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
            {deck
              ? 'Glissez à droite pour garder, à gauche pour écarter.'
              : `Choisissez jusqu’à ${MAX_SELECTED_COUNTRIES} pays d’origine.`}
          </Text>
        </View>

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
          <CountryStep
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

/** Étape 1 : la grille des pays, 3 au plus. */
function CountryStep({
  gender,
  selected,
  onToggle,
  onStart,
  isLoading,
}: {
  gender: NameGender;
  selected: string[];
  onToggle: (id: string) => void;
  onStart: () => void;
  isLoading: boolean;
}) {
  const meta = GENDER_META[gender];
  const isFull = selected.length >= MAX_SELECTED_COUNTRIES;

  return (
    <Animated.View entering={FadeIn.duration(220)} className="gap-4">
      <View className="flex-row items-center justify-between px-1">
        <Text
          className="text-[12.5px] font-bold"
          style={{ color: '#5b5470', letterSpacing: 1.1 }}
        >
          PAYS
        </Text>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: hexToRgba(meta.color, 0.1) }}
        >
          <Text
            className="text-[12.5px] font-bold"
            style={{ color: meta.color }}
          >
            {selected.length} / {MAX_SELECTED_COUNTRIES}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-2.5">
        {NAME_COUNTRIES.map((country) => {
          const isSelected = selected.includes(country.id);
          const isDisabled = !isSelected && isFull;
          return (
            <Pressable
              key={country.id}
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: isSelected,
                disabled: isDisabled,
              }}
              accessibilityLabel={country.label}
              disabled={isDisabled}
              onPress={() => onToggle(country.id)}
              className="h-[60px] flex-row items-center gap-3 rounded-[20px] px-3.5 active:opacity-70"
              style={{
                width: '48.5%',
                opacity: isDisabled ? 0.45 : 1,
                backgroundColor: isSelected
                  ? hexToRgba(meta.color, 0.1)
                  : 'rgba(255, 255, 255, 0.92)',
                borderWidth: 1.5,
                borderColor: isSelected
                  ? hexToRgba(meta.color, 0.5)
                  : 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <Text style={{ fontSize: 26 }}>{country.flag}</Text>
              <Text
                numberOfLines={1}
                className="flex-1 text-[14.5px] font-semibold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {country.label}
              </Text>
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={isSelected ? meta.color : '#c4c2cc'}
              />
            </Pressable>
          );
        })}
      </View>

      <PillButton
        label={isLoading ? 'Chargement…' : 'Découvrir les prénoms'}
        icon="sparkles-outline"
        isDisabled={selected.length === 0 || isLoading}
        onPress={onStart}
      />
    </Animated.View>
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
    <Animated.View entering={FadeIn.duration(220)} className="gap-5">
      <View className="flex-row items-center justify-between px-1">
        <Text style={{ fontSize: 18 }}>{flags}</Text>
        <Text
          className="text-[13px] font-semibold"
          style={{ color: meta.color }}
        >
          {deck.length} prénom{deck.length > 1 ? 's' : ''} à découvrir
        </Text>
      </View>

      <NameSwipeDeck
        cards={deck}
        gender={gender}
        favorites={favorites}
        command={command}
        onSwipe={onSwipe}
        onToggleFavorite={onToggleFavorite}
      />

      <SwipeButtons
        onPass={() => onCommand('left')}
        onKeep={() => onCommand('right')}
        disabled={deck.length === 0}
      />
    </Animated.View>
  );
}

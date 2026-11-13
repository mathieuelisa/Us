import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeOutLeft,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';
import { useTabBarContentInset } from '@/components/navigation/use-tab-bar-height';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import {
  findNameCountryIds,
  GENDER_META,
  getNameCountries,
  type NameGender,
} from '@/features/names/catalog';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);
type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type NameListItem = { gender: NameGender; name: string };

const ROW_LAYOUT = LinearTransition.springify().damping(18).stiffness(170);

const LEAF_IMAGE = require('@/assets/images/Leaf_branch.png');

/**
 * Liste de prénoms du match des prénoms — « Vos matchs » et « Favoris »
 * partagent la même mise en page : retour, titre souligné avec
 * l'illustration de la liste, puis un sélecteur Garçons / Filles, l'intitulé
 * du genre avec son compteur et les cartes de prénoms (capture de référence,
 * demande explicite d'un design plus soigné). État vide illustré.
 *
 * `onRemove` (favoris) ajoute un cœur qui retire le prénom de la liste.
 */
export function NameListScreen({
  title,
  subtitle,
  icon,
  items,
  isLoading,
  emptyTitle,
  emptyText,
  image,
  itemNoun,
  sectionSubtitle,
  onRemove,
}: {
  title: string;
  subtitle: string;
  icon: IoniconName;
  items: NameListItem[];
  isLoading: boolean;
  emptyTitle: string;
  emptyText: string;
  /** Illustration 3D de la liste (celle de l'entrée du jeu). */
  image: ImageSourcePropType;
  /** Nom d'un élément pour le compteur : « 1 favori », « 2 favoris ». */
  itemNoun: { singular: string; plural: string };
  /** Sous-titre de la section d'un genre, ex. « Vos prénoms filles… ». */
  sectionSubtitle: (gender: NameGender) => string;
  onRemove?: (item: NameListItem) => void;
}) {
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const router = useRouter();
  const accent = useThemeAccent();
  const backgroundColor = useThemeBackground();

  const boys = items.filter((item) => item.gender === 'boy');
  const girls = items.filter((item) => item.gender === 'girl');
  // Garçons d'abord (capture de référence), sauf s'il n'y a que des filles.
  const [chosenGender, setChosenGender] = useState<NameGender | null>(null);
  const gender: NameGender =
    chosenGender ?? (boys.length === 0 && girls.length > 0 ? 'girl' : 'boy');
  const genderItems = gender === 'boy' ? boys : girls;
  const meta = GENDER_META[gender];

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />
      <ScrollView
        contentContainerClassName="gap-5 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Illustration de la liste en haut à droite, sur une tache —
              pas quand la liste est vide : l'état vide la reprend déjà. */}
          {items.length > 0 ? (
            <View
              pointerEvents="none"
              style={{ position: 'absolute', top: 6, right: -6 }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 18,
                  left: 10,
                  width: 120,
                  height: 104,
                  borderTopLeftRadius: 64,
                  borderTopRightRadius: 52,
                  borderBottomLeftRadius: 46,
                  borderBottomRightRadius: 64,
                  backgroundColor: hexToRgba(accent, 0.1),
                }}
              />
              <Image
                source={image}
                style={{
                  width: 140,
                  height: 140,
                  transform: [{ rotate: '8deg' }],
                }}
                resizeMode="contain"
              />
              <SparkLines
                color={hexToRgba(accent, 0.55)}
                style={{ left: -4, top: 10, transform: [{ rotate: '-70deg' }] }}
              />
            </View>
          ) : null}

          <Pressable
            accessibilityLabel="Revenir au match des prénoms"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.navigate('/prenoms')}
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

          <View className="mt-6 gap-1.5" style={{ maxWidth: '62%' }}>
            <View className="flex-row items-center gap-2.5">
              <Ionicons name={icon} size={28} color={accent} />
              <Text
                className="text-[32px] font-extrabold leading-[38px]"
                style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.8 }}
              >
                {title}
              </Text>
            </View>
            <Svg width={130} height={10} viewBox="0 0 130 10">
              <Path
                d="M3 7 C 38 2, 88 1.5, 127 4"
                stroke={hexToRgba(accent, 0.5)}
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>
          <Text
            className="mt-2 text-[14.5px] leading-5"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {subtitle}
          </Text>
        </View>

        {isLoading ? (
          <Text className="text-[13px] text-[#9a9a9a]">Chargement…</Text>
        ) : items.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(320)}
            className="items-center rounded-[28px] px-6 pb-8 pt-6"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.95)',
              shadowColor: accent,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.1,
              shadowRadius: 22,
              elevation: 4,
            }}
          >
            <EmptyIllustration image={image} accent={accent} />
            <Text
              className="mt-4 text-center text-[19px] font-extrabold"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
            >
              {emptyTitle}
            </Text>
            <Text
              className="mt-2 max-w-[280px] text-center text-[14.5px] leading-[21px]"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {emptyText}
            </Text>
          </Animated.View>
        ) : (
          <>
            <GenderToggle
              accent={accent}
              gender={gender}
              counts={{ boy: boys.length, girl: girls.length }}
              onChange={setChosenGender}
            />

            <Animated.View
              key={`section-${gender}`}
              entering={FadeInDown.duration(240)}
              className="gap-3.5"
            >
              <View className="gap-1 px-1">
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <SparkLines
                      color={hexToRgba(meta.color, 0.7)}
                      style={{
                        left: -10,
                        top: -12,
                        transform: [{ rotate: '-80deg' }, { scale: 0.75 }],
                      }}
                    />
                    <Text
                      className="text-[22px] font-extrabold"
                      style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
                    >
                      {meta.title}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: hexToRgba(meta.color, 0.12) }}
                  >
                    <Text
                      className="text-[12.5px] font-bold"
                      style={{ color: meta.color }}
                    >
                      {genderItems.length}{' '}
                      {genderItems.length > 1
                        ? itemNoun.plural
                        : itemNoun.singular}
                    </Text>
                  </View>
                </View>
                <Text
                  className="text-[14px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {sectionSubtitle(gender)}
                </Text>
              </View>

              {genderItems.length === 0 ? (
                <View
                  className="items-center gap-1.5 rounded-[24px] px-5 py-6"
                  style={{ backgroundColor: hexToRgba(meta.color, 0.06) }}
                >
                  <Ionicons
                    name={gender === 'boy' ? 'male' : 'female'}
                    size={22}
                    color={meta.color}
                  />
                  <Text
                    className="text-center text-[14px]"
                    style={{ color: GLASS_BODY_COLOR }}
                  >
                    Rien côté {meta.label}s pour l’instant.
                  </Text>
                </View>
              ) : (
                genderItems.map((item) => (
                  <NameRow
                    key={`${item.gender}-${item.name}`}
                    item={item}
                    onRemove={onRemove}
                  />
                ))
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const TOGGLE_PADDING = 5;
const GENDER_OPTIONS: {
  value: NameGender;
  label: string;
  icon: IoniconName;
}[] = [
  { value: 'boy', label: 'Garçons', icon: 'male' },
  { value: 'girl', label: 'Filles', icon: 'female' },
];

/**
 * Sélecteur Garçons / Filles : pastille d'accent qui glisse sous le genre
 * choisi, comme la bascule Connexion / Inscription. Le nombre de prénoms de
 * chaque genre suit son libellé.
 */
function GenderToggle({
  accent,
  gender,
  counts,
  onChange,
}: {
  accent: string;
  gender: NameGender;
  counts: Record<NameGender, number>;
  onChange: (gender: NameGender) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = gender === 'boy' ? 0 : 1;
  const position = useSharedValue(selectedIndex);

  useEffect(() => {
    position.value = withTiming(selectedIndex, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectedIndex, position]);

  const segmentWidth = Math.max(trackWidth - TOGGLE_PADDING * 2, 0) / 2;
  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * segmentWidth }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-full"
      style={{
        padding: TOGGLE_PADDING,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
      }}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setTrackWidth((current) => (current === width ? current : width));
      }}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: TOGGLE_PADDING,
              bottom: TOGGLE_PADDING,
              left: TOGGLE_PADDING,
              width: segmentWidth,
              borderRadius: 999,
              backgroundColor: accent,
              shadowColor: accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            },
            pillStyle,
          ]}
        />
      ) : null}
      {GENDER_OPTIONS.map((option) => {
        const isActive = option.value === gender;
        const color = isActive ? '#ffffff' : GLASS_BODY_COLOR;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${option.label}, ${counts[option.value]}`}
            onPress={() => onChange(option.value)}
            className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full"
          >
            <Ionicons name={option.icon} size={18} color={color} />
            <Text
              className="text-[15.5px]"
              style={{ color, fontWeight: isActive ? '700' : '600' }}
            >
              {option.label}
            </Text>
            {counts[option.value] > 0 ? (
              <View
                className="min-w-[22px] items-center rounded-full px-1.5 py-0.5"
                style={{
                  backgroundColor: isActive
                    ? 'rgba(255, 255, 255, 0.25)'
                    : hexToRgba(accent, 0.1),
                }}
              >
                <Text
                  className="text-[11.5px] font-bold"
                  style={{ color: isActive ? '#ffffff' : accent }}
                >
                  {counts[option.value]}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Carte d'un prénom : initiale dans une pastille à la teinte du genre, nom,
 * pays en petites gélules (drapeau + nom), cœur pour le retirer (favoris).
 * Tache pâle du genre en bas à gauche (capture de référence).
 */
function NameRow({
  item,
  onRemove,
}: {
  item: NameListItem;
  onRemove?: (item: NameListItem) => void;
}) {
  const meta = GENDER_META[item.gender];
  const countries = getNameCountries(
    findNameCountryIds(item.name, item.gender),
  );

  return (
    <Animated.View
      entering={FadeInDown.duration(240)}
      exiting={FadeOutLeft.duration(300)}
      layout={ROW_LAYOUT}
      className="flex-row items-center gap-3.5 overflow-hidden rounded-[26px] py-3.5 pl-3.5 pr-3"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: meta.color,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
        elevation: 3,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -46,
          left: -24,
          width: 170,
          height: 80,
          borderRadius: 85,
          backgroundColor: hexToRgba(meta.color, 0.06),
        }}
      />
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: meta.tint }}
      >
        <Text
          className="text-[22px] font-extrabold"
          style={{ color: meta.color }}
        >
          {item.name.charAt(0)}
        </Text>
      </View>
      <View className="flex-1 gap-1.5">
        <Text
          className="text-[18px] font-extrabold"
          style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
        >
          {item.name}
        </Text>
        {countries.length > 0 ? (
          <View className="flex-row flex-wrap gap-1.5">
            {countries.map((country) => (
              <View
                key={country.id}
                className="flex-row items-center gap-1 rounded-full px-2 py-0.5"
                style={{ backgroundColor: '#f4f3f7' }}
              >
                <Text style={{ fontSize: 13 }}>{country.flag}</Text>
                <Text
                  className="text-[12px] font-medium"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {country.label}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Retirer ${item.name} des favoris`}
          hitSlop={8}
          onPress={() => onRemove(item)}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-60"
          style={{ backgroundColor: hexToRgba('#e8739a', 0.1) }}
        >
          <Ionicons name="heart" size={22} color="#e8739a" />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

/**
 * Illustration de l'état vide (capture de référence) : l'icône 3D de la
 * liste qui flotte doucement au centre, sur une tache d'accent, devant deux
 * cartes de prénom fille et garçon inclinées — rappel du jeu — avec la
 * branche de feuillage de l'app de part et d'autre et de petits traits.
 * Composée avec les illustrations existantes, sans image dédiée.
 */
function EmptyIllustration({
  image,
  accent,
}: {
  image: ImageSourcePropType;
  accent: string;
}) {
  const float = useSharedValue(0);

  useEffect(() => {
    // Mouvement réduit : Reanimated suit le réglage du système.
    float.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [float]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -6 * float.value },
      { rotate: `${-4 + 4 * float.value}deg` },
    ],
  }));

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 250, height: 168 }}
    >
      {/* Tache rose pêche aux coins irréguliers (capture de référence),
          comme `BlobIllustration`. */}
      <View
        style={{
          position: 'absolute',
          left: 22,
          top: 18,
          width: 206,
          height: 140,
          borderTopLeftRadius: 96,
          borderTopRightRadius: 80,
          borderBottomRightRadius: 104,
          borderBottomLeftRadius: 72,
          backgroundColor: 'rgba(242, 163, 142, 0.16)',
        }}
      />

      <GhostNameCard gender="girl" letter="L" style={{ left: 42, top: 38 }} />
      <GhostNameCard gender="boy" letter="N" style={{ right: 40, top: 30 }} />

      <Image
        source={LEAF_IMAGE}
        style={{
          position: 'absolute',
          left: 4,
          bottom: 0,
          width: 84,
          height: 56,
          transform: [{ rotate: '-18deg' }],
        }}
        resizeMode="contain"
      />
      <Image
        source={LEAF_IMAGE}
        style={{
          position: 'absolute',
          right: 2,
          bottom: 8,
          width: 64,
          height: 43,
          opacity: 0.85,
          transform: [{ scaleX: -1 }, { rotate: '-24deg' }],
        }}
        resizeMode="contain"
      />

      <Animated.View
        style={[
          { position: 'absolute', left: 59, top: 8, width: 132, height: 132 },
          floatStyle,
        ]}
      >
        <Image
          source={image}
          style={{ width: 132, height: 132 }}
          resizeMode="contain"
        />
      </Animated.View>

      <SparkLines
        color={hexToRgba(accent, 0.6)}
        style={{ left: 46, top: 0, transform: [{ rotate: '-70deg' }] }}
      />
    </View>
  );
}

/** Carte de prénom estompée, inclinée derrière l'icône. */
function GhostNameCard({
  gender,
  letter,
  style,
}: {
  gender: NameGender;
  letter: string;
  style: object;
}) {
  const meta = GENDER_META[gender];
  return (
    <View
      className="items-center gap-1.5 rounded-[16px] bg-white pt-2.5"
      style={[
        {
          position: 'absolute',
          width: 62,
          height: 82,
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.05)',
          opacity: 0.92,
          transform: [{ rotate: gender === 'girl' ? '-14deg' : '12deg' }],
          shadowColor: meta.color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 2,
        },
        style,
      ]}
    >
      <View
        className="h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: meta.tint }}
      >
        <Text
          className="text-[13px] font-extrabold"
          style={{ color: meta.color }}
        >
          {letter}
        </Text>
      </View>
      <View
        className="h-1.5 w-9 rounded-full"
        style={{ backgroundColor: hexToRgba(meta.color, 0.22) }}
      />
      <View
        className="h-1.5 w-6 rounded-full"
        style={{ backgroundColor: hexToRgba(meta.color, 0.12) }}
      />
    </View>
  );
}

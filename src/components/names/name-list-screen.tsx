import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ComponentProps, useEffect } from 'react';
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
 * partagent la même mise en page : retour, titre souligné, prénoms rangés
 * par genre (filles puis garçons), état vide.
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
  emptyImage,
  onRemove,
}: {
  title: string;
  subtitle: string;
  icon: IoniconName;
  items: NameListItem[];
  isLoading: boolean;
  emptyTitle: string;
  emptyText: string;
  /** Illustration 3D de l'état vide (celle de l'entrée du jeu). */
  emptyImage: ImageSourcePropType;
  onRemove?: (item: NameListItem) => void;
}) {
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const router = useRouter();
  const accent = useThemeAccent();
  const backgroundColor = useThemeBackground();
  const groups: NameGender[] = ['girl', 'boy'];

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

        <View className="gap-1.5">
          <View className="flex-row items-center gap-2.5">
            <Ionicons name={icon} size={26} color={accent} />
            <Text
              className="text-[28px] font-extrabold leading-[34px]"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
            >
              {title}
            </Text>
          </View>
          <Svg width={120} height={10} viewBox="0 0 120 10">
            <Path
              d="M3 7 C 34 2, 80 1.5, 117 4"
              stroke={hexToRgba(accent, 0.5)}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
          <Text
            className="text-[14.5px] leading-5"
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
            <EmptyIllustration image={emptyImage} accent={accent} />
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
          groups.map((gender) => {
            const groupItems = items.filter((item) => item.gender === gender);
            if (groupItems.length === 0) return null;
            const meta = GENDER_META[gender];
            return (
              <View key={gender} className="gap-2.5">
                <Text
                  className="px-1 text-[12.5px] font-bold"
                  style={{ color: meta.color, letterSpacing: 1.1 }}
                >
                  {meta.title.toUpperCase()}
                </Text>
                {groupItems.map((item) => (
                  <Animated.View
                    key={`${item.gender}-${item.name}`}
                    entering={FadeInDown.duration(240)}
                    exiting={FadeOutLeft.duration(300)}
                    layout={ROW_LAYOUT}
                    className="flex-row items-center gap-3 rounded-[22px] py-3 pl-3 pr-3"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: meta.tint }}
                    >
                      <Text
                        className="text-[17px] font-extrabold"
                        style={{ color: meta.color }}
                      >
                        {item.name.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text
                        className="text-[16px] font-bold"
                        style={{ color: GLASS_TITLE_COLOR }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className="text-[12.5px]"
                        style={{ color: GLASS_BODY_COLOR }}
                      >
                        {getNameCountries(
                          findNameCountryIds(item.name, item.gender),
                        )
                          .map((country) => `${country.flag} ${country.label}`)
                          .join('  ·  ')}
                      </Text>
                    </View>
                    {onRemove ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Retirer ${item.name} des favoris`}
                        hitSlop={8}
                        onPress={() => onRemove(item)}
                        className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
                      >
                        <Ionicons name="heart" size={22} color="#e8739a" />
                      </Pressable>
                    ) : null}
                  </Animated.View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
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

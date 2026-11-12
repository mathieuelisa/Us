import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
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
  onRemove,
}: {
  title: string;
  subtitle: string;
  icon: IoniconName;
  items: NameListItem[];
  isLoading: boolean;
  emptyTitle: string;
  emptyText: string;
  onRemove?: (item: NameListItem) => void;
}) {
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
        contentContainerClassName="gap-5 px-5 pb-12 pt-4"
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
          <View
            className="items-center gap-2 rounded-[28px] px-6 py-8"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.92)' }}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: hexToRgba(accent, 0.1) }}
            >
              <Ionicons name={icon} size={30} color={accent} />
            </View>
            <Text
              className="mt-1 text-center text-[17px] font-extrabold"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              {emptyTitle}
            </Text>
            <Text
              className="text-center text-[14px] leading-5"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {emptyText}
            </Text>
          </View>
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

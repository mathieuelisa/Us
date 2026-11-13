import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import {
  GENDER_META,
  MAX_SELECTED_COUNTRIES,
  NAME_COUNTRIES,
  type NameCountry,
  type NameGender,
  POPULAR_COUNTRY_IDS,
} from '@/features/names/catalog';
import { hexToRgba, lightenHex } from '@/lib/color';

const LIST_LAYOUT = LinearTransition.springify().damping(18).stiffness(170);

/**
 * Étape 1 du match des prénoms : le choix des pays, d'après une capture de
 * référence (demande explicite d'un rendu « plus original et moderne ») —
 * « Pays populaires » en grandes tuiles, « Tous les pays » en
 * liste à deux colonnes avec le compteur de sélection, bouton en dégradé.
 * Teinte du genre (rose filles, bleu garçons) : un seul écran pour les
 * deux.
 */
export function CountryPicker({
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

  const popular = POPULAR_COUNTRY_IDS.map((id) =>
    NAME_COUNTRIES.find((country) => country.id === id),
  ).filter((country): country is NameCountry => Boolean(country));
  const others = NAME_COUNTRIES.filter(
    (country) => !POPULAR_COUNTRY_IDS.includes(country.id),
  );

  const stateOf = (country: NameCountry) => {
    const isSelected = selected.includes(country.id);
    return { isSelected, isDisabled: !isSelected && isFull };
  };

  return (
    <Animated.View entering={FadeIn.duration(220)} className="gap-6">
      <View className="gap-3">
        <SectionTitle icon="flame" color={meta.color} label="Pays populaires" />
        <View className="flex-row gap-2.5">
          {popular.map((country) => (
            <PopularTile
              key={country.id}
              country={country}
              color={meta.color}
              tint={meta.tint}
              {...stateOf(country)}
              onPress={() => onToggle(country.id)}
            />
          ))}
        </View>
      </View>

      <View className="gap-3">
        <SectionTitle
          icon="earth-outline"
          color={meta.color}
          label="Tous les pays"
          selectedCount={selected.length}
        />
        <CountryRows
          countries={others}
          color={meta.color}
          tint={meta.tint}
          stateOf={stateOf}
          onToggle={onToggle}
        />
      </View>

      <GradientButton
        color={meta.color}
        label={isLoading ? 'Chargement…' : 'Découvrir les prénoms'}
        isDisabled={selected.length === 0 || isLoading}
        onPress={onStart}
      />
    </Animated.View>
  );
}

function SectionTitle({
  icon,
  color,
  label,
  selectedCount,
}: {
  icon: 'flame' | 'earth-outline';
  color: string;
  label: string;
  /** Affiche la gélule « n / 3 sélectionné(s) » à droite. */
  selectedCount?: number;
}) {
  return (
    <View className="flex-row items-center gap-2 px-0.5">
      <Ionicons
        name={icon}
        size={20}
        color={icon === 'flame' ? color : '#5b5470'}
      />
      <Text
        className="flex-1 text-[17px] font-extrabold"
        style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.2 }}
      >
        {label}
      </Text>
      {selectedCount !== undefined ? (
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: hexToRgba(color, 0.12) }}
        >
          <Text className="text-[12.5px] font-bold" style={{ color }}>
            {selectedCount} / {MAX_SELECTED_COUNTRIES} sélectionné
            {selectedCount > 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Radio rond : vide, ou plein à la teinte du genre avec une coche. */
function Radio({ isSelected, color }: { isSelected: boolean; color: string }) {
  return isSelected ? (
    <View
      className="h-[22px] w-[22px] items-center justify-center rounded-full"
      style={{ backgroundColor: color }}
    >
      <Ionicons name="checkmark" size={14} color="#ffffff" />
    </View>
  ) : (
    <View
      className="h-[22px] w-[22px] rounded-full"
      style={{ borderWidth: 1.5, borderColor: '#b9b6c4' }}
    />
  );
}

/** Grande tuile d'un pays populaire : drapeau, nom, radio en haut à droite. */
function PopularTile({
  country,
  color,
  tint,
  isSelected,
  isDisabled,
  onPress,
}: {
  country: NameCountry;
  color: string;
  tint: string;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      accessibilityLabel={country.label}
      disabled={isDisabled}
      onPress={onPress}
      className="flex-1 overflow-hidden rounded-[22px] active:opacity-80"
      style={{
        opacity: isDisabled ? 0.45 : 1,
        borderWidth: 1.5,
        borderColor: isSelected ? color : 'rgba(255, 255, 255, 0.95)',
        shadowColor: color,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isSelected ? 0.18 : 0.07,
        shadowRadius: 16,
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={
          isSelected
            ? [tint, '#ffffff']
            : ['#ffffff', 'rgba(255, 255, 255, 0.9)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 14,
          gap: 8,
        }}
      >
        <View className="flex-row items-start justify-between">
          <Text style={{ fontSize: 28, lineHeight: 34 }}>{country.flag}</Text>
          <Radio isSelected={isSelected} color={color} />
        </View>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-[14.5px] font-bold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {country.label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

/** Liste à deux colonnes : drapeau en pastille, nom, radio. */
function CountryRows({
  countries,
  color,
  tint,
  stateOf,
  onToggle,
}: {
  countries: NameCountry[];
  color: string;
  tint: string;
  stateOf: (country: NameCountry) => {
    isSelected: boolean;
    isDisabled: boolean;
  };
  onToggle: (id: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap justify-between gap-y-2.5">
      {countries.map((country) => {
        const { isSelected, isDisabled } = stateOf(country);
        return (
          <Animated.View
            key={country.id}
            layout={LIST_LAYOUT}
            style={{ width: '48.5%' }}
          >
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected, disabled: isDisabled }}
              accessibilityLabel={country.label}
              disabled={isDisabled}
              onPress={() => onToggle(country.id)}
              className="h-[58px] flex-row items-center gap-2.5 rounded-full pl-2 pr-3 active:opacity-75"
              style={{
                opacity: isDisabled ? 0.45 : 1,
                backgroundColor: isSelected
                  ? tint
                  : 'rgba(255, 255, 255, 0.92)',
                borderWidth: 1.5,
                borderColor: isSelected
                  ? hexToRgba(color, 0.55)
                  : 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <View
                className="h-[42px] w-[42px] items-center justify-center rounded-full"
                style={{
                  backgroundColor: isSelected
                    ? '#ffffff'
                    : hexToRgba(tint, 0.9),
                }}
              >
                <Text style={{ fontSize: 22, lineHeight: 28 }}>
                  {country.flag}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                className="flex-1 text-[14.5px] font-bold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {country.label}
              </Text>
              <Radio isSelected={isSelected} color={color} />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * Bouton principal en dégradé de la teinte du genre, étincelles et flèche.
 * Marge basse : de l'air avec la barre du bas (demande explicite).
 */
function GradientButton({
  color,
  label,
  isDisabled,
  onPress,
}: {
  color: string;
  label: string;
  isDisabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      className="mx-3 mb-6 overflow-hidden rounded-full active:opacity-90"
      style={{
        opacity: isDisabled ? 0.45 : 1,
        shadowColor: color,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 6,
      }}
    >
      <LinearGradient
        colors={[lightenHex(color, 0.25), color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: 60,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <Ionicons name="sparkles-outline" size={20} color="#ffffff" />
        <Text className="text-[16.5px] font-bold text-white">{label}</Text>
        <Ionicons name="arrow-forward" size={19} color="#ffffff" />
      </LinearGradient>
    </Pressable>
  );
}

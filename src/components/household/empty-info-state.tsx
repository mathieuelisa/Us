import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import {
  INFO_CATEGORY_META,
  type InfoCategory,
} from '@/features/household/constants';
import { hexToRgba } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Raccourcis de l'état vide : chacun ouvre la modale d'ajout directement
 * sur sa catégorie. Couleurs reprises de `INFO_CATEGORY_META` ; libellés et
 * icônes propres à ce bloc, plus parlants qu'en grille (« Allergies » au
 * pluriel, fleur pour les allergies).
 */
const SUGGESTIONS: {
  category: InfoCategory;
  label: string;
  icon: IoniconName;
}[] = [
  { category: 'blood_type', label: 'Groupe sanguin', icon: 'water-outline' },
  { category: 'allergy', label: 'Allergies', icon: 'flower-outline' },
  { category: 'phone', label: 'Numéros utiles', icon: 'call-outline' },
  {
    category: 'vigilance',
    label: 'Points de vigilance',
    icon: 'medkit-outline',
  },
];

/**
 * État vide des Informations importantes, d'après une capture de référence
 * (demande explicite) : illustration de presse-papiers, titre, texte, puis
 * des suggestions de catégories à toucher.
 *
 * Volontairement **sans** bouton « Ajouter » dans le bloc (demande
 * explicite) : l'ajout reste au bouton + flottant en bas à droite, qui
 * rebondit tant que la liste est vide.
 */
export function EmptyInfoState({
  accent,
  onPickCategory,
}: {
  accent: string;
  onPickCategory: (category: InfoCategory) => void;
}) {
  return (
    <View
      className="items-center rounded-[30px] px-5 pb-6 pt-4"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 3,
      }}
    >
      <ClipboardIllustration accent={accent} />

      <Text
        className="mt-1 text-center text-[19px] font-extrabold"
        style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
      >
        Aucune information pour l’instant
      </Text>
      <Text
        className="mt-2 text-center text-[14px] leading-5"
        style={{ color: GLASS_BODY_COLOR }}
      >
        Ajoutez groupe sanguin, allergies, numéros utiles…{'\n'}Elles seront
        partagées avec votre partenaire.
      </Text>

      <View className="mt-5 w-full flex-row items-center gap-3">
        <View
          className="h-px flex-1"
          style={{ backgroundColor: hexToRgba(accent, 0.18) }}
        />
        <View>
          <View
            className="rounded-full px-3.5 py-1.5"
            style={{ backgroundColor: hexToRgba(accent, 0.1) }}
          >
            <Text className="text-[13px] font-bold" style={{ color: accent }}>
              Suggestions
            </Text>
          </View>
          <SparkLines
            color={hexToRgba(accent, 0.6)}
            style={{ right: -20, top: -14, transform: [{ rotate: '10deg' }] }}
          />
        </View>
        <View
          className="h-px flex-1"
          style={{ backgroundColor: hexToRgba(accent, 0.18) }}
        />
      </View>

      <View className="mt-4 w-full flex-row flex-wrap justify-between gap-y-2.5">
        {SUGGESTIONS.map((suggestion) => {
          const meta = INFO_CATEGORY_META[suggestion.category];
          return (
            <Pressable
              key={suggestion.category}
              accessibilityRole="button"
              accessibilityLabel={`Ajouter : ${suggestion.label}`}
              onPress={() => onPickCategory(suggestion.category)}
              className="h-14 flex-row items-center gap-2.5 rounded-[18px] px-2.5 active:opacity-70"
              style={{
                width: '48.5%',
                backgroundColor: hexToRgba(meta.tint, 0.7),
              }}
            >
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
              >
                <Ionicons name={suggestion.icon} size={18} color={meta.color} />
              </View>
              <Text
                numberOfLines={2}
                className="flex-1 text-[13.5px] font-semibold leading-[17px]"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {suggestion.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const HEART_PATH =
  'M10 17C10 17 0 11 0 4.5C0 0.5 3 -1.5 5.5 -1.5C7.6 -1.5 9.2 0 10 1.6C10.8 0 12.4 -1.5 14.5 -1.5C17 -1.5 20 0.5 20 4.5C20 11 10 17 10 17Z';

/**
 * Presse-papiers à cœur posé sur des nuages, sur une tache d'accent —
 * dessiné en SVG faute d'illustration dédiée dans `assets/images/`.
 */
function ClipboardIllustration({ accent }: { accent: string }) {
  const line = hexToRgba(accent, 0.55);
  const soft = hexToRgba(accent, 0.22);

  return (
    <Svg width={200} height={150} viewBox="0 0 200 150">
      <Circle cx={100} cy={70} r={58} fill={hexToRgba(accent, 0.12)} />

      {/* Petits traits, en haut à gauche et à droite du cœur. */}
      <Line
        x1={52}
        y1={34}
        x2={44}
        y2={28}
        stroke={line}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Line
        x1={58}
        y1={26}
        x2={55}
        y2={16}
        stroke={line}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Line
        x1={152}
        y1={86}
        x2={160}
        y2={80}
        stroke={line}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Line
        x1={154}
        y1={96}
        x2={164}
        y2={96}
        stroke={line}
        strokeWidth={3}
        strokeLinecap="round"
      />

      <G transform="rotate(-6 98 72)">
        <Rect
          x={66}
          y={30}
          width={64}
          height={84}
          rx={10}
          fill="#ffffff"
          stroke={line}
          strokeWidth={3}
        />
        <Rect x={85} y={22} width={26} height={14} rx={5} fill={line} />
        <Circle cx={98} cy={22} r={4.5} fill={line} />
        {[0, 1, 2].map((row) => (
          <G key={row}>
            <Circle
              cx={80}
              cy={52 + row * 18}
              r={4.5}
              fill="none"
              stroke={line}
              strokeWidth={2}
            />
            <Rect
              x={90}
              y={50 + row * 18}
              width={row === 2 ? 22 : 30}
              height={4}
              rx={2}
              fill={soft}
            />
          </G>
        ))}
      </G>

      {/* Nuages au pied du presse-papiers. */}
      <Ellipse cx={64} cy={124} rx={30} ry={13} fill="#fbf6ec" />
      <Ellipse cx={100} cy={130} rx={46} ry={13} fill="#fdf9f2" />
      <Ellipse cx={142} cy={126} rx={26} ry={11} fill="#fbf6ec" />

      {/* Badge cœur. */}
      <Circle cx={134} cy={102} r={17} fill="#ffffff" />
      <Circle
        cx={134}
        cy={102}
        r={17}
        fill="none"
        stroke={hexToRgba('#f08aa8', 0.25)}
        strokeWidth={2}
      />
      <G transform="translate(124 96)">
        <Path d={HEART_PATH} fill="#f08aa8" />
      </G>
    </Svg>
  );
}

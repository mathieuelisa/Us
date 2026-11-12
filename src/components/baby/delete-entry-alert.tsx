import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { hexToRgba, lightenHex } from '@/lib/color';

const PINK = '#ec8b9a';
const PINK_LIGHT = '#f7b3be';
const PINK_PALE = '#fde6ea';

/**
 * Confirmation avant de supprimer une entrée de suivi bébé, d'après une
 * capture de référence (demande explicite) : illustration de corbeille,
 * résumé de l'entrée, date en gélule, puis « Supprimer définitivement » en
 * bouton principal et « Garder l'entrée » en second.
 *
 * Rendue en surcouche absolue **dans** la `Modal` du formulaire plutôt
 * qu'en `Modal` imbriquée : deux `Modal` superposées se comportent mal
 * selon les plateformes (même raison que `DiscardTimerAlert`). La croix et
 * « Garder l'entrée » annulent tous deux.
 */
export function DeleteEntryAlert({
  emoji,
  summary,
  date,
  accent,
  onConfirm,
  onCancel,
}: {
  /** Émoji du module, posé sur la fiche qui part à la corbeille. */
  emoji: string;
  summary: string;
  /** « jeudi 12 novembre · 14h30 ». */
  date: string;
  accent: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <View className="absolute inset-0 items-center justify-center bg-black/45 px-6">
      <View
        className="w-full items-center overflow-hidden rounded-[34px] bg-white px-6 pb-6 pt-7"
        style={{
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.18,
          shadowRadius: 30,
          elevation: 12,
        }}
      >
        {/* Tache décorative en haut à gauche, comme la feuille d'ajout. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -80,
            left: -90,
            width: 230,
            height: 200,
            borderRadius: 115,
            backgroundColor: lightenHex(accent, 0.6),
            opacity: 0.3,
          }}
        />

        <Pressable
          accessibilityLabel="Fermer"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onCancel}
          className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white"
          style={{
            shadowColor: accent,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.14,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <Ionicons name="close" size={20} color={GLASS_TITLE_COLOR} />
        </Pressable>

        <TrashIllustration emoji={emoji} accent={accent} />

        <Text
          className="mt-3 text-center text-[22px] font-extrabold"
          style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
        >
          Supprimer cette entrée ?
        </Text>

        {summary ? (
          <Text
            className="mt-1.5 text-center text-[15px] font-medium"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {summary}
          </Text>
        ) : null}

        <View
          className="mt-3 flex-row items-center gap-2 rounded-full px-4 py-2"
          style={{ backgroundColor: hexToRgba(accent, 0.1) }}
        >
          <Ionicons name="calendar-outline" size={16} color={accent} />
          <Text className="text-[14px] font-semibold" style={{ color: accent }}>
            {date}
          </Text>
        </View>

        <Text
          className="mt-4 text-center text-[13.5px] leading-5"
          style={{ color: GLASS_BODY_COLOR }}
        >
          Elle sera supprimée pour tout le foyer.{'\n'}Cette action est
          définitive.
        </Text>

        <View className="mt-5 w-full gap-2.5">
          <PillButton
            label="Supprimer définitivement"
            icon="trash-outline"
            onPress={onConfirm}
          />
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            className="h-12 items-center justify-center rounded-full active:opacity-70"
            style={{ backgroundColor: hexToRgba(accent, 0.09) }}
          >
            <Text className="text-[15px] font-bold" style={{ color: accent }}>
              Garder l’entrée
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/**
 * Corbeille rose au couvercle ouvert, une fiche (émoji du module) en train
 * d'y tomber, sur une tache pâle — composée en vues et SVG faute
 * d'illustration dédiée dans `assets/images/`.
 */
function TrashIllustration({
  emoji,
  accent,
}: {
  emoji: string;
  accent: string;
}) {
  return (
    <View pointerEvents="none" style={{ width: 160, height: 132 }}>
      {/* Tache pâle aux coins irréguliers. */}
      <View
        style={{
          position: 'absolute',
          left: 24,
          top: 12,
          width: 116,
          height: 110,
          borderTopLeftRadius: 62,
          borderTopRightRadius: 52,
          borderBottomRightRadius: 60,
          borderBottomLeftRadius: 46,
          backgroundColor: PINK_PALE,
        }}
      />
      <Ionicons
        name="leaf"
        size={30}
        color={hexToRgba(accent, 0.45)}
        style={{
          position: 'absolute',
          left: 16,
          bottom: 16,
          transform: [{ rotate: '-35deg' }],
        }}
      />
      <SparkLines
        color={PINK}
        style={{ left: 20, top: 0, transform: [{ rotate: '-70deg' }] }}
      />

      {/* Fiche de l'entrée, inclinée, à moitié dans la corbeille. */}
      <View
        style={{
          position: 'absolute',
          left: 66,
          top: 14,
          width: 40,
          height: 54,
          borderRadius: 8,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#f6d5db',
          alignItems: 'center',
          paddingTop: 6,
          gap: 4,
          transform: [{ rotate: '14deg' }],
          shadowColor: PINK,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
        }}
      >
        <Text style={{ fontSize: 17 }}>{emoji}</Text>
        <View
          style={{
            width: 24,
            height: 3,
            borderRadius: 2,
            backgroundColor: PINK_LIGHT,
          }}
        />
        <View
          style={{
            width: 17,
            height: 3,
            borderRadius: 2,
            backgroundColor: PINK_LIGHT,
          }}
        />
      </View>

      {/* Corbeille : seau évasé, rebord, trois cannelures. */}
      <Svg
        width={66}
        height={72}
        viewBox="0 0 66 72"
        style={{ position: 'absolute', left: 50, top: 54 }}
      >
        <Defs>
          <LinearGradient id="trash-body" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={PINK_LIGHT} />
            <Stop offset="1" stopColor={PINK} />
          </LinearGradient>
        </Defs>
        <Path
          d="M5 10 H61 L56 63 Q55 70 48 70 H18 Q11 70 10 63 Z"
          fill="url(#trash-body)"
        />
        <Rect x={0} y={3} width={66} height={11} rx={5.5} fill={PINK} />
        <Rect
          x={5}
          y={6}
          width={56}
          height={5}
          rx={2.5}
          fill="#d96e7f"
          opacity={0.45}
        />
        <Rect x={20} y={24} width={5} height={34} rx={2.5} fill="#fbd3da" />
        <Rect x={30.5} y={24} width={5} height={36} rx={2.5} fill="#fbd3da" />
        <Rect x={41} y={24} width={5} height={34} rx={2.5} fill="#fbd3da" />
      </Svg>

      {/* Couvercle soulevé, en haut à droite. */}
      <View
        style={{
          position: 'absolute',
          left: 104,
          top: 18,
          transform: [{ rotate: '38deg' }],
        }}
      >
        <Svg width={44} height={22} viewBox="0 0 44 22">
          <Rect x={15} y={2} width={14} height={8} rx={3} fill="#d96e7f" />
          <Rect x={0} y={8} width={44} height={11} rx={5.5} fill={PINK} />
        </Svg>
      </View>
    </View>
  );
}

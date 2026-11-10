import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import {
  getTrimester,
  getWeeksOfAmenorrhea,
  TRIMESTER_LABELS,
} from '@/features/health/constants';
import {
  type CatalogExercise,
  EXERCISE_DISCLAIMER,
  type ExerciseTrimester,
  getExercisesForTrimester,
} from '@/features/health/exercise-catalog';
import type { Household } from '@/features/household/api';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const TRIMESTERS: ExerciseTrimester[] = [1, 2, 3];

/** Libellés courts du sélecteur — « 2ème trimestre » n'y tiendrait pas. */
const TRIMESTER_SHORT_LABELS: Record<ExerciseTrimester, string> = {
  1: '1er trim.',
  2: '2ème trim.',
  3: '3ème trim.',
};

/**
 * Écran 4f — exercices.
 *
 * Trois trimestres accessibles derrière un sélecteur, **ouvert par défaut
 * sur le trimestre en cours**. C'est la lecture qui réconcilie les deux
 * sources : CONCEPT.md demande des séances « filtrées automatiquement selon
 * le trimestre de grossesse en cours » — c'est le trimestre présélectionné —
 * et la maquette 4f montre les trois groupes — ils restent atteignables d'un
 * tap. La version précédente masquait purement les deux autres trimestres,
 * ce qui rendait les trois quarts du catalogue inatteignables.
 *
 * Repli assumé : sans date de terme, le trimestre courant est incalculable ;
 * le sélecteur s'ouvre alors sur le premier plutôt que de deviner.
 *
 * Grille à deux colonnes plutôt que la liste de lignes blanches d'avant
 * (demande explicite de mettre cette partie en valeur) : chaque exercice a
 * son bandeau pastel et son emoji, ce qui donne à l'onglet une allure de
 * catalogue et le distingue des listes du reste de l'app. Modernisé d'après
 * une capture de référence : phrase d'intro soulignée, trimestres en
 * gélules (coche sur l'actif), cartes à bouton lecture et pastille de durée,
 * avertissement dans un encart teinté à icône.
 *
 * Le contenu vient de `EXERCISE_CATALOG`, en dur côté client — voir l'en-tête
 * de ce fichier pour la raison et la dette associée.
 */
export function ExercisesTab({
  household,
}: {
  household: Household | null | undefined;
}) {
  const accent = useThemeAccent();
  const weeks = getWeeksOfAmenorrhea(household?.due_date ?? null);
  const currentTrimester = weeks === null ? null : getTrimester(weeks);

  const [selectedTrimester, setSelectedTrimester] = useState<ExerciseTrimester>(
    currentTrimester ?? 1,
  );

  const exercises = getExercisesForTrimester(selectedTrimester);

  return (
    <View className="gap-5">
      <View className="gap-1.5">
        <Text
          className="text-[15.5px] font-bold leading-[21px]"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {currentTrimester === null
            ? 'Des séances courtes, adaptées à chaque trimestre.'
            : `Vous êtes au ${TRIMESTER_LABELS[currentTrimester].toLowerCase()}${
                weeks === null ? '' : ` — ${weeks} SA`
              }. Les autres trimestres restent consultables.`}
        </Text>
        <Svg width={120} height={10} viewBox="0 0 120 10">
          <Path
            d="M3 7 C 36 2, 82 1.5, 117 4"
            stroke={hexToRgba(accent, 0.45)}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>

      <View className="flex-row gap-2.5">
        {TRIMESTERS.map((trimester) => {
          const isActive = trimester === selectedTrimester;
          const isCurrent = trimester === currentTrimester;
          return (
            <Pressable
              key={trimester}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${TRIMESTER_LABELS[trimester]}${isCurrent ? ', le vôtre' : ''}`}
              onPress={() => setSelectedTrimester(trimester)}
              className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-full"
              style={
                isActive
                  ? {
                      backgroundColor: accent,
                      shadowColor: accent,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.25,
                      shadowRadius: 12,
                      elevation: 5,
                    }
                  : {
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      borderWidth: 1,
                      borderColor: hexToRgba(accent, 0.08),
                    }
              }
            >
              {isActive ? (
                <Ionicons name="checkmark-circle" size={17} color="#ffffff" />
              ) : null}
              <View className="items-center">
                <Text
                  className="text-[14px]"
                  style={{
                    color: isActive ? '#ffffff' : GLASS_BODY_COLOR,
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {TRIMESTER_SHORT_LABELS[trimester]}
                </Text>
                {/* Repère discret du trimestre réellement en cours : sans lui,
                    rien ne distingue « le mien » de « celui que je consulte »
                    une fois qu'on a changé d'onglet. */}
                {isCurrent ? (
                  <Text
                    className="text-[10px]"
                    style={{
                      color: isActive ? 'rgba(255, 255, 255, 0.8)' : '#a3a1b0',
                    }}
                  >
                    le vôtre
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {exercises.length === 0 ? (
        <View
          className="items-center gap-2 rounded-[24px] px-5 py-6"
          style={{ backgroundColor: hexToRgba(accent, 0.07) }}
        >
          <Ionicons name="barbell-outline" size={26} color={accent} />
          <Text
            className="text-center text-[14px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            Aucun exercice proposé pour cette période.
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.slug}
              exercise={exercise}
              accent={accent}
            />
          ))}
        </View>
      )}

      <View
        className="flex-row items-start gap-3 rounded-[24px] px-4 py-4"
        style={{ backgroundColor: hexToRgba(accent, 0.07) }}
      >
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: hexToRgba(accent, 0.75) }}
        >
          <Ionicons name="information" size={18} color="#ffffff" />
        </View>
        <Text
          className="flex-1 text-[12.5px] leading-[18px]"
          style={{ color: GLASS_BODY_COLOR }}
        >
          {EXERCISE_DISCLAIMER}
        </Text>
      </View>
    </View>
  );
}

/** « 3 min · allongée » → durée et posture (posture capitalisée), séparées. */
function splitDurationLabel(label: string): {
  duration: string;
  posture: string | null;
} {
  const [duration, posture] = label.split(' · ');
  return {
    duration,
    posture: posture
      ? posture.charAt(0).toUpperCase() + posture.slice(1)
      : null,
  };
}

/**
 * Carte d'une grille à deux colonnes : bandeau illustré (teinte de
 * l'exercice, tache claire, grand emoji, bouton lecture), puis titre et
 * pastille de durée suivie de la posture — d'après une capture de référence
 * (demande explicite).
 *
 * Largeur donnée par `flex-basis: 47%` plutôt que par `flex-1` : dans un
 * `flex-wrap`, `flex-1` étirerait une carte esseulée sur toute la largeur de
 * la dernière ligne.
 */
function ExerciseCard({
  exercise,
  accent,
}: {
  exercise: CatalogExercise;
  accent: string;
}) {
  const { duration, posture } = splitDurationLabel(exercise.durationLabel);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${exercise.title} — ${exercise.durationLabel}`}
      onPress={() => router.push(`/exercice?slug=${exercise.slug}`)}
      style={{
        flexBasis: '47%',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
      }}
      className="flex-grow rounded-[24px] active:opacity-80"
    >
      <View
        className="flex-1 overflow-hidden rounded-[24px]"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <View
          style={{ backgroundColor: exercise.tint.bg }}
          className="h-[104px] items-center justify-center overflow-hidden"
        >
          {/* Taches claires : le bandeau n'est pas un simple aplat. */}
          <View
            pointerEvents="none"
            className="absolute -left-6 bottom-[-30px] h-24 w-24 rounded-full bg-white/35"
          />
          <View
            pointerEvents="none"
            className="absolute -right-5 -top-8 h-20 w-20 rounded-full bg-white/40"
          />
          <Text style={{ fontSize: 44 }}>{exercise.emoji}</Text>
          <View
            className="absolute right-2.5 top-2.5 h-8 w-8 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: exercise.tint.ink,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
            }}
          >
            <Ionicons
              name="play"
              size={14}
              color={exercise.tint.ink}
              style={{ marginLeft: 2 }}
            />
          </View>
        </View>

        <View className="gap-2 px-3.5 pb-3.5 pt-3">
          <Text
            numberOfLines={2}
            className="text-[15px] font-bold leading-[19px]"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {exercise.title}
          </Text>
          <View className="flex-row flex-wrap items-center gap-1.5">
            <View
              className="flex-row items-center gap-1 rounded-full px-2 py-1"
              style={{ backgroundColor: hexToRgba(exercise.tint.ink, 0.12) }}
            >
              <Ionicons
                name="time-outline"
                size={12}
                color={exercise.tint.ink}
              />
              <Text
                className="text-[11.5px] font-semibold"
                style={{ color: exercise.tint.ink }}
              >
                {duration}
              </Text>
            </View>
            {posture ? (
              <Text
                numberOfLines={1}
                className="shrink text-[11.5px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                · {posture}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

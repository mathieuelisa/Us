import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
import { CARD_SHADOW } from '@/features/hub/constants';

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
 * catalogue et le distingue des listes du reste de l'app.
 *
 * Le contenu vient de `EXERCISE_CATALOG`, en dur côté client — voir l'en-tête
 * de ce fichier pour la raison et la dette associée.
 */
export function ExercisesTab({
  household,
}: {
  household: Household | null | undefined;
}) {
  const weeks = getWeeksOfAmenorrhea(household?.due_date ?? null);
  const currentTrimester = weeks === null ? null : getTrimester(weeks);

  const [selectedTrimester, setSelectedTrimester] = useState<ExerciseTrimester>(
    currentTrimester ?? 1,
  );

  const exercises = getExercisesForTrimester(selectedTrimester);

  return (
    <View className="gap-4">
      <Text className="text-[13px] leading-[19px] text-[#6b6b6b]">
        {currentTrimester === null
          ? 'Des séances courtes, adaptées à chaque trimestre.'
          : `Vous êtes au ${TRIMESTER_LABELS[currentTrimester].toLowerCase()}${
              weeks === null ? '' : ` — ${weeks} SA`
            }. Les autres trimestres restent consultables.`}
      </Text>

      <View className="flex-row gap-2">
        {TRIMESTERS.map((trimester) => {
          const isActive = trimester === selectedTrimester;
          return (
            <Pressable
              key={trimester}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setSelectedTrimester(trimester)}
              style={CARD_SHADOW}
              className={`flex-1 items-center rounded-full py-2.5 ${
                isActive ? 'bg-accent' : 'bg-white'
              }`}
            >
              <Text
                className={`text-[13px] ${
                  isActive
                    ? 'font-semibold text-accent-foreground'
                    : 'text-[#6b6b6b]'
                }`}
              >
                {TRIMESTER_SHORT_LABELS[trimester]}
              </Text>
              {/* Repère discret du trimestre réellement en cours : sans lui,
                  rien ne distingue « le mien » de « celui que je consulte »
                  une fois qu'on a changé d'onglet. */}
              {trimester === currentTrimester ? (
                <Text
                  className={`text-[10px] ${
                    isActive ? 'text-accent-foreground/70' : 'text-[#9a9a9a]'
                  }`}
                >
                  le vôtre
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {exercises.length === 0 ? (
        <Text className="text-[13px] text-[#9a9a9a]">
          Aucun exercice proposé pour cette période.
        </Text>
      ) : (
        <View className="flex-row flex-wrap gap-2.5">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.slug} exercise={exercise} />
          ))}
        </View>
      )}

      <View className="flex-row items-start gap-2 px-1">
        <Ionicons name="information-circle-outline" size={15} color="#9a9a9a" />
        <Text className="flex-1 text-[11.5px] leading-[17px] text-[#9a9a9a]">
          {EXERCISE_DISCLAIMER}
        </Text>
      </View>
    </View>
  );
}

/**
 * Carte d'une grille à deux colonnes. La largeur est donnée par
 * `flex-basis: 47%` plutôt que par `flex-1` : dans un `flex-wrap`, `flex-1`
 * étirerait une carte esseulée sur toute la largeur de la dernière ligne.
 */
function ExerciseCard({ exercise }: { exercise: CatalogExercise }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${exercise.title} — ${exercise.durationLabel}`}
      onPress={() => router.push(`/exercice?slug=${exercise.slug}`)}
      style={[CARD_SHADOW, { flexBasis: '47%' }]}
      className="flex-grow overflow-hidden rounded-3xl bg-white"
    >
      <View
        style={{ backgroundColor: exercise.tint.bg }}
        className="h-[84px] items-center justify-center overflow-hidden"
      >
        {/* Même langage que `ScreenCornerShapes` : un rond clair qui déborde,
            pour que le bandeau ne soit pas un simple aplat. */}
        <View
          pointerEvents="none"
          className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/40"
        />
        <Text className="text-[32px]">{exercise.emoji}</Text>
      </View>

      <View className="gap-1 px-3.5 py-3">
        <Text
          numberOfLines={2}
          className="text-[14px] font-semibold leading-[18px] text-[#1a1a1a]"
        >
          {exercise.title}
        </Text>
        <Text
          className="text-[11.5px] font-medium"
          style={{ color: exercise.tint.ink }}
        >
          {exercise.focus}
        </Text>
        <Text numberOfLines={1} className="text-[11.5px] text-[#8a8a8a]">
          {exercise.durationLabel}
        </Text>
      </View>
    </Pressable>
  );
}

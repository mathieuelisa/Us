import { Text, View } from 'react-native';
import {
  getTrimester,
  getWeeksOfAmenorrhea,
  TRIMESTER_LABELS,
} from '@/features/health/constants';
import { useExercises } from '@/features/health/hooks';
import type { Household } from '@/features/household/api';

/**
 * Écran 4f — exercices.
 *
 * ⚠️ Écart avec la maquette : 4f liste les trois trimestres l'un sous
 * l'autre, alors que CONCEPT.md dit « filtrées automatiquement selon le
 * trimestre de grossesse en cours ». CLAUDE.md tranche en faveur de
 * CONCEPT.md → on ne montre que le trimestre courant.
 *
 * Repli assumé : si la date de terme est inconnue, on ne peut pas calculer
 * le trimestre — on affiche alors les trois groupes (ce que montre la
 * maquette) plutôt que de deviner un trimestre au hasard.
 */
export function ExercisesTab({
  household,
}: {
  household: Household | null | undefined;
}) {
  const { data: exercises = [] } = useExercises();

  const weeks = getWeeksOfAmenorrhea(household?.due_date ?? null);
  const currentTrimester = weeks === null ? null : getTrimester(weeks);

  const visibleTrimesters =
    currentTrimester === null ? ([1, 2, 3] as const) : [currentTrimester];

  return (
    <View className="gap-4">
      <Text className="text-[13px] text-[#6b6b6b]">
        {currentTrimester === null
          ? 'Adaptés à chaque trimestre'
          : `Adaptés à votre ${TRIMESTER_LABELS[currentTrimester].toLowerCase()}${
              weeks === null ? '' : ` — ${weeks} SA`
            }`}
      </Text>

      {visibleTrimesters.map((trimester) => {
        const forTrimester = exercises.filter(
          (exercise) => exercise.trimester === trimester,
        );

        return (
          <View key={trimester} className="gap-2.5">
            {currentTrimester === null ? (
              <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
                {TRIMESTER_LABELS[trimester].toUpperCase()}
              </Text>
            ) : null}

            {forTrimester.length === 0 ? (
              <Text className="text-[13px] text-[#9a9a9a]">
                Aucun exercice proposé pour cette période.
              </Text>
            ) : (
              forTrimester.map((exercise) => (
                <View
                  key={exercise.id}
                  className="gap-0.5 rounded-[16px] bg-white px-4 py-3.5"
                >
                  <Text className="text-[15px] font-medium text-[#1a1a1a]">
                    {exercise.title}
                  </Text>
                  {exercise.duration_label ? (
                    <Text className="text-[13px] text-[#6b6b6b]">
                      {exercise.duration_label}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        );
      })}
    </View>
  );
}

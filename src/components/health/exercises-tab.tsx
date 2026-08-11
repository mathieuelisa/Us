import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Exercise } from '@/features/health/api';
import {
  getTrimester,
  getWeeksOfAmenorrhea,
  TRIMESTER_LABELS,
} from '@/features/health/constants';
import { useExercises } from '@/features/health/hooks';
import type { Household } from '@/features/household/api';
import { CARD_SHADOW } from '@/features/hub/constants';

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
  const [selected, setSelected] = useState<Exercise | null>(null);

  const weeks = getWeeksOfAmenorrhea(household?.due_date ?? null);
  const currentTrimester = weeks === null ? null : getTrimester(weeks);

  const visibleTrimesters =
    currentTrimester === null ? ([1, 2, 3] as const) : [currentTrimester];

  if (selected) {
    return (
      <ExerciseDetail exercise={selected} onBack={() => setSelected(null)} />
    );
  }

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
                <Pressable
                  key={exercise.id}
                  accessibilityRole="button"
                  onPress={() => setSelected(exercise)}
                  style={CARD_SHADOW}
                  className="gap-0.5 rounded-2xl bg-white px-4 py-3.5"
                >
                  <Text className="text-[15px] font-medium text-[#1a1a1a]">
                    {exercise.title}
                  </Text>
                  {exercise.duration_label ? (
                    <Text className="text-[13px] text-[#6b6b6b]">
                      {exercise.duration_label}
                    </Text>
                  ) : null}
                </Pressable>
              ))
            )}
          </View>
        );
      })}
    </View>
  );
}

/**
 * Détail d'un exercice : titre, durée, section image. `image_url` est
 * nullable — le catalogue actuel n'a aucune photo réelle (aucun asset dans
 * `design/`) ; tant qu'elle n'est pas renseignée en base, un repli visuel
 * neutre remplace l'image plutôt que de casser l'écran ou d'inventer une URL.
 */
function ExerciseDetail({
  exercise,
  onBack,
}: {
  exercise: Exercise;
  onBack: () => void;
}) {
  return (
    <View className="gap-5">
      <Pressable
        accessibilityLabel="Retour à la liste des exercices"
        accessibilityRole="button"
        hitSlop={12}
        style={CARD_SHADOW}
        onPress={onBack}
        className="h-9 w-9 items-center justify-center rounded-full bg-white"
      >
        <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
      </Pressable>

      <View className="gap-1">
        <Text className="text-[24px] font-bold text-[#1a1a1a]">
          {exercise.title}
        </Text>
        {exercise.duration_label ? (
          <Text className="text-[13px] font-medium text-accent">
            {exercise.duration_label}
          </Text>
        ) : null}
      </View>

      <View className="aspect-video shadow-sm items-center justify-center overflow-hidden rounded-2xl bg-white">
        {exercise.image_url ? (
          <Image
            source={{ uri: exercise.image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <Text className="text-[13px] text-[#9a9a9a]">
            Illustration à venir
          </Text>
        )}
      </View>

      {exercise.description ? (
        <Text className="text-[14px] leading-5 text-[#6b6b6b]">
          {exercise.description}
        </Text>
      ) : null}
    </View>
  );
}

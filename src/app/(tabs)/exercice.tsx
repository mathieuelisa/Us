import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import {
  type CatalogExercise,
  EXERCISE_DISCLAIMER,
  getExerciseBySlug,
} from '@/features/health/exercise-catalog';
import { CARD_SHADOW } from '@/features/hub/constants';
import { useThemeBackground } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

/** Hauteur du bandeau de tête, bord à bord. */
const HERO_HEIGHT = 230;
/** Proportions des illustrations d'exercice fournies (≈ 414 × 216). */
const EXERCISE_IMAGE_RATIO = 1.92;
/** Place laissée au-dessus de l'illustration : barre d'état et encoche. */
const HERO_IMAGE_TOP_INSET = 44;

/**
 * Détail d'un exercice (prolonge l'écran 4f), ouvert depuis la grille de
 * l'onglet Exercices : `/exercice?slug=…`.
 *
 * Une **route** et non plus un état local de l'onglet, contrairement au
 * détail d'une démarche : le visuel de tête doit filer bord à bord jusqu'en
 * haut de l'écran (demande explicite), ce qui est impossible à l'intérieur
 * du `ScrollView` de `sante.tsx` — il est contraint par ses marges, son
 * titre « Suivi santé » et sa barre d'onglets. Déclarée `href: null` dans
 * `(tabs)/_layout.tsx` : la barre de navigation reste visible, comme pour
 * les autres destinations ouvertes depuis le hub.
 *
 * Le bandeau de tête affiche l'illustration de l'exercice (`image`) quand
 * elle existe — c'est le cas des 12 exercices du catalogue, fournis par
 * l'utilisateur. Un exercice ajouté sans image retombe sur une composition
 * aplat pastel + emoji (`exercises.image_url` reste vide en base, point
 * ouvert n°37).
 *
 * L'emplacement vidéo est un cadre blanc vide, en attente d'un lien
 * (demande explicite) : rien n'est lu ni téléchargé aujourd'hui.
 *
 * `?tab=exercises` au retour : `sante.tsx` lit ce paramètre pour rouvrir le
 * bon onglet, sans quoi on retomberait sur le Journal.
 */
export default function ExerciseScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const backgroundColor = useThemeBackground();

  const exercise = getExerciseBySlug(slug);

  // Retour ciblé sur l'onglet Exercices plutôt que `router.back()` : cette
  // route vit dans le navigateur `Tabs`, qui ne l'empile pas sur `/sante` —
  // `back()` remonte au hub, pas à la grille d'où l'on vient. Même
  // correctif que `BabyModuleScreen`, pour la même raison.
  const goBack = () => router.navigate('/sante?tab=exercises');

  if (!exercise) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor }}>
        <View className="flex-1 gap-3 px-6 pt-4">
          <BackButton onPress={goBack} />
          <Text className="text-[20px] font-bold text-[#1a1a1a]">
            Exercice introuvable
          </Text>
          <Text className="text-[14px] leading-5 text-[#6b6b6b]">
            Cet exercice n’existe plus dans le catalogue.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <ScrollView
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        <ExerciseHero exercise={exercise} onBack={goBack} />

        <View className="gap-5 px-6 pt-5">
          <View className="gap-2">
            <Text className="text-[26px] font-bold leading-8 text-[#1a1a1a]">
              {exercise.title}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              <Chip
                icon="time-outline"
                label={exercise.durationLabel}
                tint={exercise.tint}
              />
              <Chip
                icon="body-outline"
                label={exercise.focus}
                tint={exercise.tint}
              />
            </View>
          </View>

          <Text className="text-[15px] leading-[23px] text-[#3d3d3d]">
            {exercise.description}
          </Text>

          <View className="gap-2">
            <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
              VIDÉO EXPLICATIVE
            </Text>

            {/* Cadre en attente du lien vidéo (demande explicite) — pas de
                lecteur, pas de source : uniquement l'emplacement, au bon
                format, pour que la page se lise déjà comme si la vidéo y
                était. */}
            <View
              style={CARD_SHADOW}
              className="aspect-video items-center justify-center gap-2 rounded-2xl border border-[#ececec] bg-white"
            >
              <View
                style={{ backgroundColor: exercise.tint.bg }}
                className="h-12 w-12 items-center justify-center rounded-full"
              >
                <Ionicons name="play" size={20} color={exercise.tint.ink} />
              </View>
              <Text className="text-[12.5px] text-[#9a9a9a]">
                Vidéo à venir
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
              COMMENT FAIRE
            </Text>

            <View
              style={CARD_SHADOW}
              className="gap-3.5 rounded-2xl bg-white p-4"
            >
              {exercise.steps.map((step, index) => (
                <View key={step} className="flex-row items-start gap-3">
                  <View
                    style={{ backgroundColor: exercise.tint.bg }}
                    className="h-6 w-6 items-center justify-center rounded-full"
                  >
                    <Text
                      className="text-[12px] font-bold"
                      style={{ color: exercise.tint.ink }}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-[14px] leading-[21px] text-[#1a1a1a]">
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-row items-start gap-2.5 rounded-2xl border border-dashed border-[#d8d8d8] bg-white/60 px-3.5 py-3.5">
            <Ionicons name="alert-circle-outline" size={17} color="#8a8a8a" />
            <Text className="flex-1 text-[12.5px] leading-[18px] text-[#6b6b6b]">
              {EXERCISE_DISCLAIMER}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Bandeau de tête bord à bord. Il remonte **sous** la barre d'état plutôt
 * que de s'arrêter à la zone sûre (pas de `SafeAreaView` autour) : c'est ce
 * qui fait que le visuel « prend tout le haut » au lieu de flotter sous une
 * bande de fond. Seul le bouton retour est redescendu à hauteur sûre.
 */
function ExerciseHero({
  exercise,
  onBack,
}: {
  exercise: CatalogExercise;
  onBack: () => void;
}) {
  if (exercise.image) {
    // Illustration montrée entière (pas de rognage) : elle commence sous la
    // zone de la barre d'état, que la couleur de son bord haut prolonge, et
    // la hauteur du bandeau suit ses proportions.
    return (
      <View
        style={{
          backgroundColor: exercise.imageTopColor ?? exercise.tint.bg,
          paddingTop: HERO_IMAGE_TOP_INSET,
        }}
        className="overflow-hidden rounded-b-[32px]"
      >
        <Image
          source={exercise.image}
          resizeMode="cover"
          style={{ width: '100%', aspectRatio: EXERCISE_IMAGE_RATIO }}
        />

        <View className="absolute left-6 top-14">
          <BackButton onPress={onBack} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{ backgroundColor: exercise.tint.bg, height: HERO_HEIGHT }}
      className="items-center justify-center overflow-hidden rounded-b-[32px]"
    >
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/35"
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-white/25"
      />

      <Text className="text-[84px]">{exercise.emoji}</Text>

      <View className="absolute left-6 top-14">
        <BackButton onPress={onBack} />
      </View>
    </View>
  );
}

/** Blanc plein, y compris posé sur le bandeau pastel : c'est ce qui lui
 *  garde son contraste quelle que soit la teinte de l'exercice. */
function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Revenir aux exercices"
      accessibilityRole="button"
      hitSlop={12}
      style={CARD_SHADOW}
      onPress={onPress}
      className="h-9 w-9 items-center justify-center rounded-full bg-white"
    >
      <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
    </Pressable>
  );
}

function Chip({
  icon,
  label,
  tint,
}: {
  icon: 'time-outline' | 'body-outline';
  label: string;
  tint: { bg: string; ink: string };
}) {
  return (
    <View
      style={{ backgroundColor: tint.bg }}
      className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
    >
      <Ionicons name={icon} size={13} color={tint.ink} />
      <Text className="text-[12.5px] font-medium" style={{ color: tint.ink }}>
        {label}
      </Text>
    </View>
  );
}

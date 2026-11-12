import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import {
  getSymptomLabel,
  getSymptomVisual,
  NO_SYMPTOM,
  withoutNoSymptom,
} from '@/features/health/constants';
import { usePregnantSymptomsForDate } from '@/features/health/hooks';
import { getSymptomTips } from '@/features/health/symptom-tips';
import type { Household } from '@/features/household/api';
import type { MoodValue } from '@/features/hub/api';
import { MOOD_PRESENTATION } from '@/features/hub/constants';
import { getTipOfTheDay } from '@/features/partner/constants';
import { useThemeAccent } from '@/features/settings/hooks';
import type { HouseholdRole } from '@/lib/atoms/role';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

/**
 * Bloc « Aujourd'hui » du hub, au-dessus de « Vos sections » (demande
 * explicite) : l'état de santé du jour de la personne enceinte — les
 * symptômes notés aujourd'hui dans le Journal — et une astuce du jour en
 * dessous.
 *
 * Visible des **deux** parents (choix explicite de l'utilisateur). Le
 * co-parent ne fait que lire : la RLS de `symptoms_log` le permet déjà et
 * réserve l'écriture à la personne enceinte (voir
 * `usePregnantSymptomsForDate`). Seule la personne enceinte a le lien vers
 * son Journal, l'onglet n'existant pas pour le co-parent.
 *
 * L'astuce suit le rôle de la personne connectée (`getTipOfTheDay`) :
 * conseil de grossesse pour elle, conseil d'accompagnement pour le
 * co-parent.
 *
 * Pastille d'en-tête : l'ourson de l'humeur du jour de la personne enceinte
 * (check-in d'Ensemble) dès qu'elle l'a notée, à la place du cœur — pour
 * elle comme pour le co-parent (demande explicite). Le cœur reste tant
 * qu'elle n'a rien noté. Pour elle, la pastille ouvre Ensemble, où l'humeur
 * se note et se modifie.
 *
 * Juste au-dessus, quand des symptômes sont notés, un carré « Conseil »
 * par symptôme (demande explicite), sur la teinte de ce symptôme — même
 * partage par rôle (`getSymptomTips`). Plusieurs conseils défilent l'un
 * après l'autre (`SymptomTipCarousel`).
 */
export function HealthTodayCard({
  household,
  role,
  partnerName,
  pregnantMood = null,
}: {
  household: Household | null | undefined;
  role: HouseholdRole;
  /** Humeur du jour de la personne enceinte (résumé du hub), ou `null`. */
  pregnantMood?: MoodValue | null;
  /** Prénom de l'autre parent, pour le titre côté co-parent. */
  partnerName: string | null;
}) {
  const accent = useThemeAccent();
  const isPregnant = role === 'pregnant';
  const { data: symptoms = [] } = usePregnantSymptomsForDate(
    household,
    todayIso(),
  );
  const tip = getTipOfTheDay(role);
  const symptomTips = getSymptomTips(symptoms, role);
  // « Pas de symptômes » (valeur `NO_SYMPTOM`) n'est pas un symptôme : on
  // ne le compte ni ne l'affiche en pastille, il change seulement le texte.
  const realSymptoms = withoutNoSymptom(symptoms);
  const hasDeclaredNoSymptom = symptoms.includes(NO_SYMPTOM);

  const title = isPregnant
    ? 'Votre forme aujourd’hui'
    : `${partnerName ?? 'Votre partenaire'} aujourd’hui`;

  return (
    <View
      className="gap-3.5 overflow-hidden rounded-[28px] p-4"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center gap-3">
        {/* La personne enceinte touche son ourson (ou le cœur, tant
            qu'elle n'a rien noté) pour aller noter ou changer son humeur du
            jour dans Ensemble (demande explicite). Côté partenaire, c'est
            l'humeur de l'autre : simple image, pas de lien. */}
        <Pressable
          disabled={!isPregnant}
          onPress={() => router.push('/ensemble')}
          accessibilityRole={
            isPregnant ? 'button' : pregnantMood ? 'image' : undefined
          }
          accessibilityLabel={
            isPregnant
              ? pregnantMood
                ? `Humeur du jour : ${MOOD_PRESENTATION[pregnantMood].label}. Modifier dans Ensemble`
                : 'Noter mon humeur du jour dans Ensemble'
              : pregnantMood
                ? `Humeur du jour : ${MOOD_PRESENTATION[pregnantMood].label}`
                : undefined
          }
          hitSlop={6}
          // Plus grand quand c'est l'ourson (demande explicite) : à 44 px
          // son expression ne se lisait pas.
          className={`${
            pregnantMood ? 'h-[60px] w-[60px]' : 'h-11 w-11'
          } items-center justify-center overflow-hidden rounded-full active:opacity-70`}
          style={{ backgroundColor: hexToRgba('#e8739a', 0.14) }}
        >
          {pregnantMood ? (
            <Image
              source={MOOD_PRESENTATION[pregnantMood].imgUrl}
              style={{ width: 56, height: 56 }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="heart" size={21} color="#e8739a" />
          )}
        </Pressable>
        <View className="flex-1 gap-0.5">
          <Text
            className="text-[16.5px] font-bold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {title}
          </Text>
          <Text className="text-[12.5px]" style={{ color: GLASS_BODY_COLOR }}>
            {hasDeclaredNoSymptom
              ? 'Pas de symptôme aujourd’hui'
              : realSymptoms.length === 0
                ? 'Aucun symptôme noté aujourd’hui'
                : `${realSymptoms.length} symptôme${
                    realSymptoms.length > 1 ? 's' : ''
                  } noté${realSymptoms.length > 1 ? 's' : ''} aujourd’hui`}
          </Text>
        </View>
        {isPregnant ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Noter mes symptômes du jour"
            hitSlop={8}
            onPress={() => router.push('/sante?tab=journal')}
            className="flex-row items-center gap-0.5 rounded-full px-3 py-1.5"
            style={{ backgroundColor: hexToRgba(accent, 0.1) }}
          >
            <Text className="text-[12.5px] font-bold" style={{ color: accent }}>
              {symptoms.length === 0 ? 'Noter' : 'Modifier'}
            </Text>
            <Ionicons name="chevron-forward" size={13} color={accent} />
          </Pressable>
        ) : null}
      </View>

      {realSymptoms.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {realSymptoms.map((symptom) => {
            const visual = getSymptomVisual(symptom);
            return (
              <View
                key={symptom}
                className="flex-row items-center gap-1.5 rounded-full py-1 pl-1 pr-3"
                style={{ backgroundColor: visual.tint }}
              >
                <View className="h-7 w-7 items-center justify-center rounded-full bg-white/70">
                  <Text style={{ fontSize: 14 }}>{visual.emoji}</Text>
                </View>
                <Text
                  className="text-[13px] font-medium"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  {getSymptomLabel(symptom)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View
          className="flex-row items-center gap-2.5 rounded-[18px] px-3 py-2.5"
          style={{ backgroundColor: hexToRgba(accent, 0.06) }}
        >
          <Ionicons name="sunny-outline" size={18} color={accent} />
          <Text
            className="flex-1 text-[13px] leading-[18px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            {hasDeclaredNoSymptom
              ? isPregnant
                ? 'Journée sans symptôme, notée dans votre Journal. 🌿'
                : 'Pas de symptôme signalé aujourd’hui. 🌿'
              : isPregnant
                ? 'Une journée sans symptôme pour l’instant. Notez-les si quelque chose change.'
                : 'Rien de signalé pour l’instant aujourd’hui.'}
          </Text>
        </View>
      )}

      {symptomTips.length > 0 ? (
        // Nouvelle liste (symptôme ajouté ou retiré) : le cycle repart du
        // premier conseil.
        <SymptomTipCarousel
          key={symptomTips.map((tip) => tip.symptom).join('|')}
          tips={symptomTips}
        />
      ) : null}

      {tip ? (
        <View
          className="flex-row items-start gap-3 rounded-[20px] px-3.5 py-3"
          style={{ backgroundColor: hexToRgba('#f2b84b', 0.14) }}
        >
          <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
            <Ionicons name="bulb" size={17} color="#e0a530" />
            <SparkLines
              color="rgba(224, 165, 48, 0.6)"
              style={{ right: -16, top: -12, transform: [{ scale: 0.6 }] }}
            />
          </View>
          <View className="flex-1 gap-0.5">
            <Text
              className="text-[11.5px] font-bold"
              style={{ color: '#b07a12', letterSpacing: 0.8 }}
            >
              ASTUCE DU JOUR
            </Text>
            <Text
              className="text-[13.5px] leading-[19px]"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              {tip}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Temps d'affichage de chaque conseil avant de passer au suivant. */
const TIP_DISPLAY_MS = 7000;
/** Durée du fondu enchaîné entre deux conseils. */
const TIP_FADE_MS = 700;
/** Léger décalage horizontal pendant le fondu, en points. */
const TIP_DRIFT = 18;

/**
 * Conseils des symptômes du jour, un à la fois (demande explicite) : chacun
 * reste 7 s, puis fondu enchaîné vers le suivant — le conseil sortant
 * s'efface en glissant légèrement vers la gauche, le suivant apparaît depuis
 * la droite. Après le dernier, le premier revient de la même façon, sans fin.
 *
 * Les cartes sont posées en ligne (pour qu'elles s'étirent toutes à la
 * hauteur de la plus haute, sans saut de hauteur), puis ramenées les unes
 * sur les autres par `translateX`. Une seule valeur, `progress` (le conseil
 * affiché, fractionnaire pendant le fondu), pilote l'opacité et le décalage
 * de chacune. Mouvement réduit : changement sans fondu.
 */
function SymptomTipCarousel({
  tips,
}: {
  tips: { symptom: string; text: string }[];
}) {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const count = tips.length;

  useEffect(() => {
    progress.value = 0;
    if (count < 2) return;

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      const isBackToFirst = index === count;
      progress.value = withTiming(
        index,
        {
          duration: reduceMotion ? 0 : TIP_FADE_MS,
          easing: Easing.inOut(Easing.quad),
        },
        (finished) => {
          // `count` équivaut à 0 (voir `TipLayer`) : remise à zéro invisible.
          if (finished && isBackToFirst) progress.value = 0;
        },
      );
      if (isBackToFirst) index = 0;
    }, TIP_DISPLAY_MS);

    return () => clearInterval(timer);
  }, [count, reduceMotion, progress]);

  if (count === 1) return <SymptomTipSquare tip={tips[0]} />;

  return (
    <View
      className="overflow-hidden rounded-[20px]"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {/* Tant que la largeur n'est pas mesurée, le premier conseil seul. */}
      {width === 0 ? (
        <SymptomTipSquare tip={tips[0]} />
      ) : (
        <View className="flex-row" style={{ width: width * count }}>
          {tips.map((tip, index) => (
            <TipLayer
              key={tip.symptom}
              tip={tip}
              index={index}
              count={count}
              width={width}
              progress={progress}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Un conseil du carrousel. `distance` : écart entre ce conseil et celui
 * affiché, ramené entre -count/2 et count/2 pour que la boucle passe du
 * dernier au premier dans le même sens. 0 = affiché ; 1 = parti à gauche ;
 * -1 = en attente à droite.
 */
function TipLayer({
  tip,
  index,
  count,
  width,
  progress,
}: {
  tip: { symptom: string; text: string };
  index: number;
  count: number;
  width: number;
  progress: SharedValue<number>;
}) {
  const layerStyle = useAnimatedStyle(() => {
    const raw = progress.value - index + count / 2;
    const distance = (((raw % count) + count) % count) - count / 2;
    return {
      opacity: interpolate(
        Math.abs(distance),
        [0, 1],
        [1, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX:
            -index * width -
            interpolate(
              distance,
              [-1, 0, 1],
              [-TIP_DRIFT, 0, TIP_DRIFT],
              Extrapolation.CLAMP,
            ),
        },
      ],
    };
  });

  return (
    <Animated.View style={[{ width }, layerStyle]}>
      <SymptomTipSquare tip={tip} fillHeight />
    </Animated.View>
  );
}

/**
 * Carré « Conseil » lié à un symptôme du jour : pictogramme du symptôme dans
 * un rond blanc, intitulé « CONSEIL · <SYMPTÔME> », puis l'astuce — le tout
 * sur la teinte du symptôme (`SYMPTOM_VISUALS`), pour qu'on voie d'un coup
 * d'œil à quoi il répond.
 */
function SymptomTipSquare({
  tip,
  fillHeight = false,
}: {
  tip: { symptom: string; text: string };
  /** Dans le carrousel : prend la hauteur du plus haut conseil. */
  fillHeight?: boolean;
}) {
  const visual = getSymptomVisual(tip.symptom);

  return (
    <View
      className={`gap-2.5 rounded-[20px] px-3.5 py-3.5 ${
        fillHeight ? 'flex-1' : ''
      }`}
      style={{ backgroundColor: visual.tint }}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
          <Text style={{ fontSize: 18 }}>{visual.emoji}</Text>
        </View>
        <Text
          className="flex-1 text-[11.5px] font-bold"
          style={{
            color: GLASS_TITLE_COLOR,
            letterSpacing: 0.8,
            opacity: 0.75,
          }}
        >
          CONSEIL · {getSymptomLabel(tip.symptom).toUpperCase()}
        </Text>
      </View>
      <Text
        className="text-[13.5px] leading-[19px]"
        style={{ color: GLASS_TITLE_COLOR }}
      >
        {tip.text}
      </Text>
    </View>
  );
}

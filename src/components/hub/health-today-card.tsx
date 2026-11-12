import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

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
import { getSymptomTipOfTheDay } from '@/features/health/symptom-tips';
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
 * qu'elle n'a rien noté.
 *
 * Juste au-dessus, quand des symptômes sont notés, un carré « Conseil »
 * propre à l'un d'eux (demande explicite), sur la teinte de ce symptôme —
 * même partage par rôle (`getSymptomTipOfTheDay`).
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
  const symptomTip = getSymptomTipOfTheDay(symptoms, role);
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
        <View
          accessibilityRole={pregnantMood ? 'image' : undefined}
          accessibilityLabel={
            pregnantMood
              ? `Humeur du jour : ${MOOD_PRESENTATION[pregnantMood].label}`
              : undefined
          }
          // Plus grand quand c'est l'ourson (demande explicite) : à 44 px
          // son expression ne se lisait pas.
          className={`${
            pregnantMood ? 'h-[60px] w-[60px]' : 'h-11 w-11'
          } items-center justify-center overflow-hidden rounded-full`}
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
        </View>
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

      {symptomTip ? <SymptomTipSquare tip={symptomTip} /> : null}

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

/**
 * Carré « Conseil » lié à un symptôme du jour : pictogramme du symptôme dans
 * un rond blanc, intitulé « CONSEIL · <SYMPTÔME> », puis l'astuce — le tout
 * sur la teinte du symptôme (`SYMPTOM_VISUALS`), pour qu'on voie d'un coup
 * d'œil à quoi il répond.
 */
function SymptomTipSquare({ tip }: { tip: { symptom: string; text: string } }) {
  const visual = getSymptomVisual(tip.symptom);

  return (
    <View
      className="gap-2.5 rounded-[20px] px-3.5 py-3.5"
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

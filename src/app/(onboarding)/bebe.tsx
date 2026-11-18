import { router } from 'expo-router';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Image, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { DatePickerCalendar } from '@/components/date-picker-calendar';
import { OnboardingStepShell } from '@/components/onboarding/step-shell';
import { YesNoChoice } from '@/components/onboarding/yes-no-choice';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import {
  getWeeksOfAmenorrhea,
  PREGNANCY_DAYS,
} from '@/features/health/constants';
import { useThemeAccent } from '@/features/settings/hooks';
import { onboardingDraftAtom } from '@/lib/atoms/onboarding';
import { hexToRgba } from '@/lib/color';
import { daysBetween, shiftIsoDate, todayIso } from '@/lib/date';

const COUNTDOWN_BEAR = require('@/assets/images/Baby_said_hi.png');

/**
 * Écran 1b — Étape 3/6, date du terme.
 *
 * Question tournée vers la date du terme (demande explicite) plutôt que
 * « Quand votre bébé arrive-t-il ? » : c'est la date que donne le suivi
 * médical, et celle que l'app utilise (semaines d'aménorrhée, démarches).
 * Corrigeable ensuite dans Profil (`DueDateSheet`).
 *
 * Calendrier plutôt que molette (demande explicite, « plus simple »,
 * d'après une capture de référence) : un mois à la fois, le jour choisi en
 * rond plein, puis un encart « Plus que N jours avant la rencontre » avec
 * l'ourson de l'app. Pas de date passée (demande explicite), ni au-delà
 * d'une grossesse entière (280 jours) : ces jours sont estompés. Un
 * brouillon resté sur une date dépassée (retour en arrière le lendemain)
 * bloque « Suivant » avec une explication.
 */
export default function BabyArrivalStep() {
  const { t } = useTranslation();
  const [draft, setDraft] = useAtom(onboardingDraftAtom);
  const accent = useThemeAccent();
  const today = todayIso();
  const maxDate = shiftIsoDate(today, PREGNANCY_DAYS);
  const isDueDateInPast = draft.dueDate !== null && draft.dueDate < today;

  return (
    <OnboardingStepShell
      step={3}
      title={t('onboarding.dueDate.title')}
      primaryLabel={t('onboarding.next')}
      isPrimaryDisabled={
        draft.dueDate === null || isDueDateInPast || draft.isFirstChild === null
      }
      onPrimaryPress={() => router.push('/statut')}
    >
      <View className="gap-3">
        <DatePickerCalendar
          value={draft.dueDate}
          accent={accent}
          minDate={today}
          maxDate={maxDate}
          onChange={(dueDate) =>
            setDraft((current) => ({ ...current, dueDate }))
          }
        />
        {isDueDateInPast ? (
          <Text className="px-1 text-[12.5px] text-[#c9553d]">
            {t('onboarding.dueDate.mustBeFuture')}
          </Text>
        ) : draft.dueDate ? (
          <CountdownCard
            key={draft.dueDate}
            dueDate={draft.dueDate}
            today={today}
            accent={accent}
          />
        ) : null}
      </View>

      <View className="gap-2.5 pt-4">
        <Text className="text-[14px] font-medium text-[#1a1a1a]">
          {t('onboarding.dueDate.firstChild')}
        </Text>
        <YesNoChoice
          value={draft.isFirstChild}
          onChange={(isFirstChild) =>
            setDraft((current) => ({ ...current, isFirstChild }))
          }
        />
      </View>
    </OnboardingStepShell>
  );
}

/**
 * « Plus que 73 jours avant la rencontre 💗 », et les semaines
 * d'aménorrhée qui en découlent : on voit tout de suite si la date tient.
 */
function CountdownCard({
  dueDate,
  today,
  accent,
}: {
  dueDate: string;
  today: string;
  accent: string;
}) {
  const { t } = useTranslation();
  const days = daysBetween(today, dueDate);
  const weeks = getWeeksOfAmenorrhea(dueDate, today);
  const title =
    days === 0
      ? t('onboarding.dueDate.today')
      : t('onboarding.dueDate.daysLeft', { count: days });

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      className="flex-row items-center gap-3 py-3 pl-2 pr-4"
      style={{ borderRadius: 24, backgroundColor: hexToRgba(accent, 0.09) }}
    >
      <Image
        source={COUNTDOWN_BEAR}
        style={{ width: 54, height: 54 }}
        resizeMode="contain"
      />
      <View className="flex-1 gap-0.5">
        <Text
          className="text-[15.5px] font-bold leading-5"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {title}
        </Text>
        {weeks !== null ? (
          <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
            {t('onboarding.dueDate.weeks', { count: weeks })}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

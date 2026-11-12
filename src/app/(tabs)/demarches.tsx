import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import { ProgressBar } from '@/components/organisation/progress-bar';

import { StatusBadge } from '@/components/procedures/status-badge';
import { StatusSelector } from '@/components/procedures/status-selector';
import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  GlassCard,
  SPARKS_ABOVE,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { getPregnancyMonth } from '@/features/health/constants';
import { useMyHousehold } from '@/features/household/hooks';
import {
  formatDeadlineLabel,
  getPregnancyMonthLabel,
  getProcedureIconStyle,
  getProcedurePregnancyMonth,
  getStatusLabel,
  PREGNANCY_MONTHS,
} from '@/features/procedures/constants';
import {
  useProcedures,
  useUpdateProcedureReminder,
  useUpdateProcedureStatus,
} from '@/features/procedures/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écrans 5a/5b — pilier Démarches. Liste et détail dans un seul écran, avec
 * l'affichage basculé par état local plutôt que par une route imbriquée —
 * même parti pris que le pilier Suivi santé (`sante.tsx`).
 *
 * Le référentiel des 8 démarches (`procedure_templates`) est partagé par
 * tout le foyer, modifiable par les deux parents : pas de règle de
 * visibilité par rôle ici, contrairement aux piliers Ensemble et Suivi
 * santé. Étendu de 6 à 8 sur demande explicite (Assurance habitation,
 * Administration fiscale) — écart assumé avec CONCEPT.md, qui n'en liste
 * que 6.
 *
 * Habillage d'après une capture de référence (demande explicite, « moderne
 * et facile à comprendre ») : titre souligné, avancement en texte **et** en
 * barre, mois en pastilles « 9 / mois » encadrées de flèches (le mois choisi
 * en pastille d'accent surmontée de petits traits), démarches en cartes
 * translucides à grande pastille d'icône, statut et chevron.
 */
export default function ProceduresScreen() {
  const router = useRouter();
  const { data: household } = useMyHousehold();

  const { data: procedures = [] } = useProcedures(household);
  const updateStatus = useUpdateProcedureStatus(household);
  const updateReminder = useUpdateProcedureReminder(household);

  const changeStatus = (
    householdProcedureId: string,
    status: 'a_faire' | 'en_cours' | 'fait',
  ) => {
    updateStatus.mutate({ householdProcedureId, status });
  };

  const toggleReminder = (
    householdProcedureId: string,
    reminderEnabled: boolean,
  ) => {
    updateReminder.mutate({ householdProcedureId, reminderEnabled });
  };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = procedures.find(
    (procedure) => procedure.householdProcedureId === selectedId,
  );

  // Mois de grossesse en cours, déduit de la date de terme saisie à
  // l'onboarding (demande explicite) — `null` si elle est inconnue.
  const dueDate = household?.due_date ?? null;
  const currentMonth = getPregnancyMonth(dueDate);

  // Il y a toujours exactement un mois actif (plus de « tous les mois »
  // désélectionné). Démarre sur le mois de grossesse en cours (1er à
  // défaut). Il change au tap sur un mois ou via les flèches ; faire
  // glisser la rangée ne fait que la parcourir.
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth ?? 1);

  // Le foyer arrive en différé : tant que l'utilisateur n'a pas choisi de
  // mois lui-même, on se cale sur le mois en cours dès qu'il est connu.
  const hasPickedMonthRef = useRef(false);
  useEffect(() => {
    if (currentMonth !== null && !hasPickedMonthRef.current) {
      setSelectedMonth(currentMonth);
    }
  }, [currentMonth]);

  // Le mois actif est centré **quand c'est possible** : la rangée n'a plus
  // de marge d'une demi-largeur d'écran de chaque côté (demande explicite —
  // trop d'espace entre la flèche et « 1 mois »), donc les premiers et
  // derniers mois restent collés aux bords au lieu d'atteindre le centre.
  // C'est pour ça que le glissé ne sélectionne plus le mois centré : au
  // bout de la rangée, ce serait le 3e ou le 7e mois, jamais le 1er ou le 9e.
  const [monthViewportWidth, setMonthViewportWidth] = useState(0);
  const monthScrollRef = useRef<ScrollView>(null);
  const monthLayoutsRef = useRef<Map<number, { x: number; width: number }>>(
    new Map(),
  );

  const scrollToMonth = (month: number) => {
    const layout = monthLayoutsRef.current.get(month);
    if (!layout || !monthViewportWidth) return;
    const targetX = layout.x + layout.width / 2 - monthViewportWidth / 2;
    monthScrollRef.current?.scrollTo({
      x: Math.max(targetX, 0),
      animated: true,
    });
  };

  // Recentre le mois sélectionné dès que layouts/viewport sont mesurés.
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollToMonth lit selectedMonth/monthViewportWidth via closure ; les redéclarer en dépendance boucle sur elle-même sans changer le comportement.
  useEffect(() => {
    scrollToMonth(selectedMonth);
  }, [selectedMonth, monthViewportWidth]);

  const visibleProcedures = procedures.filter(
    (procedure) => getProcedurePregnancyMonth(procedure) === selectedMonth,
  );

  const completedCount = procedures.filter((p) => p.status === 'fait').length;
  const totalCount = procedures.length || 8;
  const firstMonth = PREGNANCY_MONTHS[0];
  const lastMonth = PREGNANCY_MONTHS[PREGNANCY_MONTHS.length - 1];
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  // Démarches par mois : total et restantes (non faites), pour les
  // pastilles des mois et l'état vide.
  const monthStats = new Map<number, { total: number; remaining: number }>();
  for (const procedure of procedures) {
    const month = getProcedurePregnancyMonth(procedure);
    if (month === null) continue;
    const stats = monthStats.get(month) ?? { total: 0, remaining: 0 };
    stats.total += 1;
    if (procedure.status !== 'fait') stats.remaining += 1;
    monthStats.set(month, stats);
  }

  // État vide : prochain mois (après celui choisi) qui a encore des
  // démarches à faire, sinon le plus proche avant lui.
  const monthsWithRemaining = PREGNANCY_MONTHS.filter(
    (month) => (monthStats.get(month)?.remaining ?? 0) > 0,
  );
  const nextStepMonth =
    monthsWithRemaining.find((month) => month > selectedMonth) ??
    [...monthsWithRemaining].reverse().find((month) => month < selectedMonth) ??
    null;
  const nextStepProcedure =
    nextStepMonth === null
      ? null
      : procedures.find(
          (procedure) =>
            getProcedurePregnancyMonth(procedure) === nextStepMonth &&
            procedure.status !== 'fait',
        );

  const goToMonth = (month: number) => {
    hasPickedMonthRef.current = true;
    const clamped = Math.min(Math.max(month, firstMonth), lastMonth);
    setSelectedMonth(clamped);
    scrollToMonth(clamped);
  };

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Ionicons
            name="heart-outline"
            size={44}
            color={hexToRgba(accent, 0.4)}
            style={{
              position: 'absolute',
              top: 30,
              right: 8,
              transform: [{ rotate: '14deg' }],
            }}
          />
          <Pressable
            accessibilityLabel="Revenir en arrière"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => (selected ? setSelectedId(null) : router.back())}
            style={tintedShadow(accent)}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="chevron-back" size={22} color={GLASS_TITLE_COLOR} />
          </Pressable>
        </View>

        {selected ? (
          <ProcedureDetail
            procedure={selected}
            birthDate={household?.birth_date ?? null}
            accent={accent}
            onChangeStatus={(status) =>
              changeStatus(selected.householdProcedureId, status)
            }
            onToggleReminder={(reminderEnabled) =>
              toggleReminder(selected.householdProcedureId, reminderEnabled)
            }
          />
        ) : (
          <>
            <View className="gap-2">
              <Text
                className="text-[32px] font-extrabold leading-10"
                style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.7 }}
              >
                Démarches
              </Text>
              <Svg width={130} height={12} viewBox="0 0 130 12">
                <Path
                  d="M4 8 C 40 3, 90 2, 126 5"
                  stroke={hexToRgba(accent, 0.55)}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              <View className="mt-1 gap-2">
                <Text
                  className="text-[15px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {completedCount} sur {totalCount} complétées
                </Text>
                {/* Ajout à la capture : rend l'avancement lisible d'un coup
                    d'œil (demande « facile de compréhension »). */}
                <ProgressBar progress={completedCount / totalCount} />
              </View>
            </View>

            <View className="gap-3">
              <Text
                className="text-[12.5px] font-bold"
                style={{ color: '#5b5470', letterSpacing: 1.1 }}
              >
                PAR MOIS DE GROSSESSE
              </Text>
              <Text
                className="-mt-1.5 text-[13px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                Sélectionnez un mois pour voir les démarches à prévoir.
              </Text>
              <View className="flex-row items-center gap-1.5">
                <MonthArrow
                  direction="back"
                  isDisabled={selectedMonth <= firstMonth}
                  accent={accent}
                  onPress={() => goToMonth(selectedMonth - 1)}
                />
                <ScrollView
                  ref={monthScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-1"
                  contentContainerClassName="items-center gap-2 pb-2 pt-7"
                  contentContainerStyle={{ paddingHorizontal: 4 }}
                  onLayout={(event) => {
                    const width = event.nativeEvent.layout.width;
                    setMonthViewportWidth((current) =>
                      current === width ? current : width,
                    );
                  }}
                >
                  {PREGNANCY_MONTHS.map((month) => (
                    <MonthPill
                      key={month}
                      month={month}
                      isActive={month === selectedMonth}
                      isCurrent={month === currentMonth}
                      remaining={monthStats.get(month)?.remaining ?? 0}
                      total={monthStats.get(month)?.total ?? 0}
                      accent={accent}
                      onPress={() => goToMonth(month)}
                      onLayout={(x, width) => {
                        monthLayoutsRef.current.set(month, { x, width });
                        if (month === selectedMonth) scrollToMonth(month);
                      }}
                    />
                  ))}
                </ScrollView>
                <MonthArrow
                  direction="forward"
                  isDisabled={selectedMonth >= lastMonth}
                  accent={accent}
                  onPress={() => goToMonth(selectedMonth + 1)}
                />
              </View>
            </View>

            <View className="gap-3">
              {visibleProcedures.length === 0 ? (
                <EmptyMonthCard
                  accent={accent}
                  nextStepMonth={nextStepMonth}
                  nextStepTitle={nextStepProcedure?.title ?? null}
                  onSeeNextStep={() =>
                    nextStepMonth === null
                      ? undefined
                      : goToMonth(nextStepMonth)
                  }
                />
              ) : null}
              {visibleProcedures.map((procedure) => {
                const deadline = formatDeadlineLabel(
                  procedure.deadline_days_after_birth,
                  household?.birth_date ?? null,
                );
                const iconStyle = getProcedureIconStyle(procedure.slug);
                return (
                  <GlassCard
                    key={procedure.householdProcedureId}
                    accessibilityLabel={`${procedure.title}, ${getStatusLabel(procedure.status)}`}
                    accent={accent}
                    onPress={() =>
                      setSelectedId(procedure.householdProcedureId)
                    }
                  >
                    <View className="flex-row items-center gap-3.5 py-4 pl-4 pr-3">
                      <View
                        style={{ backgroundColor: iconStyle.bg }}
                        className="h-14 w-14 items-center justify-center rounded-full"
                      >
                        <Ionicons
                          name={iconStyle.icon}
                          size={26}
                          color={iconStyle.color}
                        />
                      </View>
                      <View className="flex-1 gap-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text
                            className="shrink text-[16px] font-bold"
                            style={{ color: GLASS_TITLE_COLOR }}
                          >
                            {procedure.title}
                          </Text>
                          {procedure.reminderEnabled ? (
                            <View
                              accessibilityLabel="Rappel activé avant l’échéance"
                              className="h-[18px] w-[18px] items-center justify-center rounded-full"
                              style={{
                                backgroundColor: hexToRgba(accent, 0.14),
                              }}
                            >
                              <Ionicons
                                name="notifications"
                                size={10}
                                color={accent}
                              />
                            </View>
                          ) : null}
                        </View>
                        <Text
                          className="text-[13px] leading-[18px]"
                          style={{ color: GLASS_BODY_COLOR }}
                        >
                          {deadline}
                        </Text>
                      </View>
                      <StatusBadge
                        status={procedure.status}
                        todoColor={{ bg: iconStyle.bg, text: iconStyle.color }}
                      />
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#a8a8b3"
                      />
                    </View>
                  </GlassCard>
                );
              })}
            </View>

            <DashedLoopDoodle color={accent} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const tintedShadow = (accent: string) =>
  ({
    shadowColor: accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  }) as const;

/** « 1er mois », « 3e mois »… */
function shortMonthLabel(month: number): string {
  return month === 1 ? '1er mois' : `${month}e mois`;
}

/**
 * État vide d'un mois sans démarche — renvoie vers la suite plutôt que de
 * s'arrêter là (demande explicite) : la prochaine démarche à faire et un
 * bouton « Voir » qui sélectionne son mois (et fait défiler la rangée).
 */
function EmptyMonthCard({
  accent,
  nextStepMonth,
  nextStepTitle,
  onSeeNextStep,
}: {
  accent: string;
  nextStepMonth: number | null;
  nextStepTitle: string | null;
  onSeeNextStep: () => void;
}) {
  return (
    <View
      className="gap-3.5 rounded-[28px] px-4 py-4"
      style={{ backgroundColor: hexToRgba(accent, 0.07) }}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
          <Ionicons name="leaf-outline" size={19} color={accent} />
        </View>
        <Text
          className="flex-1 text-[15px] font-bold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          Aucune démarche ce mois-ci.
        </Text>
      </View>

      {nextStepMonth !== null && nextStepTitle ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Voir la prochaine étape : ${nextStepTitle}, ${shortMonthLabel(nextStepMonth)}`}
          onPress={onSeeNextStep}
          className="flex-row items-center gap-3 rounded-[22px] bg-white py-3 pl-4 pr-3 active:opacity-80"
          style={tintedShadow(accent)}
        >
          <View className="flex-1 gap-0.5">
            <Text
              className="text-[12px] font-semibold"
              style={{ color: accent }}
            >
              Prochaine étape · {shortMonthLabel(nextStepMonth)}
            </Text>
            <Text
              className="text-[14.5px] font-bold"
              style={{ color: GLASS_TITLE_COLOR }}
            >
              {nextStepTitle}
            </Text>
          </View>
          <View
            className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
            style={{ backgroundColor: accent }}
          >
            <Text className="text-[13px] font-bold text-white">Voir</Text>
            <Ionicons name="arrow-forward" size={14} color="#ffffff" />
          </View>
        </Pressable>
      ) : (
        <Text
          className="px-1 text-[13.5px] leading-5"
          style={{ color: GLASS_BODY_COLOR }}
        >
          Toutes vos démarches sont faites — bravo.
        </Text>
      )}
    </View>
  );
}

/** Flèche ronde de part et d'autre des mois : un mois de plus ou de moins. */
function MonthArrow({
  direction,
  isDisabled,
  accent,
  onPress,
}: {
  direction: 'back' | 'forward';
  isDisabled: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        direction === 'back' ? 'Mois précédent' : 'Mois suivant'
      }
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      hitSlop={6}
      style={[tintedShadow(accent), { opacity: isDisabled ? 0.35 : 1 }]}
      className="mt-5 h-10 w-10 items-center justify-center rounded-full bg-white"
    >
      <Ionicons
        name={direction === 'back' ? 'chevron-back' : 'chevron-forward'}
        size={18}
        color={GLASS_TITLE_COLOR}
      />
    </Pressable>
  );
}

const INACTIVE_PILL_BG = 'rgba(255, 255, 255, 0.9)';
const MONTH_PILL_HEIGHT = 56;
const MONTH_PILL_ACTIVE_HEIGHT = 66;

/**
 * Un mois : numéro en grand et « mois » dessous. Le mois choisi devient une
 * pastille d'accent plus haute, surmontée de petits traits.
 *
 * Animation à la sélection (demande explicite) : la pastille s'écrase un
 * instant puis rebondit, grandit et se colore en fondu, et les traits
 * jaillissent juste après — même vocabulaire que la bulle de la barre
 * d'onglets. Le `Pressable` garde une hauteur fixe (celle de la pastille
 * active) : la rangée ne bouge pas pendant que la pastille grandit, et
 * les mesures `onLayout` du recentrage restent stables.
 */
function MonthPill({
  month,
  isActive,
  isCurrent,
  remaining,
  total,
  accent,
  onPress,
  onLayout,
}: {
  month: number;
  isActive: boolean;
  /** Mois de grossesse en cours : liseré d'accent quand il n'est pas choisi. */
  isCurrent: boolean;
  /** Démarches non faites ce mois-là — chiffre de la pastille. */
  remaining: number;
  /** Démarches du mois, faites ou non — coche quand tout est fait. */
  total: number;
  accent: string;
  onPress: () => void;
  onLayout: (x: number, width: number) => void;
}) {
  const activeness = useSharedValue(isActive ? 1 : 0);
  const pop = useSharedValue(1);
  const sparks = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    activeness.value = withTiming(isActive ? 1 : 0, { duration: 220 });
    if (isActive) {
      pop.value = withSequence(
        withTiming(0.86, { duration: 90 }),
        withSpring(1, { damping: 8, stiffness: 230 }),
      );
      sparks.value = 0;
      sparks.value = withDelay(
        150,
        withSpring(1, { damping: 10, stiffness: 200 }),
      );
    } else {
      sparks.value = withTiming(0, { duration: 120 });
    }
  }, [isActive, activeness, pop, sparks]);

  const pillStyle = useAnimatedStyle(() => ({
    height:
      MONTH_PILL_HEIGHT +
      (MONTH_PILL_ACTIVE_HEIGHT - MONTH_PILL_HEIGHT) * activeness.value,
    backgroundColor: interpolateColor(
      activeness.value,
      [0, 1],
      [INACTIVE_PILL_BG, accent],
    ),
    transform: [{ scale: pop.value }],
  }));
  const numberStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeness.value,
      [0, 1],
      [GLASS_TITLE_COLOR, '#ffffff'],
    ),
  }));
  const unitStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      activeness.value,
      [0, 1],
      [GLASS_BODY_COLOR, 'rgba(255, 255, 255, 0.85)'],
    ),
  }));
  const sparksStyle = useAnimatedStyle(() => ({
    opacity: sparks.value,
    transform: [
      { translateY: (1 - sparks.value) * 6 },
      { scale: 0.5 + 0.5 * sparks.value },
    ],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${getPregnancyMonthLabel(month)}${
        isCurrent ? ', mois en cours' : ''
      }${
        remaining > 0
          ? `, ${remaining} démarche${remaining > 1 ? 's' : ''} à faire`
          : total > 0
            ? ', démarches faites'
            : ''
      }`}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      onLayout={(event) =>
        onLayout(event.nativeEvent.layout.x, event.nativeEvent.layout.width)
      }
      className="w-14 items-center justify-center"
      style={{ height: MONTH_PILL_ACTIVE_HEIGHT }}
    >
      <Animated.View
        className="w-14 items-center justify-center rounded-[22px]"
        style={[
          isActive
            ? {
                shadowColor: accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6,
              }
            : {
                // Mois en cours : liseré d'accent plus marqué, pour qu'on
                // le repère même quand un autre mois est choisi.
                borderWidth: isCurrent ? 2 : 1,
                borderColor: hexToRgba(accent, isCurrent ? 0.6 : 0.1),
              },
          pillStyle,
        ]}
      >
        <Animated.Text
          className="text-[19px] font-extrabold leading-6"
          style={numberStyle}
        >
          {month}
        </Animated.Text>
        <Animated.Text className="text-[11.5px]" style={unitStyle}>
          mois
        </Animated.Text>
      </Animated.View>

      {/* Pastille : nombre de démarches à faire ce mois-là, ou coche quand
          elles sont toutes faites. Inversée sur le mois choisi (blanc sur
          accent) pour rester lisible. */}
      {total > 0 ? (
        <View
          pointerEvents="none"
          className="absolute -right-1 top-0 h-[20px] min-w-[20px] items-center justify-center rounded-full px-1"
          style={{
            backgroundColor:
              remaining === 0 ? '#ffffff' : isActive ? '#ffffff' : accent,
            borderWidth: 2,
            borderColor: isActive ? accent : '#ffffff',
          }}
        >
          {remaining > 0 ? (
            <Text
              className="text-[11px] font-extrabold"
              style={{ color: isActive ? accent : '#ffffff' }}
            >
              {remaining}
            </Text>
          ) : (
            <Ionicons name="checkmark" size={11} color={accent} />
          )}
        </View>
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: -26, left: 15, width: 26, height: 26 },
          sparksStyle,
        ]}
      >
        <SparkLines
          color={hexToRgba(accent, 0.6)}
          sparks={SPARKS_ABOVE}
          style={{ top: 0, left: 0 }}
        />
      </Animated.View>
    </Pressable>
  );
}

function ProcedureDetail({
  procedure,
  birthDate,
  accent,
  onChangeStatus,
  onToggleReminder,
}: {
  procedure: {
    title: string;
    description: string | null;
    documents: string[];
    official_link: string | null;
    deadline_days_after_birth: number | null;
    status: string;
    reminderEnabled: boolean;
  };
  birthDate: string | null;
  accent: string;
  onChangeStatus: (status: 'a_faire' | 'en_cours' | 'fait') => void;
  onToggleReminder: (reminderEnabled: boolean) => void;
}) {
  const deadline = formatDeadlineLabel(
    procedure.deadline_days_after_birth,
    birthDate,
  );

  return (
    <View className="gap-5">
      <View className="gap-1.5">
        <Text
          className="text-[28px] font-extrabold leading-9"
          style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.5 }}
        >
          {procedure.title}
        </Text>
        {deadline ? (
          <Text className="text-[14px] font-semibold" style={{ color: accent }}>
            {deadline}
          </Text>
        ) : null}
      </View>

      {procedure.description ? (
        <Text className="text-[14px] leading-5 text-[#6b6b6b]">
          {procedure.description}
        </Text>
      ) : null}

      <View className="gap-2.5">
        <Text className="text-[13px] font-medium text-[#1a1a1a]">Statut</Text>
        <StatusSelector status={procedure.status} onChange={onChangeStatus} />
      </View>

      {procedure.documents.length > 0 ? (
        <View className="gap-2.5">
          <Text className="text-[13px] font-medium text-[#1a1a1a]">
            Documents à fournir
          </Text>
          <View className="gap-2 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
            {procedure.documents.map((document) => (
              <View key={document} className="flex-row items-start gap-2">
                <Text className="text-[13px] text-accent">•</Text>
                <Text className="flex-1 text-[14px] text-[#1a1a1a]">
                  {document}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between gap-3 shadow-sm rounded-xl bg-white px-3.5 py-3">
        <Text className="flex-1 text-[14px] text-[#1a1a1a]">
          Me rappeler avant l’échéance
        </Text>
        <Switch
          value={procedure.reminderEnabled}
          onValueChange={onToggleReminder}
          trackColor={{ true: accent }}
        />
      </View>

      {/* Pas d'explication de procédure dans l'app (CONCEPT.md) : juste le
          lien vers le téléservice officiel. Absent pour la mutuelle — c'est
          un assureur privé propre à chaque foyer, aucun lien officiel
          générique n'existe. */}
      {procedure.official_link ? (
        <PillButton
          label="Accéder au téléservice officiel"
          icon="open-outline"
          onPress={() => Linking.openURL(procedure.official_link as string)}
        />
      ) : null}
    </View>
  );
}

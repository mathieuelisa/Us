import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from 'expo-router';
import { type ComponentProps, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeOutLeft,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { DepartureModal } from '@/components/contractions/departure-modal';
import { ProgressBar } from '@/components/organisation/progress-bar';
import {
  FeedbackBanner,
  useFeedbackBanner,
} from '@/components/ui/feedback-banner';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import {
  isTempId,
  useContractionActions,
  useLatestContractionSession,
  useNow,
} from '@/features/contractions/hooks';
import {
  analyzeContractions,
  type Contraction,
  DEPARTURE_INTERVAL_MS,
  formatClock,
  formatDuration,
  formatTimeOfDay,
} from '@/features/contractions/rules';
import { useMyHousehold } from '@/features/household/hooks';
import { filterVisibleChecklistItems } from '@/features/organisation/constants';
import { useChecklistItems } from '@/features/organisation/hooks';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const GLASS_SURFACE = {
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.95)',
} as const;

const URGENT_RED = '#c2410c';
const BUTTON_SIZE = 212;
const ROW_LAYOUT = LinearTransition.springify().damping(18).stiffness(170);

/**
 * Assistant contractions & départ maternité (demande explicite). Choix de
 * l'utilisateur :
 *   - **un gros bouton pour chaque contraction** : toucher au début, toucher
 *     à la fin — la durée s'enregistre seule. C'est le geste répété pendant
 *     la douleur, il a la plus grosse cible ;
 *   - le **suivi** démarre tout seul à la première contraction et son
 *     chronomètre tourne en fond (calculé depuis l'heure de début en base,
 *     il survit à la fermeture de l'app) jusqu'à « Terminer » ;
 *   - stockage Supabase partagé : la mère ou le partenaire chronomètre,
 *     l'autre voit le suivi (rechargé toutes les 10 s) ;
 *   - règle française classique pour la modale de départ (voir
 *     `analyzeContractions`), qui renvoie vers la valise.
 */
export function ContractionAssistant({
  canShowDeparture,
}: {
  /** Faux tant que le paywall premium couvre l'écran. */
  canShowDeparture: boolean;
}) {
  // Les écrans restent montés entre deux visites (`Tabs`) : la modale ne
  // doit s'ouvrir que sur cet écran, pas par-dessus un autre.
  const isFocused = useIsFocused();
  const accent = useThemeAccent();
  const { data: household } = useMyHousehold();
  const { data: session = null, isLoading } = useLatestContractionSession();
  const { start, end, finish, remove } = useContractionActions();
  const { feedback, showFeedback } = useFeedbackBanner();
  const { data: checklistItems = [] } = useChecklistItems(household);

  const isOpen = Boolean(session && !session.endedAt);
  const now = useNow(isOpen);
  const contractions = session?.contractions ?? [];
  const analysis = analyzeContractions(
    contractions,
    now,
    household?.is_first_child ?? null,
  );
  const current = isOpen ? analysis.current : null;

  // La modale s'ouvre une fois par suivi ; la carte « Quand partir ? » la
  // rouvre à la demande.
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(
    null,
  );
  const [isDepartureForced, setIsDepartureForced] = useState(false);
  const isDepartureVisible =
    isFocused &&
    canShowDeparture &&
    isOpen &&
    analysis.shouldLeave &&
    (isDepartureForced || dismissedSessionId !== session?.id);

  const valiseItems = filterVisibleChecklistItems(checklistItems, {
    hideCoParent: household?.accompaniment_type === 'seul',
  }).filter((item) => item.checklistSlug === 'valise-maternite');

  const onError = (message: string) => () => showFeedback('error', message);

  const pressMainButton = () => {
    const at = new Date().toISOString();
    if (current) {
      end.mutate(
        { id: current.id, endedAt: at },
        {
          onError: onError('La fin de la contraction n’a pas été enregistrée.'),
        },
      );
      return;
    }
    start.mutate(
      {
        startedAt: at,
        sessionId:
          session && isOpen && !isTempId(session.id) ? session.id : null,
      },
      { onError: onError('La contraction n’a pas été enregistrée.') },
    );
  };

  const finishSession = () =>
    finish.mutate(
      { endedAt: new Date().toISOString() },
      { onError: onError('Le suivi n’a pas pu être terminé.') },
    );

  const removeContraction = (contraction: Contraction) =>
    remove.mutate(contraction.id, {
      onError: onError('La contraction n’a pas pu être supprimée.'),
    });

  if (isLoading) {
    return <Text className="text-[13px] text-[#9a9a9a]">Chargement…</Text>;
  }

  return (
    <View className="gap-5">
      <FeedbackBanner
        message={feedback?.message ?? null}
        tone={feedback?.tone}
        accent={accent}
      />

      <SessionCard
        accent={accent}
        isOpen={isOpen}
        elapsedMs={session ? now - Date.parse(session.startedAt) : 0}
        lastSession={
          session && !isOpen
            ? {
                durationMs:
                  Date.parse(session.endedAt as string) -
                  Date.parse(session.startedAt),
                count: analysis.count,
              }
            : null
        }
        onFinish={finishSession}
      />

      <View className="items-center gap-3">
        <ContractionButton
          accent={accent}
          isActive={Boolean(current)}
          elapsedMs={current ? now - Date.parse(current.startedAt) : 0}
          onPress={pressMainButton}
        />
        <Text
          className="text-center text-[13px] leading-[18px]"
          style={{ color: GLASS_BODY_COLOR }}
        >
          {current
            ? 'Touchez de nouveau quand la contraction s’arrête.'
            : isOpen
              ? 'Touchez dès que la prochaine contraction commence.'
              : 'Touchez dès qu’une contraction commence :\nle suivi démarre avec elle.'}
        </Text>
      </View>

      <View className="flex-row gap-2.5">
        <StatTile
          accent={accent}
          icon="pulse"
          label="Contractions"
          value={String(analysis.count)}
        />
        <StatTile
          accent={accent}
          icon="hourglass-outline"
          label="Durée moy."
          value={
            analysis.averageDurationMs === null
              ? '—'
              : formatDuration(analysis.averageDurationMs)
          }
        />
        <StatTile
          accent={accent}
          icon="swap-horizontal"
          label="Écart moyen"
          value={
            analysis.averageIntervalMs === null
              ? '—'
              : formatDuration(analysis.averageIntervalMs)
          }
        />
      </View>

      <DepartureRuleCard
        accent={accent}
        isFirstChild={household?.is_first_child ?? null}
        windowMs={analysis.windowMs}
        regularForMs={isOpen ? analysis.regularForMs : 0}
        progress={isOpen ? analysis.progress : 0}
        shouldLeave={isOpen && analysis.shouldLeave}
        onOpenDeparture={() => setIsDepartureForced(true)}
      />

      {contractions.length > 0 ? (
        <ContractionHistory
          accent={accent}
          contractions={contractions}
          now={now}
          onRemove={removeContraction}
        />
      ) : null}

      <UrgentSignsCard />

      <DepartureModal
        visible={isDepartureVisible}
        averageIntervalMs={analysis.averageIntervalMs}
        averageDurationMs={analysis.averageDurationMs}
        regularForMs={analysis.regularForMs}
        valise={{
          checked: valiseItems.filter((item) => item.checked).length,
          total: valiseItems.length,
        }}
        onClose={() => {
          setDismissedSessionId(session?.id ?? null);
          setIsDepartureForced(false);
        }}
      />
    </View>
  );
}

/** Chronomètre du suivi en cours, ou résumé du dernier suivi terminé. */
function SessionCard({
  accent,
  isOpen,
  elapsedMs,
  lastSession,
  onFinish,
}: {
  accent: string;
  isOpen: boolean;
  elapsedMs: number;
  lastSession: { durationMs: number; count: number } | null;
  onFinish: () => void;
}) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-[24px] px-4 py-3.5"
      style={{
        ...GLASS_SURFACE,
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(accent, isOpen ? 0.14 : 0.08) }}
      >
        <Ionicons
          name={isOpen ? 'timer-outline' : 'time-outline'}
          size={22}
          color={accent}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1.5">
          {isOpen ? <LiveDot accent={accent} /> : null}
          <Text
            className="text-[11px] font-bold"
            style={{ color: GLASS_BODY_COLOR, letterSpacing: 1 }}
          >
            {isOpen
              ? 'SUIVI EN COURS'
              : lastSession
                ? 'DERNIER SUIVI'
                : 'AUCUN SUIVI EN COURS'}
          </Text>
        </View>
        {isOpen ? (
          <Text
            className="text-[24px] font-extrabold"
            style={{
              color: GLASS_TITLE_COLOR,
              fontVariant: ['tabular-nums'],
              letterSpacing: -0.4,
            }}
          >
            {formatClock(elapsedMs)}
          </Text>
        ) : (
          <Text
            className="text-[14px] font-semibold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {lastSession
              ? `${formatDuration(lastSession.durationMs)} · ${lastSession.count} contraction${lastSession.count > 1 ? 's' : ''}`
              : 'Il démarre à la première contraction'}
          </Text>
        )}
      </View>
      {isOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Terminer le suivi des contractions"
          hitSlop={8}
          onPress={onFinish}
          className="flex-row items-center gap-1 rounded-full px-3 py-2 active:opacity-70"
          style={{ backgroundColor: hexToRgba(accent, 0.1) }}
        >
          <Ionicons name="stop-circle-outline" size={15} color={accent} />
          <Text className="text-[12.5px] font-bold" style={{ color: accent }}>
            Terminer
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Petit point qui pulse : le suivi tourne. */
function LiveDot({ accent }: { accent: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * pulse.value,
  }));

  return (
    <Animated.View
      className="h-2 w-2 rounded-full"
      style={[{ backgroundColor: accent }, style]}
    />
  );
}

/**
 * Gros bouton rond : au repos, disque d'accent « Début de contraction » ;
 * pendant une contraction, disque blanc cerclé d'accent avec le
 * chronomètre et un halo qui respire.
 */
function ContractionButton({
  accent,
  isActive,
  elapsedMs,
  onPress,
}: {
  accent: string;
  isActive: boolean;
  elapsedMs: number;
  onPress: () => void;
}) {
  const breath = useSharedValue(0);

  useEffect(() => {
    if (!isActive) {
      cancelAnimation(breath);
      breath.value = withTiming(0, { duration: 300 });
      return;
    }
    breath.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [isActive, breath]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + 0.22 * breath.value,
    transform: [{ scale: 1.04 + 0.1 * breath.value }],
  }));

  return (
    <View
      className="items-center justify-center"
      style={{ width: BUTTON_SIZE + 48, height: BUTTON_SIZE + 48 }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            backgroundColor: accent,
          },
          haloStyle,
        ]}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: BUTTON_SIZE + 26,
          height: BUTTON_SIZE + 26,
          borderRadius: (BUTTON_SIZE + 26) / 2,
          borderWidth: 1.5,
          borderColor: hexToRgba(accent, 0.18),
          borderStyle: 'dashed',
        }}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isActive
            ? `Fin de la contraction, en cours depuis ${formatDuration(elapsedMs)}`
            : 'Début de contraction'
        }
        onPress={onPress}
        className="items-center justify-center overflow-hidden active:opacity-90"
        style={{
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: BUTTON_SIZE / 2,
          backgroundColor: isActive ? '#ffffff' : accent,
          borderWidth: isActive ? 6 : 0,
          borderColor: accent,
          shadowColor: accent,
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.3,
          shadowRadius: 26,
          elevation: 8,
        }}
      >
        {/* Reflet clair en haut à droite, comme `PillButton`. */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -40,
            right: -30,
            width: 150,
            height: 130,
            borderRadius: 75,
            backgroundColor: isActive
              ? hexToRgba(accent, 0.07)
              : lightenHex(accent, 0.25),
            opacity: isActive ? 1 : 0.45,
          }}
        />
        {isActive ? (
          <View className="items-center gap-1">
            <Text
              className="text-[11.5px] font-bold"
              style={{ color: accent, letterSpacing: 1.2 }}
            >
              CONTRACTION
            </Text>
            <Text
              className="text-[46px] font-extrabold"
              style={{
                color: GLASS_TITLE_COLOR,
                fontVariant: ['tabular-nums'],
                letterSpacing: -1,
              }}
            >
              {formatClock(elapsedMs)}
            </Text>
            <View
              className="mt-1 flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: hexToRgba(accent, 0.12) }}
            >
              <Ionicons name="stop" size={12} color={accent} />
              <Text
                className="text-[12.5px] font-bold"
                style={{ color: accent }}
              >
                Fin
              </Text>
            </View>
          </View>
        ) : (
          <View className="items-center gap-2.5">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/25">
              <Ionicons name="play" size={26} color="#ffffff" />
            </View>
            <Text className="text-center text-[17px] font-extrabold leading-[22px] text-white">
              Début de{'\n'}contraction
            </Text>
          </View>
        )}
      </Pressable>
      {isActive ? null : (
        <SparkLines
          color={hexToRgba(accent, 0.55)}
          style={{ right: 18, top: 10 }}
        />
      )}
    </View>
  );
}

function StatTile({
  accent,
  icon,
  label,
  value,
}: {
  accent: string;
  icon: IoniconName;
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-1 gap-2 rounded-[20px] px-3 py-3"
      style={GLASS_SURFACE}
    >
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(accent, 0.1) }}
      >
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <View className="gap-0.5">
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          className="text-[17px] font-extrabold"
          style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
        >
          {value}
        </Text>
        <Text
          numberOfLines={1}
          className="text-[11.5px]"
          style={{ color: GLASS_BODY_COLOR }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

/** Où en est-on de la règle de départ ? */
function DepartureRuleCard({
  accent,
  isFirstChild,
  windowMs,
  regularForMs,
  progress,
  shouldLeave,
  onOpenDeparture,
}: {
  accent: string;
  isFirstChild: boolean | null;
  windowMs: number;
  regularForMs: number;
  progress: number;
  shouldLeave: boolean;
  onOpenDeparture: () => void;
}) {
  const ruleText = `Contractions toutes les ${formatDuration(DEPARTURE_INTERVAL_MS)} ou moins depuis ${formatDuration(windowMs)}${
    isFirstChild === true
      ? ' (premier bébé)'
      : isFirstChild === false
        ? ' (bébés suivants)'
        : ''
  }.`;

  return (
    <View
      className="gap-3 rounded-[24px] p-4"
      style={
        shouldLeave
          ? { backgroundColor: hexToRgba(accent, 0.12) }
          : GLASS_SURFACE
      }
    >
      <View className="flex-row items-center gap-2.5">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: shouldLeave ? '#ffffff' : hexToRgba(accent, 0.1),
          }}
        >
          <Ionicons name="car-outline" size={18} color={accent} />
        </View>
        <Text
          className="flex-1 text-[16px] font-bold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          Quand partir à la maternité ?
        </Text>
      </View>
      <Text
        className="text-[13.5px] leading-[19px]"
        style={{ color: GLASS_BODY_COLOR }}
      >
        {ruleText}
      </Text>
      <ProgressBar progress={progress} />
      <View className="flex-row items-center justify-between gap-2">
        <Text
          className="flex-1 text-[12.5px] font-semibold"
          style={{ color: shouldLeave ? accent : GLASS_TITLE_COLOR }}
        >
          {shouldLeave
            ? 'C’est le moment de partir.'
            : regularForMs > 0
              ? `Régulières depuis ${formatDuration(regularForMs)}`
              : 'Pas encore de rythme régulier'}
        </Text>
        {shouldLeave ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenDeparture}
            hitSlop={8}
            className="flex-row items-center gap-0.5 rounded-full bg-white px-3 py-1.5"
          >
            <Text className="text-[12.5px] font-bold" style={{ color: accent }}>
              Voir
            </Text>
            <Ionicons name="chevron-forward" size={13} color={accent} />
          </Pressable>
        ) : (
          <Text className="text-[12px]" style={{ color: GLASS_BODY_COLOR }}>
            {Math.round(progress * 100)} %
          </Text>
        )}
      </View>
    </View>
  );
}

/** Contractions du suivi, la plus récente en haut. */
function ContractionHistory({
  accent,
  contractions,
  now,
  onRemove,
}: {
  accent: string;
  contractions: Contraction[];
  now: number;
  onRemove: (contraction: Contraction) => void;
}) {
  const rows = contractions
    .map((contraction, index) => ({
      contraction,
      number: index + 1,
      intervalMs:
        index === 0
          ? null
          : Date.parse(contraction.startedAt) -
            Date.parse(contractions[index - 1].startedAt),
    }))
    .reverse();

  return (
    <View className="gap-2.5">
      <Text
        className="px-1 text-[12.5px] font-bold"
        style={{ color: GLASS_BODY_COLOR, letterSpacing: 1.1 }}
      >
        HISTORIQUE
      </Text>
      {rows.map(({ contraction, number, intervalMs }) => {
        const isRunning = contraction.endedAt === null;
        const durationMs =
          (isRunning ? now : Date.parse(contraction.endedAt as string)) -
          Date.parse(contraction.startedAt);
        return (
          <Animated.View
            key={contraction.id}
            entering={FadeInDown.duration(240)}
            exiting={FadeOutLeft.duration(260)}
            layout={ROW_LAYOUT}
            className="flex-row items-center gap-3 rounded-[20px] py-3 pl-3 pr-2"
            style={GLASS_SURFACE}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{
                backgroundColor: isRunning ? accent : hexToRgba(accent, 0.1),
              }}
            >
              <Text
                className="text-[14px] font-extrabold"
                style={{ color: isRunning ? '#ffffff' : accent }}
              >
                {number}
              </Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text
                className="text-[15px] font-bold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {isRunning ? 'En cours' : formatDuration(durationMs)}
                <Text
                  className="text-[13px] font-normal"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {'  ·  '}
                  {formatTimeOfDay(contraction.startedAt)}
                </Text>
              </Text>
              <Text
                className="text-[12.5px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {intervalMs === null
                  ? 'Première contraction'
                  : `${formatDuration(intervalMs)} après la précédente`}
              </Text>
            </View>
            {isRunning || isTempId(contraction.id) ? null : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Supprimer la contraction ${number}`}
                hitSlop={8}
                onPress={() => onRemove(contraction)}
                className="h-9 w-9 items-center justify-center rounded-full active:opacity-60"
              >
                <Ionicons name="close" size={18} color="#b0b0b8" />
              </Pressable>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * Signes qui doivent faire partir sans attendre la règle — affichés en
 * permanence, le calcul ne doit jamais rassurer à tort. Contenu à valider
 * par une sage-femme (voir `rules.ts`).
 */
function UrgentSignsCard() {
  return (
    <View
      className="gap-2.5 rounded-[24px] p-4"
      style={{ backgroundColor: hexToRgba(URGENT_RED, 0.07) }}
    >
      <View className="flex-row items-center gap-2.5">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
          <Ionicons name="alert-circle" size={19} color={URGENT_RED} />
        </View>
        <Text
          className="flex-1 text-[15px] font-bold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          Partez sans attendre si…
        </Text>
      </View>
      <Text
        className="text-[13.5px] leading-[20px]"
        style={{ color: GLASS_TITLE_COLOR }}
      >
        vous perdez les eaux, saignez, avez de la fièvre, sentez moins bouger le
        bébé, ou si la douleur ne s’arrête plus entre les contractions.
      </Text>
      <Text
        className="text-[12.5px] leading-[18px]"
        style={{ color: GLASS_BODY_COLOR }}
      >
        En cas de doute, appelez la maternité : elle est là pour ça, de jour
        comme de nuit.
      </Text>
    </View>
  );
}

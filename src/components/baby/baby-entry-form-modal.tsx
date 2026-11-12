import { Ionicons } from '@expo/vector-icons';
import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  type SharedValue,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MeasureWheelField } from '@/components/baby/measure-wheel-field';
import { BlobIllustration } from '@/components/ui/blob-illustration';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import {
  IconBubble,
  IconInput,
  type IoniconName,
} from '@/components/ui/icon-input';
import { PillButton } from '@/components/ui/pill-button';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import type { BabyEntry, BabyModule } from '@/features/baby/constants';
import { formatDurationSeconds } from '@/features/baby/constants';
import { parseTimeInput } from '@/features/health/constants';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';
import { todayIso } from '@/lib/date';

/**
 * Formulaire d'ajout d'une entrée de suivi bébé (écrans 8d/8f/8g/8h du
 * design). Une seule modale pour les 4 modules : la structure est
 * commune — segment de tête, date, heure, champs chiffrés, commentaire —
 * et `BABY_MODULES` décrit ce que chacun affiche.
 *
 * `animationType="none"` sur `Modal` (même parti pris que
 * `HowItWorksModal` et `AppointmentFormModal`) : le fond opaque apparaît
 * instantanément, seule la feuille glisse.
 *
 * Habillage d'après une capture de référence de « Ajouter un biberon »
 * (demande explicite), appliqué aux 4 modules puisque la modale est
 * commune : illustration et sous-titre en tête, bouton de fermeture,
 * segment en gélule d'accent, date compacte, champs `IconInput` deux par
 * ligne, « Enregistrer » en `PillButton`. Resserrée pour tenir sans
 * défiler (demande explicite).
 *
 * Les champs `kind: 'timer'` (durée d'allaitement, écran 8g) sont rendus
 * par `TimerField` : la durée se mesure au chronomètre, elle ne se tape
 * pas.
 *
 * Changer de segment demande confirmation (`DiscardTimerAlert`) dès qu'un
 * chronomètre porte une durée non enregistrée — qu'il tourne encore ou
 * qu'il soit arrêté sans avoir été enregistré. Passer du sein gauche au
 * sein droit remet le compteur à zéro, et cette durée serait perdue sans
 * un mot (demande explicite).
 */
export function BabyEntryFormModal({
  module,
  visible,
  initialEntry = null,
  lastValues = {},
  onSubmit,
  onCancel,
}: {
  module: BabyModule;
  visible: boolean;
  /**
   * Entrée à modifier (appui sur une ligne de l'historique, demande
   * explicite) : la modale s'ouvre préremplie et titrée `editLabel`.
   * `null` : ajout d'une nouvelle entrée.
   */
  initialEntry?: BabyEntry | null;
  /**
   * Dernière valeur connue de chaque champ : point de départ des molettes
   * de mesure, la nouvelle mesure en est rarement loin.
   */
  lastValues?: Record<string, string>;
  onSubmit: (entry: Omit<BabyEntry, 'id'>) => void;
  onCancel: () => void;
}) {
  const accent = useThemeAccent();
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState('');
  const [segment, setSegment] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  /**
   * Segment demandé pendant qu'un chronomètre tourne, en attente de
   * confirmation. `null` quand aucune alerte n'est ouverte.
   */
  const [pendingSegment, setPendingSegment] = useState<string | null>(null);
  /**
   * Incrémenté à chaque remise à zéro demandée au chronomètre (ouverture
   * de la modale, changement de segment confirmé). Un compteur plutôt
   * qu'un booléen : deux resets d'affilée doivent tous deux déclencher
   * l'effet.
   */
  const [timerResetToken, setTimerResetToken] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setDate(initialEntry?.date ?? todayIso());
    // Heure stockée en `HH:MM`, réaffichée comme on la tape (« 14h20 »).
    setTime(initialEntry?.time?.replace(':', 'h') ?? '');
    setSegment(initialEntry?.segment ?? module.segments?.options[0] ?? null);
    setValues(initialEntry ? { ...initialEntry.values } : {});
    setComment(initialEntry?.comment ?? '');
    setPendingSegment(null);
    setTimerResetToken((token) => token + 1);
  }, [visible, module, initialEntry]);

  function setValue(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  /**
   * Champ chronométré du module, le cas échéant — un seul aujourd'hui
   * (la durée d'allaitement), d'où le `find`.
   */
  const timerField = module.fields.find((field) => field.kind === 'timer');
  /** Durée déjà mesurée et arrêtée, en secondes ; `0` si aucune. */
  const stoppedSeconds =
    timerField && isNumberFilled(values[timerField.key])
      ? Number(values[timerField.key])
      : 0;
  /** Une durée est en jeu : chrono en marche, ou arrêté sans enregistrement. */
  const hasUnsavedDuration = isTimerRunning || stoppedSeconds > 0;

  /**
   * Passage à un autre segment, sous réserve qu'aucune durée non
   * enregistrée ne soit en jeu.
   */
  function selectSegment(option: string) {
    if (option === segment) return;
    if (hasUnsavedDuration) {
      setPendingSegment(option);
      return;
    }
    setSegment(option);
  }

  function discardTimerAndSwitch() {
    if (pendingSegment === null) return;
    setSegment(pendingSegment);
    setPendingSegment(null);
    setTimerResetToken((token) => token + 1);
    for (const field of module.fields) {
      if (field.kind === 'timer') setValue(field.key, '');
    }
  }

  const isTimeInvalid = time.trim().length > 0 && parseTimeInput(time) === null;
  const filledFieldCount = module.fields.filter((field) =>
    isNumberFilled(values[field.key]),
  ).length;
  const hasInvalidNumber = module.fields.some(
    (field) =>
      (values[field.key] ?? '').trim().length > 0 &&
      !isNumberFilled(values[field.key]),
  );
  const canSubmit =
    filledFieldCount >= module.requiredFieldCount &&
    !hasInvalidNumber &&
    !isTimeInvalid;

  // Poids et taille : molettes côte à côte (demande explicite).
  const wheelFields = module.fields.filter(
    (field) => field.kind === 'number' && field.wheel,
  );

  // Heure et champs chiffrés : petits champs posés deux par ligne.
  const smallInputs: { key: string; node: ReactNode }[] = [
    ...(module.hasTime
      ? [
          {
            key: 'time',
            node: (
              <IconInput
                icon="time-outline"
                placeholder="Heure, ex. 14h20"
                value={time}
                onChangeText={setTime}
                accent={accent}
                isInvalid={isTimeInvalid}
              />
            ),
          },
        ]
      : []),
    ...module.fields
      .filter((field) => field.kind === 'number' && !field.wheel)
      .map((field) => ({
        key: field.key,
        node: (
          <IconInput
            icon={FIELD_ICONS[field.key] ?? 'calculator-outline'}
            placeholder={`${field.label} (${field.unit})`}
            keyboardType="decimal-pad"
            value={values[field.key] ?? ''}
            onChangeText={(next) => setValue(field.key, next)}
            accent={accent}
            isInvalid={
              (values[field.key] ?? '').trim().length > 0 &&
              !isNumberFilled(values[field.key])
            }
          />
        ),
      })),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="max-h-[94%] overflow-hidden rounded-t-[32px] bg-white"
        >
          <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
          >
            <View
              style={{
                position: 'absolute',
                top: -70,
                right: -60,
                width: 220,
                height: 200,
                borderRadius: 110,
                backgroundColor: lightenHex(accent, 0.55),
                opacity: 0.35,
              }}
            />
          </View>

          {/* La feuille doit tenir sans défiler (demande explicite) : date
              compacte, petits champs deux par ligne, commentaire sur une
              ligne. Le `ScrollView` ne reste qu'en filet de sécurité (très
              petit écran, clavier ouvert). */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-3.5 px-5 pb-7 pt-2.5"
          >
            <View className="h-1.5 w-11 self-center rounded-full bg-[#e6e6ea]" />

            <View className="flex-row items-center gap-3.5">
              <BlobIllustration accent={accent}>
                <Text style={{ fontSize: 40 }}>{module.emoji}</Text>
              </BlobIllustration>
              <View className="flex-1 gap-1">
                <Text
                  className="text-[21px] font-extrabold leading-[26px]"
                  style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.4 }}
                >
                  {initialEntry ? module.editLabel : module.actionLabel}
                </Text>
                <Text
                  className="text-[13px] leading-[18px]"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  {module.formSubtitle}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fermer"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onCancel}
                className="h-9 w-9 items-center justify-center self-start rounded-full bg-white"
                style={{
                  shadowColor: accent,
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.14,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <Ionicons name="close" size={19} color={GLASS_TITLE_COLOR} />
              </Pressable>
            </View>

            {module.segments ? (
              <SegmentedField
                label={module.segments.label}
                options={module.segments.options}
                value={segment}
                onChange={selectSegment}
                accent={accent}
              />
            ) : null}

            <View className="gap-2">
              <FieldLabel
                icon="calendar-outline"
                label="Date"
                accent={accent}
              />
              <WheelDatePicker value={date} onChange={setDate} compact />
            </View>

            {module.fields
              .filter((field) => field.kind === 'timer')
              .map((field) => (
                <TimerField
                  // Remonter le composant est la remise à zéro : plus
                  // simple qu'un effet de reset, et l'intervalle en cours
                  // est nettoyé au passage.
                  key={`${field.key}-${timerResetToken}`}
                  label={field.label}
                  accent={accent}
                  initialSeconds={Number(initialEntry?.values[field.key]) || 0}
                  onRunningChange={setIsTimerRunning}
                  onStop={(seconds) => setValue(field.key, String(seconds))}
                  onStart={() => setValue(field.key, '')}
                />
              ))}

            {wheelFields.length > 0 ? (
              <View className="flex-row gap-2.5">
                {wheelFields.map((field) =>
                  field.wheel ? (
                    <MeasureWheelField
                      // Remonté à chaque ouverture : la molette repart de
                      // la dernière mesure, pas de la saisie précédente.
                      key={`${field.key}-${timerResetToken}`}
                      label={field.label}
                      unit={field.unit}
                      wheel={field.wheel}
                      value={values[field.key] || null}
                      // En modification, la molette part de la valeur de
                      // l'entrée (déjà dans `values`) ; en ajout, de la
                      // dernière mesure connue.
                      startValue={
                        Number(values[field.key]) ||
                        Number(lastValues[field.key]) ||
                        field.wheel.defaultValue
                      }
                      onChange={(next) => setValue(field.key, next ?? '')}
                      accent={accent}
                    />
                  ) : null,
                )}
              </View>
            ) : null}

            {smallInputs.length > 0 ? (
              <View className="gap-1.5">
                {chunkPairs(smallInputs).map((pair) => (
                  <View key={pair[0].key} className="flex-row gap-2.5">
                    {pair.map((input) => (
                      <View key={input.key} className="flex-1">
                        {input.node}
                      </View>
                    ))}
                  </View>
                ))}
                {isTimeInvalid ? (
                  <Text className="px-2 text-[12px] text-red-600">
                    Heure non reconnue. Formats acceptés : 14h20, 14:20.
                  </Text>
                ) : module.hasTime ? (
                  <Text
                    className="px-2 text-[12px]"
                    style={{ color: '#a3a1b0' }}
                  >
                    L’heure est facultative.
                  </Text>
                ) : null}
              </View>
            ) : null}

            {module.hasComment ? (
              <IconInput
                icon="chatbubble-ellipses-outline"
                placeholder="Commentaire (facultatif)"
                value={comment}
                onChangeText={setComment}
                accent={accent}
              />
            ) : null}

            <PillButton
              label="Enregistrer"
              icon="save-outline"
              size="compact"
              isDisabled={!canSubmit}
              onPress={() =>
                onSubmit({
                  date,
                  time: module.hasTime ? parseTimeInput(time) : null,
                  segment,
                  values: normalizeValues(module, values),
                  comment: module.hasComment ? comment.trim() || null : null,
                })
              }
            />

            <Pressable
              accessibilityRole="button"
              className="items-center"
              onPress={onCancel}
            >
              <Text
                className="text-[14.5px] font-semibold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                Annuler
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>

        {pendingSegment !== null && segment !== null ? (
          <DiscardTimerAlert
            title={`${module.title} non enregistré`}
            currentSegment={segment}
            nextSegment={pendingSegment}
            stoppedSeconds={isTimerRunning ? null : stoppedSeconds}
            onConfirm={discardTimerAndSwitch}
            onCancel={() => setPendingSegment(null)}
          />
        ) : null}
      </View>
    </Modal>
  );
}

/**
 * Alerte de perte de données au changement de segment alors qu'une durée
 * chronométrée n'a pas été enregistrée.
 *
 * Rendue en surcouche absolue **dans** la `Modal` du formulaire plutôt
 * qu'en `Modal` imbriquée : deux `Modal` React Native superposées se
 * comportent mal selon les plateformes, et le formulaire occupe déjà
 * l'écran entier.
 *
 * Le choix par défaut est de rester : l'action destructrice ne doit pas
 * être celle qu'on déclenche par réflexe.
 */
function DiscardTimerAlert({
  title,
  currentSegment,
  nextSegment,
  stoppedSeconds,
  onConfirm,
  onCancel,
}: {
  title: string;
  currentSegment: string;
  nextSegment: string;
  /** Durée arrêtée à annoncer, ou `null` si le chronomètre tourne encore. */
  stoppedSeconds: number | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <View className="absolute inset-0 items-center justify-center bg-black/50 px-8">
      <View className="w-full gap-4 rounded-3xl bg-white px-6 py-6">
        <View className="items-center gap-2">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#e07a7a]/15">
            <Ionicons name="alert" size={22} color="#c25b5b" />
          </View>
          <Text className="text-center text-[17px] font-bold text-[#1a1a1a]">
            {title}
          </Text>
        </View>

        <Text className="text-center text-[13.5px] leading-5 text-[#6b6b6b]">
          {stoppedSeconds === null
            ? `Le chronomètre de « ${currentSegment} » tourne encore et n'a pas été enregistré.`
            : `La durée mesurée pour « ${currentSegment} » (${formatDurationSeconds(stoppedSeconds)}) n'a pas été enregistrée.`}{' '}
          Passer sur « {nextSegment} » remet le compteur à zéro : cette durée
          sera perdue.
        </Text>

        <View className="gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            className="items-center rounded-2xl bg-[#1f3d3a] py-3.5 active:opacity-80"
          >
            <Text className="text-[15px] font-semibold text-white">
              Rester sur « {currentSegment} »
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onConfirm}
            className="items-center py-2 active:opacity-60"
          >
            <Text className="text-[14px] font-medium text-[#c25b5b]">
              Changer sans enregistrer
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** Marge interne du rail (`p-1`) et écart entre segments (`gap-1`), en points. */
const SEGMENT_TRACK_PADDING = 4;
const SEGMENT_GAP = 4;
const SEGMENT_SLIDE_DURATION = 220;

const SEGMENT_COLOR_IDLE = GLASS_BODY_COLOR;
const SEGMENT_COLOR_ACTIVE = '#ffffff';

/**
 * Sélecteur de segment de tête du formulaire (Bain / Soins, sein gauche /
 * sein droit).
 *
 * Une **seule** pastille blanche qui glisse d'un segment à l'autre, plutôt
 * qu'un fond blanc allumé et éteint sur chaque option (demande explicite —
 * le changement était sec) : c'est ce qui donne la continuité, l'œil suit
 * la pastille au lieu de constater un saut. Même principe que la pastille
 * de `AppTabBar`.
 *
 * La largeur du rail est mesurée plutôt que devinée : elle dépend de la
 * largeur de la modale, et il faut la connaître pour placer la pastille au
 * point. Tant qu'elle vaut 0 (avant la première mesure), la pastille n'est
 * pas rendue — elle apparaîtrait sinon à gauche puis sauterait en place.
 *
 * La graisse du libellé, elle, bascule d'un coup : `fontWeight` ne
 * s'interpole pas. Le texte étant centré dans sa colonne, le changement de
 * largeur ne décale rien.
 */
function SegmentedField({
  label,
  options,
  value,
  onChange,
  accent,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (option: string) => void;
  accent: string;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const selectedIndex = Math.max(options.indexOf(value ?? ''), 0);

  // Position de la pastille en *index* (pas en points) : la largeur d'un
  // segment peut changer (rotation, autre modale) sans fausser l'animation
  // en cours.
  const position = useSharedValue(selectedIndex);

  useEffect(() => {
    position.value = withTiming(selectedIndex, {
      duration: SEGMENT_SLIDE_DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectedIndex, position]);

  const innerWidth = Math.max(trackWidth - SEGMENT_TRACK_PADDING * 2, 0);
  const segmentWidth =
    options.length > 0
      ? (innerWidth - SEGMENT_GAP * (options.length - 1)) / options.length
      : 0;

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * (segmentWidth + SEGMENT_GAP) }],
  }));

  return (
    <View className="gap-2">
      <FieldLabel icon="water-outline" label={label} accent={accent} />

      <View
        className="rounded-full p-1"
        style={{ backgroundColor: hexToRgba(accent, 0.08) }}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setTrackWidth((current) => (current === width ? current : width));
        }}
      >
        {/* Sous les libellés et transparente aux gestes : c'est le
            `Pressable` de chaque option qui reçoit l'appui, pas la
            pastille qui passe dessous. */}
        {segmentWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: SEGMENT_TRACK_PADDING,
                bottom: SEGMENT_TRACK_PADDING,
                left: SEGMENT_TRACK_PADDING,
                width: segmentWidth,
                borderRadius: 999,
                backgroundColor: accent,
                shadowColor: accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              },
              pillStyle,
            ]}
          />
        ) : null}

        <View className="flex-row gap-1">
          {options.map((option, index) => (
            <SegmentLabel
              key={option}
              option={option}
              index={index}
              position={position}
              isSelected={index === selectedIndex}
              onPress={() => onChange(option)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * Libellé d'un segment. Sa couleur suit la pastille au lieu de basculer
 * avec elle : `position` est une valeur continue pendant le glissement, et
 * la proximité du libellé à cette position pilote l'interpolation.
 *
 * `Animated.Text` porte ses styles en `style` et non en `className` :
 * Uniwind et les composants animés ne se combinent pas de façon fiable
 * (même raison que le `Pressable` de `DeclareBirthButton`).
 */
function SegmentLabel({
  option,
  index,
  position,
  isSelected,
  onPress,
}: {
  option: string;
  index: number;
  position: SharedValue<number>;
  isSelected: boolean;
  onPress: () => void;
}) {
  const textStyle = useAnimatedStyle(() => {
    const closeness = 1 - Math.min(Math.abs(position.value - index), 1);
    return {
      color: interpolateColor(
        closeness,
        [0, 1],
        [SEGMENT_COLOR_IDLE, SEGMENT_COLOR_ACTIVE],
      ),
    };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5"
    >
      {isSelected ? (
        <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
      ) : null}
      <Animated.Text
        style={[
          { fontSize: 14, fontWeight: isSelected ? '700' : '500' },
          textStyle,
        ]}
      >
        {option}
      </Animated.Text>
    </Pressable>
  );
}

/**
 * Un champ compte comme rempli s'il contient un nombre strictement
 * positif. La virgule est acceptée (clavier français) et normalisée au
 * moment de l'enregistrement.
 */
function isNumberFilled(raw: string | undefined): boolean {
  if (!raw || raw.trim().length === 0) return false;
  const parsed = Number(raw.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0;
}

function normalizeValues(
  module: BabyModule,
  values: Record<string, string>,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const field of module.fields) {
    const raw = values[field.key];
    if (isNumberFilled(raw))
      normalized[field.key] = raw.trim().replace(',', '.');
  }
  return normalized;
}

/**
 * Chronomètre de l'écran 8g : un clic lance, un second arrête et
 * enregistre la durée écoulée. La saisie au clavier n'est pas proposée —
 * une tétée se mesure pendant qu'elle a lieu.
 *
 * L'écoulement se calcule à partir de l'horodatage de départ plutôt qu'en
 * incrémentant un compteur à chaque tick : un `setInterval` dérive, et
 * l'app peut passer en arrière-plan pendant la tétée. Le tick à 250 ms ne
 * sert donc qu'à rafraîchir l'affichage.
 *
 * Affichage à la seconde (demande explicite) : la milliseconde n'apporte
 * rien au chronométrage d'une tétée.
 *
 * La remise à zéro (ouverture de la modale, changement de segment
 * confirmé) se fait en remontant le composant depuis le parent, via sa
 * `key` — voir `timerResetToken`.
 */
function TimerField({
  label,
  accent,
  initialSeconds,
  onRunningChange,
  onStart,
  onStop,
}: {
  label: string;
  accent: string;
  /** Durée déjà enregistrée, affichée à l'ouverture d'une entrée modifiée. */
  initialSeconds: number;
  /** Remonte l'état de marche — le parent en a besoin pour ses garde-fous. */
  onRunningChange: (isRunning: boolean) => void;
  /** Appelé au démarrage et à la remise à zéro — la durée n'est plus valide. */
  onStart: () => void;
  onStop: (seconds: number) => void;
}) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const isRunning = startedAt !== null;

  useEffect(() => {
    onRunningChange(isRunning);
  }, [isRunning, onRunningChange]);

  useEffect(() => {
    if (startedAt === null) return;
    const id = setInterval(
      () => setElapsedSeconds(Math.round((Date.now() - startedAt) / 1000)),
      250,
    );
    return () => clearInterval(id);
  }, [startedAt]);

  function toggle() {
    if (startedAt === null) {
      setElapsedSeconds(0);
      setStartedAt(Date.now());
      onStart();
      return;
    }

    // Plancher à 1 s : un arrêt immédiat doit rester une durée valide,
    // sinon le bouton « Enregistrer » resterait inerte.
    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setStartedAt(null);
    setElapsedSeconds(seconds);
    onStop(seconds);
  }

  function reset() {
    setStartedAt(null);
    setElapsedSeconds(0);
    onStart();
  }

  return (
    <View className="gap-2">
      <FieldLabel icon="timer-outline" label={label} accent={accent} />

      <View
        className="flex-row items-center justify-between rounded-[24px] px-5 py-3.5"
        style={{ backgroundColor: hexToRgba(accent, 0.07) }}
      >
        <View className="gap-0.5">
          <Text
            className="text-[30px] font-bold tabular-nums"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {formatStopwatch(elapsedSeconds)}
          </Text>
          {!isRunning && elapsedSeconds > 0 ? (
            <Pressable accessibilityRole="button" onPress={reset} hitSlop={8}>
              <Text
                className="text-[13px] font-medium"
                style={{ color: accent }}
              >
                Recommencer
              </Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable
          accessibilityLabel={
            isRunning ? 'Arrêter le chronomètre' : 'Lancer le chronomètre'
          }
          accessibilityRole="button"
          onPress={toggle}
          className="h-14 w-14 items-center justify-center rounded-full active:opacity-80"
          style={{
            backgroundColor: accent,
            shadowColor: accent,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Ionicons
            name={isRunning ? 'stop' : 'play'}
            size={22}
            color="#ffffff"
            style={isRunning ? undefined : { marginLeft: 3 }}
          />
        </Pressable>
      </View>
    </View>
  );
}

/** `MM:SS`, ou `H:MM:SS` au-delà de l'heure. */
function formatStopwatch(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const tail = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return hours > 0 ? `${hours}:${tail}` : tail;
}

/** Icône des champs chiffrés, par clé ; repli générique sinon. */
const FIELD_ICONS: Record<string, IoniconName> = {
  quantity: 'water-outline',
  height: 'resize-outline',
  weight: 'scale-outline',
  headCircumference: 'ellipse-outline',
};

/** Libellé de champ précédé d'une icône dans un rond teinté. */
function FieldLabel({
  icon,
  label,
  accent,
}: {
  icon: IoniconName;
  label: string;
  accent: string;
}) {
  return (
    <View className="flex-row items-center gap-2.5">
      <IconBubble icon={icon} color={accent} />
      <Text
        className="text-[14px] font-semibold"
        style={{ color: GLASS_TITLE_COLOR }}
      >
        {label}
      </Text>
    </View>
  );
}

/** Regroupe une liste deux par deux (le dernier groupe peut être seul). */
function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let index = 0; index < items.length; index += 2) {
    pairs.push(items.slice(index, index + 2));
  }
  return pairs;
}

import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { PlainInput } from '@/components/plain-input';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import type { BabyEntry, BabyModule } from '@/features/baby/constants';
import { formatDurationSeconds } from '@/features/baby/constants';
import { parseTimeInput } from '@/features/health/constants';
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
  onSubmit,
  onCancel,
}: {
  module: BabyModule;
  visible: boolean;
  onSubmit: (entry: Omit<BabyEntry, 'id'>) => void;
  onCancel: () => void;
}) {
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
    setDate(todayIso());
    setTime('');
    setSegment(module.segments?.options[0] ?? null);
    setValues({});
    setComment('');
    setPendingSegment(null);
    setTimerResetToken((token) => token + 1);
  }, [visible, module]);

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
          className="max-h-[88%] rounded-t-3xl bg-white px-6 pb-8 pt-4"
        >
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-[#e0e0e0]" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4"
          >
            <Text className="text-center text-[18px] font-bold text-[#1a1a1a]">
              {module.actionLabel}
            </Text>

            {module.segments ? (
              <View className="gap-2">
                <Text className="text-[13px] font-medium text-[#6b6b6b]">
                  {module.segments.label}
                </Text>
                <View className="flex-row gap-1 rounded-xl bg-[#f2f2f7] p-1">
                  {module.segments.options.map((option) => {
                    const isSelected = option === segment;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => selectSegment(option)}
                        className={`flex-1 items-center rounded-lg py-2.5 ${
                          isSelected ? 'bg-white' : ''
                        }`}
                        style={isSelected ? SEGMENT_SHADOW : undefined}
                      >
                        <Text
                          className={`text-[13.5px] ${
                            isSelected
                              ? 'font-semibold text-[#1a1a1a]'
                              : 'text-[#8a8a8a]'
                          }`}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View className="gap-2">
              <Text className="text-[13px] font-medium text-[#6b6b6b]">
                Date
              </Text>
              <WheelDatePicker value={date} onChange={setDate} />
            </View>

            {module.hasTime ? (
              <View className="gap-1.5">
                <PlainInput
                  placeholder="Heure — ex. 14h20 (facultatif)"
                  value={time}
                  onChangeText={setTime}
                  isInvalid={isTimeInvalid}
                />
                {isTimeInvalid ? (
                  <Text className="text-[12.5px] text-red-600">
                    Heure non reconnue. Formats acceptés : 14h20, 14:20.
                  </Text>
                ) : null}
              </View>
            ) : null}

            {module.fields.map((field) =>
              field.kind === 'timer' ? (
                <TimerField
                  // Remonter le composant est la remise à zéro : plus
                  // simple qu'un effet de reset, et l'intervalle en cours
                  // est nettoyé au passage.
                  key={`${field.key}-${timerResetToken}`}
                  label={field.label}
                  onRunningChange={setIsTimerRunning}
                  onStop={(seconds) => setValue(field.key, String(seconds))}
                  onStart={() => setValue(field.key, '')}
                />
              ) : (
                <PlainInput
                  key={field.key}
                  placeholder={`${field.label} (${field.unit})`}
                  keyboardType="decimal-pad"
                  value={values[field.key] ?? ''}
                  onChangeText={(next) => setValue(field.key, next)}
                  isInvalid={
                    (values[field.key] ?? '').trim().length > 0 &&
                    !isNumberFilled(values[field.key])
                  }
                />
              ),
            )}

            {module.hasComment ? (
              <PlainInput
                placeholder="Commentaire (facultatif)"
                value={comment}
                onChangeText={setComment}
                multiline
                className="h-20 py-3"
                style={{ textAlignVertical: 'top' }}
              />
            ) : null}

            <Button
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
            >
              <Button.Label>Enregistrer</Button.Label>
            </Button>

            <Pressable
              accessibilityRole="button"
              className="items-center py-1"
              onPress={onCancel}
            >
              <Text className="text-[14px] text-[#6b6b6b]">Annuler</Text>
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

/** Ombre du segment actif — reprise du design (8g/8h). */
const SEGMENT_SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.12,
  shadowRadius: 3,
  elevation: 1,
} as const;

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
  onRunningChange,
  onStart,
  onStop,
}: {
  label: string;
  /** Remonte l'état de marche — le parent en a besoin pour ses garde-fous. */
  onRunningChange: (isRunning: boolean) => void;
  /** Appelé au démarrage et à la remise à zéro — la durée n'est plus valide. */
  onStart: () => void;
  onStop: (seconds: number) => void;
}) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
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
      <Text className="text-[13px] font-medium text-[#6b6b6b]">{label}</Text>

      <View className="items-center gap-3 rounded-2xl bg-[#f2f2f7] px-4 py-5">
        <Text className="text-[34px] font-bold tabular-nums text-[#1a1a1a]">
          {formatStopwatch(elapsedSeconds)}
        </Text>

        <Pressable
          accessibilityLabel={
            isRunning ? 'Arrêter le chronomètre' : 'Lancer le chronomètre'
          }
          accessibilityRole="button"
          onPress={toggle}
          className="h-12 w-12 items-center justify-center rounded-full bg-[#1f3d3a] active:opacity-80"
        >
          <Ionicons
            name={isRunning ? 'stop' : 'play'}
            size={20}
            color="#ffffff"
          />
        </Pressable>

        {!isRunning && elapsedSeconds > 0 ? (
          <Pressable accessibilityRole="button" onPress={reset} hitSlop={8}>
            <Text className="text-[13px] text-[#6b6b6b]">Recommencer</Text>
          </Pressable>
        ) : null}
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

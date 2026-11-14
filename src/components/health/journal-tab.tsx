import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type {
  Feedback,
  FeedbackBannerTone,
} from '@/components/ui/feedback-banner';
import {
  DashedLoopDoodle,
  GLASS_TITLE_COLOR,
  SPARKS_ABOVE,
  SparkLines,
} from '@/components/ui/glass-card';
import { IconInput } from '@/components/ui/icon-input';
import { PillButton } from '@/components/ui/pill-button';
import {
  CUSTOM_SYMPTOM_MAX_LENGTH,
  getSymptomVisual,
  isCustomSymptom,
  NO_SYMPTOM,
  NO_SYMPTOM_LABEL,
  resolveSymptomInput,
  SYMPTOM_OPTIONS,
  withoutNoSymptom,
} from '@/features/health/constants';
import {
  useSaveSymptoms,
  useSymptomDates,
  useSymptomsForDate,
} from '@/features/health/hooks';
import type { Household } from '@/features/household/api';
import { useThemeAccent } from '@/features/settings/hooks';
import { getCurrentWeekIsoDates } from '@/features/together/api';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const HEART_PINK = '#e8739a';
const MUTED = '#8f8f99';
const FUTURE = '#c9c9cf';

const CARD_SHADOW_TINTED = (accent: string) =>
  ({
    shadowColor: accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  }) as const;

/**
 * Écran 4a — Journal des symptômes.
 *
 * Habillage d'après une capture de référence (demande explicite, « moderne
 * mais simple à comprendre ») : semaine dans une carte blanche où le jour
 * choisi devient une gélule d'accent surmontée de petits traits, symptômes
 * en pastilles illustrées (pictogramme sur rond teinté), grand bouton
 * « Enregistrer » en gélule.
 *
 * Enregistrer confirme visiblement le résultat (demande explicite, comme sur
 * Profil) : bandeau en haut de l'écran — monté par `sante.tsx`, hors du
 * défilement — et bouton « Enregistré » pendant 2,5 s, ou bandeau d'erreur.
 *
 * Donnée de santé : cet onglet n'est monté que pour la personne enceinte
 * (cf. `sante.tsx`), et la RLS refuse de toute façon l'écriture au
 * co-parent. Deux barrières indépendantes, volontairement.
 */
export function JournalTab({
  household,
  feedback,
  onFeedback,
}: {
  household: Household | null | undefined;
  /** Bandeau en cours (`useFeedbackBanner` de l'écran). */
  feedback: Feedback | null;
  onFeedback: (tone: FeedbackBannerTone, message: string) => void;
}) {
  const accent = useThemeAccent();
  const weekDates = getCurrentWeekIsoDates();
  const today = todayIso();
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: savedSymptoms } = useSymptomsForDate(household, selectedDate);
  const { data: markedDates = [] } = useSymptomDates(household, weekDates);
  const saveSymptoms = useSaveSymptoms(household);

  const [selected, setSelected] = useState<string[]>([]);
  // Saisie d'un symptôme hors liste (demande explicite).
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const customSymptoms = selected.filter(isCustomSymptom);

  const addCustomSymptom = () => {
    const value = resolveSymptomInput(customText);
    if (value) {
      setSelected((current) =>
        current.includes(value)
          ? current
          : [...withoutNoSymptom(current), value],
      );
    }
    setCustomText('');
    setIsAddingCustom(false);
  };

  // Resynchronise à chaque changement de jour ou d'arrivée des données :
  // sans ça, passer du mardi au mercredi garderait les cases du mardi.
  useEffect(() => {
    setSelected(savedSymptoms ?? []);
  }, [savedSymptoms]);

  // « Pas de symptômes » est exclusif : le choisir efface les symptômes,
  // cocher un symptôme le retire.
  const toggle = (value: string) =>
    setSelected((current) =>
      value === NO_SYMPTOM
        ? current.includes(NO_SYMPTOM)
          ? []
          : [NO_SYMPTOM]
        : current.includes(value)
          ? current.filter((item) => item !== value)
          : [...withoutNoSymptom(current), value],
    );

  const isDirty =
    JSON.stringify([...selected].sort()) !==
    JSON.stringify([...(savedSymptoms ?? [])].sort());
  const isSaveDisabled = !isDirty || saveSymptoms.isPending;
  const justSaved = feedback?.tone === 'success' && !isDirty;

  const save = () => {
    if (isSaveDisabled) return;
    const count = withoutNoSymptom(selected).length;
    saveSymptoms.mutate(
      { logDate: selectedDate, symptoms: selected },
      {
        onSuccess: () =>
          onFeedback(
            'success',
            count === 0
              ? 'Journée enregistrée sans symptôme'
              : `${count} symptôme${count > 1 ? 's' : ''} enregistré${
                  count > 1 ? 's' : ''
                }`,
          ),
        onError: () =>
          onFeedback(
            'error',
            'Impossible d’enregistrer vos symptômes. Réessayez.',
          ),
      },
    );
  };

  return (
    <View className="gap-7">
      <View
        className="flex-row justify-between rounded-[32px] px-3 py-4"
        style={[
          CARD_SHADOW_TINTED(accent),
          { backgroundColor: 'rgba(255, 255, 255, 0.92)' },
        ]}
      >
        {weekDates.map((date, index) => (
          <DayPill
            key={date}
            letter={DAY_LETTERS[index]}
            dayNumber={Number(date.slice(-2))}
            isSelected={date === selectedDate}
            // On ne déclare pas un état à venir : les jours après
            // aujourd'hui sont grisés et non sélectionnables (dates ISO →
            // comparaison lexicographique fiable).
            isFuture={date > today}
            hasSymptoms={markedDates.includes(date)}
            accent={accent}
            onPress={() => setSelectedDate(date)}
          />
        ))}
      </View>

      <View className="gap-4">
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="heart-outline" size={24} color={HEART_PINK} />
          <Text
            className="text-[18px] font-bold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            Des symptômes{' '}
            {selectedDate === today ? 'aujourd’hui' : 'ce jour-là'} ?
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2.5">
          <SymptomChip
            label={NO_SYMPTOM_LABEL}
            visual={getSymptomVisual(NO_SYMPTOM)}
            isSelected={selected.includes(NO_SYMPTOM)}
            accent={accent}
            onPress={() => toggle(NO_SYMPTOM)}
          />
          {SYMPTOM_OPTIONS.map((option) => (
            <SymptomChip
              key={option.value}
              label={option.label}
              visual={getSymptomVisual(option.value)}
              isSelected={selected.includes(option.value)}
              accent={accent}
              onPress={() => toggle(option.value)}
            />
          ))}
          {/* Symptômes saisis à la main : cochés tant qu'ils sont dans la
              journée, un toucher les retire. */}
          {customSymptoms.map((symptom) => (
            <SymptomChip
              key={`custom-${symptom}`}
              label={symptom}
              visual={getSymptomVisual(symptom)}
              isSelected
              accent={accent}
              onPress={() => toggle(symptom)}
            />
          ))}
          {isAddingCustom ? null : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ajouter un autre symptôme"
              onPress={() => setIsAddingCustom(true)}
              className="flex-row items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 active:opacity-70"
              style={{
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: hexToRgba(accent, 0.4),
                backgroundColor: hexToRgba(accent, 0.04),
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: hexToRgba(accent, 0.1) }}
              >
                <Ionicons name="add" size={22} color={accent} />
              </View>
              <Text
                className="text-[14.5px] font-semibold"
                style={{ color: accent }}
              >
                Autre symptôme
              </Text>
            </Pressable>
          )}
        </View>

        {isAddingCustom ? (
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <IconInput
                icon="create-outline"
                placeholder="Ex. crampes, migraine…"
                value={customText}
                onChangeText={(text) =>
                  setCustomText(text.slice(0, CUSTOM_SYMPTOM_MAX_LENGTH))
                }
                accent={accent}
                autoCapitalize="sentences"
                returnKeyType="done"
                onSubmitEditing={addCustomSymptom}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ajouter ce symptôme"
              accessibilityState={{ disabled: customText.trim() === '' }}
              disabled={customText.trim() === ''}
              onPress={addCustomSymptom}
              className="h-[46px] w-[46px] items-center justify-center rounded-full active:opacity-80"
              style={{
                backgroundColor: accent,
                opacity: customText.trim() === '' ? 0.45 : 1,
              }}
            >
              <Ionicons name="checkmark" size={22} color="#ffffff" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Annuler l'ajout"
              hitSlop={6}
              onPress={() => {
                setCustomText('');
                setIsAddingCustom(false);
              }}
              className="h-[46px] w-[46px] items-center justify-center rounded-full bg-white active:opacity-70"
            >
              <Ionicons name="close" size={20} color={GLASS_TITLE_COLOR} />
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* « Enregistré » reste pleinement visible (pas grisé) le temps de la
          confirmation, puis le bouton reprend son état normal. */}
      <PillButton
        label={
          saveSymptoms.isPending
            ? 'Enregistrement…'
            : justSaved
              ? 'Enregistré'
              : 'Enregistrer'
        }
        icon={justSaved ? 'checkmark-circle' : 'save-outline'}
        isDisabled={!justSaved && isSaveDisabled}
        onPress={save}
      />

      <DashedLoopDoodle color={accent} />
    </View>
  );
}

/**
 * Un jour de la semaine. Au repos : lettre au-dessus d'un rond gris. Choisi :
 * une gélule d'accent qui englobe lettre et numéro, surmontée de petits
 * traits. Un point sous le jour signale des symptômes déjà notés.
 */
function DayPill({
  letter,
  dayNumber,
  isSelected,
  isFuture,
  hasSymptoms,
  accent,
  onPress,
}: {
  letter: string;
  dayNumber: number;
  isSelected: boolean;
  isFuture: boolean;
  hasSymptoms: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${letter} ${dayNumber}`}
      accessibilityState={{ selected: isSelected, disabled: isFuture }}
      disabled={isFuture}
      onPress={onPress}
      className="items-center gap-1.5"
    >
      {isSelected ? (
        <SparkLines
          color={hexToRgba(accent, 0.6)}
          sparks={SPARKS_ABOVE}
          style={{ top: -24, left: 7 }}
        />
      ) : null}
      <View
        className="h-[70px] w-10 items-center justify-center gap-1.5 rounded-full"
        style={
          isSelected
            ? {
                backgroundColor: accent,
                shadowColor: accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 6,
              }
            : undefined
        }
      >
        <Text
          className="text-[12px] font-medium"
          style={{
            color: isSelected
              ? 'rgba(255, 255, 255, 0.85)'
              : isFuture
                ? FUTURE
                : MUTED,
          }}
        >
          {letter}
        </Text>
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: isSelected
              ? 'transparent'
              : isFuture
                ? '#f7f7f9'
                : '#f0f0f3',
          }}
        >
          <Text
            className="text-[16px]"
            style={{
              fontWeight: isSelected ? '700' : '500',
              color: isSelected
                ? '#ffffff'
                : isFuture
                  ? FUTURE
                  : GLASS_TITLE_COLOR,
            }}
          >
            {dayNumber}
          </Text>
        </View>
      </View>
      <View
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hasSymptoms ? accent : 'transparent' }}
      />
    </Pressable>
  );
}

/**
 * Pastille de symptôme : pictogramme sur rond teinté + libellé. Choisie,
 * elle prend un contour et un fond d'accent, et une coche vient confirmer
 * la sélection sur le pictogramme — l'état reste lisible sans couleur.
 */
function SymptomChip({
  label,
  visual,
  isSelected,
  accent,
  onPress,
}: {
  label: string;
  visual: { emoji: string; tint: string };
  isSelected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4"
      style={{
        backgroundColor: isSelected
          ? hexToRgba(accent, 0.1)
          : 'rgba(255, 255, 255, 0.92)',
        borderWidth: 1.5,
        borderColor: isSelected ? accent : 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: visual.tint }}
      >
        <Text style={{ fontSize: 20 }}>{visual.emoji}</Text>
        {isSelected ? (
          <View
            className="absolute -right-1 -top-1 h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white"
            style={{ backgroundColor: accent }}
          >
            <Ionicons name="checkmark" size={10} color="#ffffff" />
          </View>
        ) : null}
      </View>
      <Text
        className="text-[14.5px]"
        style={{
          color: isSelected ? accent : GLASS_TITLE_COLOR,
          fontWeight: isSelected ? '700' : '500',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

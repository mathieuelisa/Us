import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { IconInput } from '@/components/ui/icon-input';
import { GENDER_META, type NameGender } from '@/features/names/catalog';
import { hexToRgba } from '@/lib/color';

/** Longueur maximale d'un prénom saisi (la base en accepte 60). */
const MAX_NAME_LENGTH = 40;
/** Lettres (accents compris), espaces, traits d'union et apostrophes. */
const NAME_PATTERN = /^\p{L}[\p{L}\p{M}' -]*$/u;
const SUCCESS_GREEN = '#2f8a5b';
const ERROR_RED = '#c9553d';
/** Durée d'affichage de la confirmation sous le champ. */
const MESSAGE_MS = 2600;

const GENDER_CHOICES: { value: NameGender }[] = [
  { value: 'girl' },
  { value: 'boy' },
];

type Message = { tone: 'success' | 'error'; text: string };

/**
 * « Ajouter un prénom » des Favoris (demande explicite) : saisir soi-même un
 * prénom absent du jeu pour le garder en favori. Fille ou garçon (la base
 * classe chaque favori par genre), puis le prénom ; « Entrée » ou le
 * bouton + l'ajoute.
 *
 * Le prénom est remis en forme (espaces superflus retirés, majuscule au
 * début de chaque partie : « marie-lou » → « Marie-Lou ») et refusé s'il
 * contient autre chose que des lettres, espaces, traits d'union ou
 * apostrophes, ou s'il est déjà dans les favoris de ce genre.
 */
export function AddNameCard({
  accent,
  gender,
  onGenderChange,
  existingNames,
  onAdd,
}: {
  accent: string;
  /** Genre choisi, partagé avec le sélecteur Garçons / Filles de la liste. */
  gender: NameGender;
  onGenderChange: (gender: NameGender) => void;
  /** Favoris déjà présents, pour refuser un doublon. */
  existingNames: { gender: NameGender; name: string }[];
  onAdd: (gender: NameGender, name: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    },
    [],
  );

  const showMessage = (next: Message) => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    setMessage(next);
    // L'erreur reste jusqu'à la prochaine saisie ; la confirmation s'efface.
    if (next.tone === 'success') {
      messageTimeoutRef.current = setTimeout(
        () => setMessage(null),
        MESSAGE_MS,
      );
    }
  };

  const name = formatName(value);
  const canSubmit = name.length > 0 && !isPending;

  const submit = async () => {
    if (!canSubmit) return;
    if (!NAME_PATTERN.test(name)) {
      showMessage({
        tone: 'error',
        text: t('names.add.invalid'),
      });
      return;
    }
    const isDuplicate = existingNames.some(
      (item) =>
        item.gender === gender &&
        item.name.localeCompare(name, 'fr', { sensitivity: 'base' }) === 0,
    );
    if (isDuplicate) {
      showMessage({
        tone: 'error',
        text: t('names.add.duplicate', { name }),
      });
      return;
    }

    setIsPending(true);
    try {
      await onAdd(gender, name);
      setValue('');
      showMessage({
        tone: 'success',
        text: t('names.add.added', { name }),
      });
    } catch {
      showMessage({
        tone: 'error',
        text: t('names.add.error'),
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <View
      className="gap-3 overflow-hidden rounded-[28px] px-4 pb-4 pt-4"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
        elevation: 3,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -60,
          right: -50,
          width: 170,
          height: 140,
          borderRadius: 85,
          backgroundColor: hexToRgba(GENDER_META[gender].color, 0.07),
        }}
      />

      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-0.5">
          <Text
            className="text-[17px] font-extrabold"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
          >
            {t('names.add.title')}
          </Text>
          <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
            {t('names.add.hint')}
          </Text>
        </View>

        <View className="flex-row gap-1.5">
          {GENDER_CHOICES.map((choice) => {
            const meta = GENDER_META[choice.value];
            const isActive = choice.value === gender;
            return (
              <Pressable
                key={choice.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={t(`names.genders.${choice.value}`)}
                onPress={() => onGenderChange(choice.value)}
                className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: isActive ? meta.color : meta.tint,
                }}
              >
                <Ionicons
                  name={choice.value === 'girl' ? 'female' : 'male'}
                  size={13}
                  color={isActive ? '#ffffff' : meta.color}
                />
                <Text
                  className="text-[13px] font-bold"
                  style={{ color: isActive ? '#ffffff' : meta.color }}
                >
                  {t(`names.genders.${choice.value}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <IconInput
        icon="create-outline"
        placeholder={
          gender === 'girl'
            ? t('names.add.girlPlaceholder')
            : t('names.add.boyPlaceholder')
        }
        value={value}
        onChangeText={(text) => {
          setValue(text.slice(0, MAX_NAME_LENGTH));
          if (message?.tone === 'error') setMessage(null);
        }}
        accent={accent}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={submit}
        isInvalid={message?.tone === 'error'}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('names.add.submit')}
            accessibilityState={{ disabled: !canSubmit, busy: isPending }}
            disabled={!canSubmit}
            onPress={submit}
            hitSlop={6}
            className="-mr-1.5 h-[34px] w-[34px] items-center justify-center rounded-full"
            style={{
              backgroundColor: canSubmit ? accent : hexToRgba(accent, 0.25),
            }}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="add" size={21} color="#ffffff" />
            )}
          </Pressable>
        }
      />

      {message ? (
        <View className="flex-row items-center gap-1.5 px-2">
          <Ionicons
            name={
              message.tone === 'success' ? 'checkmark-circle' : 'alert-circle'
            }
            size={15}
            color={message.tone === 'success' ? SUCCESS_GREEN : ERROR_RED}
          />
          <Text
            className="flex-1 text-[12.5px]"
            style={{
              color: message.tone === 'success' ? SUCCESS_GREEN : ERROR_RED,
            }}
          >
            {message.text}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * « marie-lou  » → « Marie-Lou » : espaces superflus retirés, majuscule au
 * début de chaque partie (séparées par espace ou trait d'union). Le reste
 * est gardé tel quel, pour respecter une graphie voulue (« McKenzie »).
 */
function formatName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*-\s*/g, '-')
    .split(/([ -])/)
    .map((part) =>
      part === ' ' || part === '-'
        ? part
        : part.charAt(0).toLocaleUpperCase('fr') + part.slice(1),
    )
    .join('');
}

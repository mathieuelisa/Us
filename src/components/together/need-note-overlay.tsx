import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useEffect, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SparkLines,
} from '@/components/ui/glass-card';
import { IconInput } from '@/components/ui/icon-input';
import { PillButton } from '@/components/ui/pill-button';
import { useThemeAccent } from '@/features/settings/hooks';
import { NEED_ICONS, NEED_TAGS } from '@/features/together/constants';
import { hexToRgba } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const HEART_PINK = '#e8739a';

/**
 * Écran 3b — overlay affichée juste après le tap sur l'humeur (CONCEPT.md :
 * « une pop-up après le tap proposant de préciser un besoin »). `Modal`
 * natif plutôt que `Dialog` de Hero UI Native : composant que je contrôle
 * entièrement.
 *
 * Habillage d'après une capture de référence (demande explicite, « moderne
 * et design ») : carte centrée flottante, croix de fermeture, illustration
 * de l'humeur choisie sur une tache d'accent entourée de cœurs et de petits
 * traits, titre et sous-titre, besoins en tuiles à pictogramme (contour
 * d'accent et coche quand choisies), champ libre à crayon, « Envoyer » en
 * gélule. Écart assumé : sur 3 colonnes, l'icône passe **au-dessus** du
 * libellé — à côté, les tuiles seraient trop étroites sur un téléphone.
 *
 * `animationType="none"` + entrée Reanimated, même parti pris que les autres
 * modales : le voile apparaît d'un coup, seule la carte bouge.
 */
export function NeedNoteOverlay({
  visible,
  moodEmoji,
  onSubmit,
  onSkip,
}: {
  visible: boolean;
  moodEmoji?: ImageSourcePropType;
  onSubmit: (note: string) => void;
  onSkip: () => void;
}) {
  const accent = useThemeAccent();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');

  // Repart de zéro à chaque nouvelle ouverture, pas seulement au montage :
  // la Modal reste montée entre deux check-ins.
  useEffect(() => {
    if (visible) {
      setSelectedTags([]);
      setFreeText('');
    }
  }, [visible]);

  const selectedLabels = NEED_TAGS.filter((tag) =>
    selectedTags.includes(tag.value),
  ).map((tag) => tag.label);
  const canSubmit = Boolean(selectedLabels.length || freeText.trim());

  const toggleTag = (value: string) => {
    setSelectedTags((current) =>
      current.includes(value)
        ? current.filter((tag) => tag !== value)
        : [...current, value],
    );
    setFreeText('');
  };

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(freeText.trim() || selectedLabels.join(', '));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onSkip}
    >
      <View className="flex-1 justify-center bg-black/40 px-4 py-6">
        <Animated.View
          entering={FadeInDown.duration(320)}
          className="max-h-full overflow-hidden rounded-[32px] bg-white"
          style={{
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.18,
            shadowRadius: 36,
            elevation: 12,
          }}
        >
          {/* Formes pâles en fond de carte, comme sur la capture. */}
          <View pointerEvents="none" className="absolute inset-0">
            <View
              style={{
                position: 'absolute',
                left: -70,
                top: 120,
                width: 180,
                height: 180,
                borderRadius: 90,
                backgroundColor: hexToRgba(accent, 0.05),
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: -60,
                bottom: -60,
                width: 200,
                height: 160,
                borderRadius: 100,
                backgroundColor: hexToRgba(accent, 0.06),
              }}
            />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="items-stretch gap-5 px-5 pb-6 pt-5"
          >
            <Pressable
              accessibilityLabel="Fermer"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onSkip}
              className="h-10 w-10 items-center justify-center self-end rounded-full"
              style={{ backgroundColor: '#f1f1f4' }}
            >
              <Ionicons name="close" size={20} color={GLASS_TITLE_COLOR} />
            </Pressable>

            <View className="-mt-8 items-center gap-3">
              <MoodIllustration source={moodEmoji} accent={accent} />
              <View className="items-center gap-1.5">
                <Text
                  className="text-center text-[24px] font-extrabold"
                  style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.5 }}
                >
                  Une envie particulière ?
                </Text>
                <Text
                  className="text-center text-[14px] leading-5"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  Dites-nous ce dont vous avez besoin,{'\n'}on est là pour vous
                  ✨
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-2.5">
              {NEED_TAGS.map((tag) => (
                <NeedTile
                  key={tag.value}
                  label={tag.label}
                  icon={NEED_ICONS[tag.value] ?? 'ellipse-outline'}
                  isSelected={selectedTags.includes(tag.value)}
                  accent={accent}
                  onPress={() => toggleTag(tag.value)}
                />
              ))}
            </View>

            <IconInput
              icon="create-outline"
              placeholder="Ou écrivez votre propre besoin…"
              value={freeText}
              onChangeText={(text) => {
                setFreeText(text);
                setSelectedTags([]);
              }}
              accent={accent}
              returnKeyType="send"
              onSubmitEditing={submit}
            />

            <View className="gap-1">
              <PillButton
                label="Envoyer"
                icon="paper-plane-outline"
                isDisabled={!canSubmit}
                onPress={submit}
              />
              <Pressable
                accessibilityRole="button"
                className="items-center py-2"
                onPress={onSkip}
              >
                <Text
                  className="text-[14.5px] font-medium"
                  style={{ color: GLASS_BODY_COLOR }}
                >
                  Passer
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Illustration de l'humeur choisie sur une tache d'accent aux bords
 * irréguliers, entourée de cœurs et de petits traits.
 */
function MoodIllustration({
  source,
  accent,
}: {
  source?: ImageSourcePropType;
  accent: string;
}) {
  return (
    <View
      pointerEvents="none"
      className="h-[132px] w-[170px] items-center justify-center"
    >
      <View
        style={{
          position: 'absolute',
          left: 22,
          right: 14,
          top: 30,
          bottom: 0,
          borderTopLeftRadius: 70,
          borderTopRightRadius: 52,
          borderBottomRightRadius: 64,
          borderBottomLeftRadius: 46,
          backgroundColor: hexToRgba(accent, 0.12),
        }}
      />
      {source ? (
        <Image
          source={source}
          style={{ width: 118, height: 118 }}
          resizeMode="contain"
        />
      ) : null}
      <Ionicons
        name="heart"
        size={26}
        color={HEART_PINK}
        style={{
          position: 'absolute',
          left: 4,
          top: 22,
          transform: [{ rotate: '-14deg' }],
        }}
      />
      <Ionicons
        name="heart"
        size={15}
        color={HEART_PINK}
        style={{ position: 'absolute', left: 0, top: 56 }}
      />
      <Ionicons
        name="heart"
        size={14}
        color={HEART_PINK}
        style={{ position: 'absolute', right: 40, top: 0 }}
      />
      <SparkLines
        color={hexToRgba(HEART_PINK, 0.8)}
        style={{ right: 0, top: 70, transform: [{ rotate: '90deg' }] }}
      />
    </View>
  );
}

/**
 * Tuile d'un besoin rapide : pictogramme dans un rond teinté au-dessus du
 * libellé. Choisie, elle prend un contour et un fond d'accent légers, et une
 * coche en haut à droite — l'état reste lisible sans la couleur.
 */
function NeedTile({
  label,
  icon,
  isSelected,
  accent,
  onPress,
}: {
  label: string;
  icon: IoniconName;
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
      className="w-[31.5%] items-center gap-2 rounded-[20px] px-1.5 pb-3 pt-3.5"
      style={{
        backgroundColor: isSelected ? hexToRgba(accent, 0.07) : '#ffffff',
        borderWidth: 1.5,
        borderColor: isSelected ? accent : 'rgba(0, 0, 0, 0.06)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isSelected ? 0.14 : 0.06,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(accent, isSelected ? 0.16 : 0.09) }}
      >
        <Ionicons name={icon} size={20} color={accent} />
      </View>
      <Text
        className="text-center text-[12.5px] leading-4"
        style={{
          color: GLASS_TITLE_COLOR,
          fontWeight: isSelected ? '700' : '500',
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
      {isSelected ? (
        <View
          className="absolute right-1.5 top-1.5 h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: accent }}
        >
          <Ionicons name="checkmark" size={12} color="#ffffff" />
        </View>
      ) : null}
    </Pressable>
  );
}

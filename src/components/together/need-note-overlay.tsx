import { Button } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { NEED_TAGS } from '@/features/together/constants';

/**
 * Écran 3b — overlay affichée juste après le tap sur l'humeur (CONCEPT.md :
 * « une pop-up après le tap proposant de préciser un besoin »). `Modal`
 * natif plutôt que `Dialog` de Hero UI Native : composant que je contrôle
 * entièrement, cf. la mésaventure avec `variant="outline"` en Phase 1.1
 * (DOCS/05-DETTE-ET-POINTS-OUVERTS.md).
 */
export function NeedNoteOverlay({
  visible,
  moodEmoji,
  onSubmit,
  onSkip,
}: {
  visible: boolean;
  moodEmoji: string;
  onSubmit: (note: string) => void;
  onSkip: () => void;
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [freeText, setFreeText] = useState('');

  // Repart de zéro à chaque nouvelle ouverture, pas seulement au montage :
  // la Modal reste montée entre deux check-ins.
  useEffect(() => {
    if (visible) {
      setSelectedTag(null);
      setFreeText('');
    }
  }, [visible]);

  const selectedLabel = NEED_TAGS.find(
    (tag) => tag.value === selectedTag,
  )?.label;
  const canSubmit = Boolean(selectedLabel || freeText.trim());

  const submit = () => {
    onSubmit(freeText.trim() || selectedLabel || '');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View className="flex-1 items-center justify-end bg-black/40">
        <View className="w-full gap-4 rounded-t-[24px] bg-white px-6 pb-8 pt-6">
          <Text className="text-center text-[36px]">{moodEmoji}</Text>
          <Text className="text-center text-[18px] font-bold text-[#1a1a1a]">
            Besoin de quelque chose ?
          </Text>

          <View className="flex-row flex-wrap justify-center gap-2">
            {NEED_TAGS.map((tag) => {
              const isSelected = selectedTag === tag.value;
              return (
                <Pressable
                  key={tag.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    setSelectedTag(tag.value);
                    setFreeText('');
                  }}
                  className={`rounded-full border px-3.5 py-2 ${
                    isSelected
                      ? 'border-accent bg-[#eaf5f0]'
                      : 'border-[#e0e0e0] bg-white'
                  }`}
                >
                  <Text
                    className={`text-[13px] ${isSelected ? 'font-medium text-accent' : 'text-[#1a1a1a]'}`}
                  >
                    {tag.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            placeholder="Ou écrivez votre propre besoin…"
            value={freeText}
            onChangeText={(text) => {
              setFreeText(text);
              setSelectedTag(null);
            }}
            multiline
            className="rounded-[12px] border border-[#e0e0e0] px-3.5 py-3 text-[14px] text-[#1a1a1a]"
          />

          <Button isDisabled={!canSubmit} onPress={submit}>
            <Button.Label>Envoyer</Button.Label>
          </Button>

          <Pressable
            accessibilityRole="button"
            className="items-center py-1"
            onPress={onSkip}
          >
            <Text className="text-[14px] text-[#6b6b6b]">Passer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

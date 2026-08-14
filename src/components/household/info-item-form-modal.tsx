import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { PlainInput } from '@/components/plain-input';
import { WheelDatePicker } from '@/components/wheel-date-picker';
import type { HouseholdInfoItem } from '@/features/household/api';
import {
  formatSocialSecurityNumber,
  INFO_CATEGORY_META,
  INFO_CATEGORY_ORDER,
  type InfoCategory,
  isInfoCategory,
} from '@/features/household/constants';
import { todayIso } from '@/lib/date';

/**
 * Modale à deux temps : choix de la catégorie (grille), puis formulaire
 * dédié à cette catégorie — plutôt qu'un unique champ libellé/valeur, pour
 * que chaque type d'info ait l'icône, le clavier et le format qui lui
 * correspondent (demande explicite : "design original et pro").
 *
 * Sert aussi bien à la création (`editingItem` absent, démarre sur la
 * grille) qu'à l'édition (`editingItem` fourni, démarre directement sur son
 * formulaire, catégorie verrouillée).
 *
 * `animationType="none"` sur `Modal` : même parti pris que
 * `AppointmentFormModal`/`HowItWorksModal`, le fond opaque apparaît
 * instantanément, seule la carte glisse.
 */
export function InfoItemFormModal({
  visible,
  isSaving,
  editingItem,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  isSaving: boolean;
  editingItem?: HouseholdInfoItem | null;
  onCancel: () => void;
  onSubmit: (input: {
    category: InfoCategory;
    label: string;
    value: string;
  }) => void;
}) {
  const [category, setCategory] = useState<InfoCategory | null>(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!visible) return;

    if (editingItem && isInfoCategory(editingItem.category)) {
      setCategory(editingItem.category);
      setLabel(editingItem.label);
      setValue(editingItem.value ?? '');
    } else {
      setCategory(null);
      setLabel('');
      setValue(editingItem ? '' : todayIso());
    }
  }, [visible, editingItem]);

  const meta = category ? INFO_CATEGORY_META[category] : null;
  const isEditing = Boolean(editingItem);

  const selectCategory = (next: InfoCategory) => {
    setCategory(next);
    setLabel('');
    setValue(INFO_CATEGORY_META[next].isDate ? todayIso() : '');
  };

  const canSubmit =
    category !== null &&
    !isSaving &&
    (meta?.needsLabel ? label.trim() !== '' : true) &&
    (meta?.isDate ? value !== '' : value.trim() !== '');

  const submit = () => {
    if (!category || !meta || !canSubmit) return;
    onSubmit({
      category,
      label: meta.needsLabel ? label.trim() : meta.defaultLabel,
      value: value.trim(),
    });
  };

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
          className="max-h-[88%] rounded-t-3xl bg-white px-6 pb-8 pt-6"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4"
          >
            {category === null ? (
              <>
                <Text className="text-[18px] font-bold text-[#1a1a1a]">
                  Que voulez-vous ajouter ?
                </Text>
                <View className="flex-row flex-wrap gap-2.5">
                  {INFO_CATEGORY_ORDER.map((option) => {
                    const optionMeta = INFO_CATEGORY_META[option];
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        onPress={() => selectCategory(option)}
                        className="w-[47%] gap-2.5 rounded-2xl border border-[#ececec] bg-white px-3.5 py-4"
                      >
                        <View
                          className="h-10 w-10 items-center justify-center rounded-full"
                          style={{ backgroundColor: optionMeta.tint }}
                        >
                          <Ionicons
                            name={optionMeta.icon}
                            size={19}
                            color={optionMeta.color}
                          />
                        </View>
                        <Text className="text-[14px] font-medium text-[#1a1a1a]">
                          {optionMeta.pickerLabel}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Pressable
                  accessibilityRole="button"
                  className="items-center py-1"
                  onPress={onCancel}
                >
                  <Text className="text-[14px] text-[#6b6b6b]">Annuler</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View className="flex-row items-center gap-3">
                  {isEditing ? null : (
                    <Pressable
                      accessibilityLabel="Changer de catégorie"
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() => setCategory(null)}
                    >
                      <Text className="text-[20px] text-[#6b6b6b]">‹</Text>
                    </Pressable>
                  )}
                  <View
                    className="h-9 w-9 items-center justify-center rounded-full"
                    style={{ backgroundColor: meta?.tint }}
                  >
                    <Ionicons name={meta?.icon} size={17} color={meta?.color} />
                  </View>
                  <Text className="text-[17px] font-bold text-[#1a1a1a]">
                    {isEditing ? 'Modifier' : 'Ajouter'} — {meta?.pickerLabel}
                  </Text>
                </View>

                {meta?.needsLabel ? (
                  <View className="gap-2">
                    <PlainInput
                      placeholder={meta.labelPlaceholder}
                      value={label}
                      onChangeText={setLabel}
                    />
                    {meta.labelSuggestions.length > 0 ? (
                      <View className="flex-row flex-wrap gap-1.5">
                        {meta.labelSuggestions.map((suggestion) => (
                          <Pressable
                            key={suggestion}
                            accessibilityRole="button"
                            onPress={() => setLabel(suggestion)}
                            className={`rounded-full border px-3 py-1.5 ${
                              label === suggestion
                                ? 'border-accent bg-accent/10'
                                : 'border-[#e0e0e0] bg-white'
                            }`}
                          >
                            <Text
                              className={`text-[12.5px] ${
                                label === suggestion
                                  ? 'font-medium text-accent'
                                  : 'text-[#6b6b6b]'
                              }`}
                            >
                              {suggestion}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ) : null}

                {meta?.isDate ? (
                  <WheelDatePicker value={value} onChange={setValue} />
                ) : meta?.valueOptions ? (
                  <View className="flex-row flex-wrap gap-2">
                    {meta.valueOptions.map((option) => (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        onPress={() => setValue(option)}
                        className={`min-w-[22%] items-center rounded-xl border px-3.5 py-2.5 ${
                          value === option
                            ? 'border-accent bg-accent/10'
                            : 'border-[#e0e0e0] bg-white'
                        }`}
                      >
                        <Text
                          className={`text-[14px] ${
                            value === option
                              ? 'font-semibold text-accent'
                              : 'text-[#1a1a1a]'
                          }`}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <PlainInput
                    placeholder={meta?.valuePlaceholder}
                    value={value}
                    onChangeText={(text) =>
                      setValue(
                        category === 'social_security'
                          ? formatSocialSecurityNumber(text)
                          : text,
                      )
                    }
                    keyboardType={meta?.valueKeyboardType ?? 'default'}
                    multiline={meta?.multilineValue}
                    numberOfLines={meta?.multilineValue ? 3 : 1}
                  />
                )}

                <View className="flex-row gap-2">
                  <Pressable
                    accessibilityRole="button"
                    className="flex-1 items-center justify-center rounded-full border border-[#d0d0d0] py-3"
                    onPress={onCancel}
                  >
                    <Text className="text-[15px] font-medium text-[#1a1a1a]">
                      Annuler
                    </Text>
                  </Pressable>
                  <Button
                    className="flex-1"
                    isDisabled={!canSubmit}
                    onPress={submit}
                  >
                    <Button.Label>
                      {isSaving
                        ? 'Enregistrement…'
                        : isEditing
                          ? 'Enregistrer'
                          : 'Ajouter'}
                    </Button.Label>
                  </Button>
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

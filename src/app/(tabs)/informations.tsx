import { Button, Card, CloseButton } from 'heroui-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { OutlineButton } from '@/components/outline-button';
import { PlainInput } from '@/components/plain-input';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import type { HouseholdInfoItem } from '@/features/household/api';
import {
  useCreateInfoItem,
  useDeleteInfoItem,
  useInfoItems,
  useMyHousehold,
  useReorderInfoItems,
  useUpdateInfoItem,
} from '@/features/household/hooks';
import { useThemeBackground } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

export default function InformationsScreen() {
  const { data: household, isLoading: isHouseholdLoading } = useMyHousehold();
  const householdId = household?.id;
  const backgroundColor = useThemeBackground();

  const { data: items = [], isLoading: areItemsLoading } =
    useInfoItems(householdId);
  const createItem = useCreateInfoItem(householdId);
  const updateItem = useUpdateInfoItem(householdId);
  const deleteItem = useDeleteInfoItem(householdId);
  const reorderItems = useReorderInfoItems(householdId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const startEdit = (item: HouseholdInfoItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditValue(item.value ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editingId || editLabel.trim() === '') return;
    updateItem.mutate(
      {
        id: editingId,
        patch: { label: editLabel.trim(), value: editValue.trim() || null },
      },
      { onSuccess: cancelEdit },
    );
  };

  const addItem = () => {
    if (newLabel.trim() === '') return;
    createItem.mutate(
      {
        label: newLabel.trim(),
        value: newValue.trim() || null,
        sortOrder: items.length,
      },
      {
        onSuccess: () => {
          setNewLabel('');
          setNewValue('');
          setIsAdding(false);
        },
      },
    );
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    reorderItems.mutate(
      reordered.map((item, sortOrder) => ({
        id: item.id,
        sort_order: sortOrder,
      })),
    );
  };

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <View className="flex-1 gap-4 px-6 pt-4">
        <View className="gap-1">
          <Text className="text-[26px] font-bold text-[#1a1a1a]">
            Informations importantes
          </Text>
          <Text className="text-[13px] text-[#6b6b6b]">
            Partagées et modifiables par vous deux.
          </Text>
        </View>

        {isHouseholdLoading ? (
          <Text className="text-[13px] text-[#9a9a9a]">Chargement…</Text>
        ) : !household ? (
          <Text className="text-[13px] leading-5 text-[#6b6b6b]">
            Vous n'avez pas encore d'espace partagé. Cette section sera
            disponible une fois l'onboarding terminé.
          </Text>
        ) : (
          <View className="flex-1 gap-3">
            {areItemsLoading ? (
              <Text className="text-[13px] text-[#9a9a9a]">Chargement…</Text>
            ) : items.length === 0 ? (
              <Text className="text-[13px] text-[#9a9a9a]">
                Aucune information pour l'instant.
              </Text>
            ) : (
              items.map((item, index) =>
                editingId === item.id ? (
                  <Card key={item.id}>
                    <Card.Body className="gap-2.5">
                      <PlainInput
                        placeholder="Libellé"
                        value={editLabel}
                        onChangeText={setEditLabel}
                      />
                      <PlainInput
                        placeholder="Valeur"
                        value={editValue}
                        onChangeText={setEditValue}
                      />
                      <View className="flex-row gap-2">
                        <OutlineButton
                          className="flex-1"
                          label="Annuler"
                          onPress={cancelEdit}
                        />
                        <Button
                          className="flex-1"
                          isDisabled={
                            editLabel.trim() === '' || updateItem.isPending
                          }
                          onPress={saveEdit}
                        >
                          <Button.Label>Enregistrer</Button.Label>
                        </Button>
                      </View>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card key={item.id}>
                    <Card.Body className="flex-row items-center justify-between gap-2">
                      <Pressable
                        className="flex-1 gap-0.5"
                        onPress={() => startEdit(item)}
                      >
                        <Text className="text-[15px] font-medium text-[#1a1a1a]">
                          {item.label}
                        </Text>
                        {item.value ? (
                          <Text className="text-[13px] text-[#6b6b6b]">
                            {item.value}
                          </Text>
                        ) : null}
                      </Pressable>

                      <View className="flex-row items-center gap-1">
                        <Pressable
                          disabled={index === 0}
                          hitSlop={8}
                          onPress={() => moveItem(index, -1)}
                        >
                          <Text
                            className={
                              index === 0
                                ? 'text-[16px] text-[#d0d0d0]'
                                : 'text-[16px] text-[#6b6b6b]'
                            }
                          >
                            ▲
                          </Text>
                        </Pressable>
                        <Pressable
                          disabled={index === items.length - 1}
                          hitSlop={8}
                          onPress={() => moveItem(index, 1)}
                        >
                          <Text
                            className={
                              index === items.length - 1
                                ? 'text-[16px] text-[#d0d0d0]'
                                : 'text-[16px] text-[#6b6b6b]'
                            }
                          >
                            ▼
                          </Text>
                        </Pressable>
                        <CloseButton
                          onPress={() => deleteItem.mutate(item.id)}
                        />
                      </View>
                    </Card.Body>
                  </Card>
                ),
              )
            )}

            {isAdding ? (
              <Card>
                <Card.Body className="gap-2.5">
                  <PlainInput
                    placeholder="Libellé (ex. Groupe sanguin)"
                    value={newLabel}
                    onChangeText={setNewLabel}
                  />
                  <PlainInput
                    placeholder="Valeur"
                    value={newValue}
                    onChangeText={setNewValue}
                  />
                  <View className="flex-row gap-2">
                    <OutlineButton
                      className="flex-1"
                      label="Annuler"
                      onPress={() => {
                        setIsAdding(false);
                        setNewLabel('');
                        setNewValue('');
                      }}
                    />
                    <Button
                      className="flex-1"
                      isDisabled={
                        newLabel.trim() === '' || createItem.isPending
                      }
                      onPress={addItem}
                    >
                      <Button.Label>Ajouter</Button.Label>
                    </Button>
                  </View>
                </Card.Body>
              </Card>
            ) : (
              <OutlineButton
                label="+ Ajouter une information"
                onPress={() => setIsAdding(true)}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

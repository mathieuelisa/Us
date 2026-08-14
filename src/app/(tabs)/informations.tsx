import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { InfoItemFormModal } from '@/components/household/info-item-form-modal';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import type { HouseholdInfoItem } from '@/features/household/api';
import {
  formatInfoDate,
  INFO_CATEGORY_META,
  INFO_CATEGORY_ORDER,
  type InfoCategory,
  isInfoCategory,
} from '@/features/household/constants';
import {
  useCreateInfoItem,
  useDeleteInfoItem,
  useInfoItems,
  useMyHousehold,
  useUpdateInfoItem,
} from '@/features/household/hooks';
import { useThemeBackground } from '@/features/settings/hooks';
import { shiftIsoDate, todayIso } from '@/lib/date';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * ⚠️ TEMPORAIRE — visuel avant branchement Supabase (demande explicite) :
 * mêmes IDs/formes qu'un vrai `HouseholdInfoItem`, jamais persisté. À
 * retirer dès que le foyer réel remplace systématiquement cette liste (cf.
 * `MOCK_APPOINTMENTS` dans le hub, même parti pris).
 */
const MOCK_INFO_ITEMS: HouseholdInfoItem[] = [
  {
    id: 'mock-info-0a',
    household_id: 'mock',
    category: 'blood_type',
    label: 'Maman',
    value: 'A+',
    sort_order: -2,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-0b',
    household_id: 'mock',
    category: 'blood_type',
    label: 'Papa',
    value: 'O-',
    sort_order: -1,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-1',
    household_id: 'mock',
    category: 'vigilance',
    label: 'Point de vigilance',
    value: 'Diabète gestationnel',
    sort_order: 0,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-2',
    household_id: 'mock',
    category: 'vigilance',
    label: 'Point de vigilance',
    value: 'Hypertension légère',
    sort_order: 1,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-3',
    household_id: 'mock',
    category: 'allergy',
    label: 'Allergie',
    value: 'Pénicilline',
    sort_order: 2,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-4',
    household_id: 'mock',
    category: 'allergy',
    label: 'Allergie',
    value: 'Arachides',
    sort_order: 3,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-5',
    household_id: 'mock',
    category: 'phone',
    label: 'Sage-femme',
    value: '06 12 34 56 78',
    sort_order: 4,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-6',
    household_id: 'mock',
    category: 'phone',
    label: 'Maternité',
    value: '01 23 45 67 89',
    sort_order: 5,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-7',
    household_id: 'mock',
    category: 'address',
    label: 'Maternité des Lilas',
    value: '12 rue des Lilas, 75020 Paris',
    sort_order: 6,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-8',
    household_id: 'mock',
    category: 'date',
    label: 'Terme',
    value: shiftIsoDate(todayIso(), 60),
    sort_order: 7,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-9',
    household_id: 'mock',
    category: 'date',
    label: 'Début de grossesse',
    value: shiftIsoDate(todayIso(), -180),
    sort_order: 8,
    created_at: todayIso(),
  },
  {
    id: 'mock-info-10',
    household_id: 'mock',
    category: 'social_security',
    label: 'Maman',
    value: '2 99 08 75 123 456 78',
    sort_order: 9,
    created_at: todayIso(),
  },
];

function displayValue(item: HouseholdInfoItem, category: InfoCategory) {
  if (!item.value) return '';
  return INFO_CATEGORY_META[category].isDate
    ? formatInfoDate(item.value)
    : item.value;
}

/**
 * Écran "Informations importantes" — visuel rapide, groupé par catégorie
 * (points de vigilance et allergies en tête, demande explicite : ce sont
 * les infos les plus utiles dans l'urgence), plutôt qu'une liste plate
 * libellé/valeur. Chaque entrée porte une catégorie typée
 * (`household_info_items.category`) qui pilote son icône, sa couleur et son
 * formulaire de saisie dédié — voir `InfoItemFormModal`.
 *
 * Le "+" bas-droite reprend le style du bouton d'ajout de l'onglet Contacts
 * (demande explicite), mais ouvre une modale plutôt qu'un formulaire en
 * ligne : la création choisit d'abord une catégorie parmi 6.
 */
export default function InformationsScreen() {
  const { data: household, isLoading: isHouseholdLoading } = useMyHousehold();
  const householdId = household?.id;
  const backgroundColor = useThemeBackground();

  const { data: items = [], isLoading: areItemsLoading } =
    useInfoItems(householdId);
  const createItem = useCreateInfoItem(householdId);
  const updateItem = useUpdateInfoItem(householdId);
  const deleteItem = useDeleteInfoItem(householdId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HouseholdInfoItem | null>(
    null,
  );

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: HouseholdInfoItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const submit = (input: {
    category: InfoCategory;
    label: string;
    value: string;
  }) => {
    if (editingItem) {
      updateItem.mutate(
        {
          id: editingItem.id,
          patch: {
            label: input.label,
            value: input.value || null,
            category: input.category,
          },
        },
        { onSuccess: closeModal },
      );
    } else {
      createItem.mutate(
        {
          label: input.label,
          value: input.value || null,
          category: input.category,
          sortOrder: items.length,
        },
        { onSuccess: closeModal },
      );
    }
  };

  // Tant que le foyer/les items réels ne sont pas branchés, on affiche des
  // exemples fictifs plutôt qu'un état vide — voir `MOCK_INFO_ITEMS`.
  const displayedItems = items.length > 0 ? items : MOCK_INFO_ITEMS;
  const legacyItems = displayedItems.filter(
    (item) => !isInfoCategory(item.category),
  );

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-4 px-6 pb-24 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text className="text-[26px] font-bold text-[#1a1a1a]">
            Informations importantes
          </Text>
          <Text className="text-[13px] text-[#6b6b6b]">
            Partagées et modifiables par vous deux.
          </Text>
        </View>

        {isHouseholdLoading || areItemsLoading ? (
          <Text className="text-[13px] text-[#9a9a9a]">Chargement…</Text>
        ) : (
          <View className="flex-1 gap-5">
            {INFO_CATEGORY_ORDER.map((category) => {
              const meta = INFO_CATEGORY_META[category];
              const categoryItems = displayedItems.filter(
                (item) => item.category === category,
              );
              if (categoryItems.length === 0) return null;

              return (
                <View key={category} className="gap-2">
                  <View className="flex-row items-center gap-1.5">
                    <Ionicons name={meta.icon} size={13} color={meta.color} />
                    <Text className="text-[11.5px] font-semibold uppercase tracking-wide text-[#8a8a8a]">
                      {meta.sectionTitle}
                    </Text>
                  </View>

                  {meta.isChip ? (
                    <View className="flex-row flex-wrap gap-2">
                      {categoryItems.map((item) => (
                        <View
                          key={item.id}
                          className="flex-row items-center gap-1.5 rounded-full py-1.5 pl-3.5 pr-1.5"
                          style={{ backgroundColor: meta.tint }}
                        >
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => openEdit(item)}
                          >
                            <Text
                              className="text-[13px] font-medium"
                              style={{ color: meta.color }}
                            >
                              {item.value}
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityLabel={`Supprimer ${item.value}`}
                            accessibilityRole="button"
                            hitSlop={8}
                            onPress={() => deleteItem.mutate(item.id)}
                            className="h-5 w-5 items-center justify-center rounded-full bg-white/60"
                          >
                            <Text
                              className="text-[10px] font-bold"
                              style={{ color: meta.color }}
                            >
                              ✕
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className="gap-2">
                      {categoryItems.map((item) => (
                        <View
                          key={item.id}
                          className="flex-row items-center gap-3 rounded-2xl border border-[#ececec] bg-white px-4 py-3.5"
                        >
                          <View
                            className="h-9 w-9 items-center justify-center rounded-full"
                            style={{ backgroundColor: meta.tint }}
                          >
                            <Ionicons
                              name={meta.icon}
                              size={16}
                              color={meta.color}
                            />
                          </View>
                          <Pressable
                            className="flex-1 gap-0.5"
                            onPress={() => openEdit(item)}
                          >
                            <Text className="text-[15px] font-medium text-[#1a1a1a]">
                              {item.label}
                            </Text>
                            <Text className="text-[13px] text-[#6b6b6b]">
                              {displayValue(item, category)}
                            </Text>
                          </Pressable>

                          <Pressable
                            accessibilityLabel={`Supprimer ${item.label}`}
                            accessibilityRole="button"
                            hitSlop={8}
                            onPress={() => deleteItem.mutate(item.id)}
                          >
                            <Text className="text-[15px] text-[#9a9a9a]">
                              ✕
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

            {legacyItems.length > 0 ? (
              <View className="gap-2">
                <Text className="text-[11.5px] font-semibold uppercase tracking-wide text-[#8a8a8a]">
                  Autres
                </Text>
                <View className="gap-2">
                  {legacyItems.map((item) => (
                    <View
                      key={item.id}
                      className="flex-row items-center justify-between gap-2 rounded-2xl border border-[#ececec] bg-white px-4 py-3.5"
                    >
                      <View className="flex-1 gap-0.5">
                        <Text className="text-[15px] font-medium text-[#1a1a1a]">
                          {item.label}
                        </Text>
                        {item.value ? (
                          <Text className="text-[13px] text-[#6b6b6b]">
                            {item.value}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        accessibilityLabel={`Supprimer ${item.label}`}
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => deleteItem.mutate(item.id)}
                      >
                        <Text className="text-[15px] text-[#9a9a9a]">✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      <Pressable
        accessibilityLabel="Ajouter une information"
        accessibilityRole="button"
        onPress={openCreate}
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-accent shadow-lg"
      >
        <Text className="text-[26px] font-medium leading-7 text-accent-foreground">
          +
        </Text>
      </Pressable>

      <InfoItemFormModal
        visible={isModalOpen}
        isSaving={createItem.isPending || updateItem.isPending}
        editingItem={editingItem}
        onCancel={closeModal}
        onSubmit={submit}
      />
    </SafeAreaView>
  );
}

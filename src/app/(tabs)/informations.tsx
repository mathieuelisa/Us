import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';
import { EmptyInfoState } from '@/components/household/empty-info-state';
import { InfoItemFormModal } from '@/components/household/info-item-form-modal';
import {
  useTabBarContentInset,
  useTabBarHeight,
} from '@/components/navigation/use-tab-bar-height';
import { BlobFab } from '@/components/ui/blob-fab';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
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
  useCreateInfoItems,
  useDeleteInfoItem,
  useInfoItems,
  useMyHousehold,
  useUpdateInfoItem,
} from '@/features/household/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';
import { formatPhoneNumber } from '@/lib/phone';

const SafeAreaView = withUniwind(RNSafeAreaView);

const HEADER_IMAGE = require('@/assets/images/Baby_said_hi.png');

function displayValue(item: HouseholdInfoItem, category: InfoCategory) {
  if (!item.value) return '';
  if (INFO_CATEGORY_META[category].isDate) return formatInfoDate(item.value);
  // Groupé par paires même pour un numéro saisi avant le formatage auto.
  if (category === 'phone') return formatPhoneNumber(item.value);
  return item.value;
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
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const tabBarHeight = useTabBarHeight();
  const { data: household, isLoading: isHouseholdLoading } = useMyHousehold();
  const householdId = household?.id;
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  const { data: items = [], isLoading: areItemsLoading } =
    useInfoItems(householdId);
  const createItems = useCreateInfoItems(householdId);
  const updateItem = useUpdateInfoItem(householdId);
  const deleteItem = useDeleteInfoItem(householdId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HouseholdInfoItem | null>(
    null,
  );
  /** Catégorie choisie depuis une suggestion de l'état vide, le cas échéant. */
  const [initialCategory, setInitialCategory] = useState<InfoCategory | null>(
    null,
  );

  const openCreate = (category: InfoCategory | null = null) => {
    setEditingItem(null);
    setInitialCategory(category);
    setIsModalOpen(true);
  };

  const openEdit = (item: HouseholdInfoItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setInitialCategory(null);
  };

  const submit = (input: {
    category: InfoCategory;
    label: string;
    values: string[];
  }) => {
    if (editingItem) {
      updateItem.mutate(
        {
          id: editingItem.id,
          patch: {
            label: input.label,
            value: input.values[0] || null,
            category: input.category,
          },
        },
        { onSuccess: closeModal },
      );
      return;
    }

    // Plusieurs exemples cochés → plusieurs éléments. Un élément déjà
    // présent dans la même catégorie n'est pas recréé en double.
    const existing = new Set(
      items
        .filter((item) => item.category === input.category)
        .map((item) => (item.value ?? '').trim().toLowerCase()),
    );
    const newValues = input.values.filter(
      (value) => !existing.has(value.toLowerCase()),
    );
    if (newValues.length === 0) {
      closeModal();
      return;
    }
    createItems.mutate(
      {
        items: newValues.map((value) => ({
          label: input.label,
          value: value || null,
          category: input.category,
        })),
        firstSortOrder: items.length,
      },
      { onSuccess: closeModal },
    );
  };

  const legacyItems = items.filter((item) => !isInfoCategory(item.category));

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-4 px-6 pt-4"
        // Place en plus pour le bouton + flottant.
        contentContainerStyle={{ paddingBottom: tabBarInset + 72 }}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête d'après une capture de référence (demande explicite) :
            grand titre, sous-titre souligné, ourson en haut à droite sur une
            tache d'accent, avec goutte (groupe sanguin), feuille et cœur. */}
        <View className="min-h-[136px] justify-center">
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: -6, right: -14 }}
          >
            <View
              style={{
                position: 'absolute',
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: hexToRgba(accent, 0.1),
                top: 10,
                left: 14,
              }}
            />
            <Ionicons
              name="leaf"
              size={34}
              color={hexToRgba(accent, 0.3)}
              style={{
                position: 'absolute',
                right: 6,
                bottom: 6,
                transform: [{ rotate: '25deg' }],
              }}
            />
            <Image
              source={HEADER_IMAGE}
              style={{ width: 128, height: 148 }}
              resizeMode="contain"
            />
            <Ionicons
              name="water"
              size={30}
              color="#f08aa8"
              style={{
                position: 'absolute',
                left: -16,
                top: 26,
                transform: [{ rotate: '-10deg' }],
              }}
            />
            <Ionicons
              name="heart"
              size={16}
              color="#f08aa8"
              style={{ position: 'absolute', right: 4, top: 4 }}
            />
          </View>

          <View className="gap-1.5" style={{ maxWidth: '64%' }}>
            <Text
              className="text-[28px] font-extrabold leading-[34px]"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
            >
              Informations importantes
            </Text>
            <Text
              className="text-[14px] leading-5"
              style={{ color: GLASS_BODY_COLOR }}
            >
              Partagées et modifiables par vous deux.
            </Text>
            <Svg width={120} height={10} viewBox="0 0 120 10">
              <Path
                d="M3 7 C 34 2, 80 1.5, 117 4"
                stroke={hexToRgba(accent, 0.5)}
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
          </View>
        </View>

        {isHouseholdLoading || areItemsLoading ? (
          <Text className="text-[13px] text-[#9a9a9a]">Chargement…</Text>
        ) : (
          <View className="flex-1 gap-5">
            {items.length === 0 ? (
              <EmptyInfoState accent={accent} onPickCategory={openCreate} />
            ) : null}
            {INFO_CATEGORY_ORDER.map((category) => {
              const meta = INFO_CATEGORY_META[category];
              const categoryItems = items.filter(
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

      {/* Rebond d'invitation, comme la sélection d'un onglet, tant
          qu'aucune information n'est saisie (demande explicite) — pas
          pendant le chargement, où la liste est vide sans l'être vraiment. */}
      <BlobFab
        accessibilityLabel="Ajouter une information"
        onPress={() => openCreate()}
        className="absolute right-6"
        // Juste au-dessus de la barre du bas, qui flotte sur le contenu.
        style={{ bottom: tabBarHeight + 12 }}
        invite={!isHouseholdLoading && !areItemsLoading && items.length === 0}
      />

      <InfoItemFormModal
        visible={isModalOpen}
        isSaving={createItems.isPending || updateItem.isPending}
        editingItem={editingItem}
        initialCategory={initialCategory}
        existingItems={items}
        onCancel={closeModal}
        onSubmit={submit}
      />
    </SafeAreaView>
  );
}

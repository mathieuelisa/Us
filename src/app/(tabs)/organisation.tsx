import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { PremiumTeaserCard } from '@/components/hub/premium-teaser-card';
import { ProgressBar } from '@/components/organisation/progress-bar';
import { PlainInput } from '@/components/plain-input';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useMyHousehold } from '@/features/household/hooks';
import { CARD_SHADOW } from '@/features/hub/constants';
import type { ChecklistItem } from '@/features/organisation/api';
import {
  CHECKLIST_CATEGORY_META,
  CHECKLIST_META,
  CHECKLIST_ORDER,
  canAddCustomItem,
  filterVisibleChecklistItems,
  groupChecklistItemsByCategory,
  groupChecklistItemsBySlug,
} from '@/features/organisation/constants';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { DEV_CHECKLIST_ITEMS_FIXTURE } from '@/features/organisation/dev-fixture';
import {
  useAddCustomChecklistItem,
  useChecklistItems,
  useDeleteCustomChecklistItem,
  useToggleChecklistItem,
} from '@/features/organisation/hooks';
import { useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import {
  devBypassAccompanimentTypeAtom,
  devBypassAtom,
} from '@/lib/atoms/dev-bypass';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écran « Organisation & Préparation » — nouvelle section, hors maquettes
 * et CONCEPT.md (demande explicite). Liste et détail dans un seul écran,
 * bascule par état local, même parti pris que Démarches/Suivi santé.
 *
 * Pas de règle de visibilité par rôle : les deux parents voient et cochent
 * les mêmes listes, comme pour les démarches administratives. Seule la
 * sous-section « Co-parent » de la valise de maternité est masquée quand le
 * foyer est « Seul·e » (demande explicite).
 */
export default function OrganisationScreen() {
  const router = useRouter();
  const { data: household } = useMyHousehold();

  const { data: remoteItems = [] } = useChecklistItems(household);
  const toggleItem = useToggleChecklistItem(household);
  const addCustomItem = useAddCustomChecklistItem(household);
  const deleteCustomItem = useDeleteCustomChecklistItem(household);

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts. Sans foyer réel,
  // remoteItems reste toujours vide (la requête est désactivée) : cet écran
  // ne montrerait jamais rien à explorer. Les cases cochées en mode DEV
  // restent locales, elles n'écrivent jamais dans Supabase.
  const isDevBypass = useAtomValue(devBypassAtom) !== 'off';
  const devBypassAccompanimentType = useAtomValue(
    devBypassAccompanimentTypeAtom,
  );
  const [devItems, setDevItems] = useState(DEV_CHECKLIST_ITEMS_FIXTURE);
  const items = isDevBypass ? devItems : remoteItems;

  // Sans foyer réel en mode contournement, on retombe sur la réponse donnée
  // à l'étape 1 de l'onboarding (conservée à part, cf. dev-bypass.ts) —
  // jamais un foyer inconnu n'est traité comme « Seul·e » par défaut.
  const accompanimentType = isDevBypass
    ? devBypassAccompanimentType
    : (household?.accompaniment_type ?? null);
  const hideCoParent = accompanimentType === 'seul';

  const toggleChecked = (item: ChecklistItem) => {
    if (isDevBypass) {
      setDevItems((current) =>
        current.map((current_item) =>
          current_item.id === item.id
            ? { ...current_item, checked: !current_item.checked }
            : current_item,
        ),
      );
      return;
    }
    toggleItem.mutate({
      itemId: item.id,
      checked: !item.checked,
      isCustom: item.isCustom,
    });
  };

  const addItem = (input: {
    checklistSlug: string;
    category: string;
    label: string;
  }) => {
    // Rangé après les articles existants de la sous-section ; le tri
    // d'affichage place de toute façon les ajouts en fin de liste.
    const sortOrder =
      items.reduce((max, item) => Math.max(max, item.sortOrder), 0) + 1;

    if (isDevBypass) {
      setDevItems((current) => [
        ...current,
        {
          id: `dev-custom-${Date.now()}`,
          checklistSlug: input.checklistSlug,
          label: input.label,
          sortOrder,
          checked: false,
          category: input.category,
          isCustom: true,
        },
      ]);
      return;
    }
    addCustomItem.mutate({ ...input, sortOrder });
  };

  const removeItem = (item: ChecklistItem) => {
    if (isDevBypass) {
      setDevItems((current) =>
        current.filter((current_item) => current_item.id !== item.id),
      );
      return;
    }
    deleteCustomItem.mutate(item.id);
  };

  const visibleItems = filterVisibleChecklistItems(items, { hideCoParent });
  const itemsBySlug = groupChecklistItemsBySlug(visibleItems);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedItems = selectedSlug ? (itemsBySlug[selectedSlug] ?? []) : [];
  const backgroundColor = useThemeBackground();

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-5 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Revenir en arrière"
          accessibilityRole="button"
          hitSlop={12}
          style={CARD_SHADOW}
          onPress={() => (selectedSlug ? setSelectedSlug(null) : router.back())}
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
        </Pressable>

        {selectedSlug ? (
          <ChecklistDetail
            slug={selectedSlug}
            items={selectedItems}
            onToggleItem={toggleChecked}
            onAddItem={addItem}
            onRemoveItem={removeItem}
          />
        ) : (
          <>
            <View className="gap-1">
              <Text className="text-[26px] font-bold text-[#1a1a1a]">
                Organisation & Préparation
              </Text>
              <Text className="text-[13px] text-[#6b6b6b]">
                L'organisation pratique... et les décisions plus légères, comme
                le prénom.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
                LES CHECKLISTS DES VALISES
              </Text>
              <View className="gap-2.5">
                {CHECKLIST_ORDER.map((slug) => {
                  const meta = CHECKLIST_META[slug];
                  const slugItems = itemsBySlug[slug] ?? [];
                  const checkedCount = slugItems.filter(
                    (item) => item.checked,
                  ).length;
                  const progress =
                    slugItems.length === 0
                      ? 0
                      : checkedCount / slugItems.length;

                  return (
                    <Pressable
                      key={slug}
                      accessibilityRole="button"
                      style={CARD_SHADOW}
                      onPress={() => setSelectedSlug(slug)}
                      className="gap-3 rounded-2xl bg-white px-4 py-4"
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          style={{ backgroundColor: meta.bg }}
                          className="h-11 w-11 items-center justify-center rounded-full"
                        >
                          <Text className="text-[20px]">{meta.emoji}</Text>
                        </View>
                        <View className="flex-1 gap-0.5">
                          <Text className="text-[15px] font-medium text-[#1a1a1a]">
                            {meta.title}
                          </Text>
                          <Text className="text-[13px] text-[#6b6b6b]">
                            {checkedCount} sur {slugItems.length} complétés
                          </Text>
                        </View>
                        <Text className="text-[20px] text-[#c0c0c0]">›</Text>
                      </View>
                      <ProgressBar progress={progress} />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Même carte sobre que « Votre bébé » sur le hub
                (PremiumTeaserCard) — ouvre son propre écran d'accès
                verrouillé (`/prenoms`), même concept que `/bebe` (demande
                explicite). */}
            <View className="gap-2">
              <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
                JEUX
              </Text>
              <PremiumTeaserCard
                icon={
                  <Image
                    source={require('@/assets/images/Heart_girls_boys.png')}
                    className="h-7 w-7"
                    resizeMode="contain"
                  />
                }
                title="Le match des prénoms"
                subtitle="Trouvez le prénom parfait à deux"
                onPress={() => router.push('/prenoms')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChecklistDetail({
  slug,
  items,
  onToggleItem,
  onAddItem,
  onRemoveItem,
}: {
  slug: string;
  items: ChecklistItem[];
  onToggleItem: (item: ChecklistItem) => void;
  onAddItem: (input: {
    checklistSlug: string;
    category: string;
    label: string;
  }) => void;
  onRemoveItem: (item: ChecklistItem) => void;
}) {
  const meta = CHECKLIST_META[slug];
  const checkedCount = items.filter((item) => item.checked).length;
  const progress = items.length === 0 ? 0 : checkedCount / items.length;
  const categoryGroups = groupChecklistItemsByCategory(items, slug);

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-[24px] font-bold text-[#1a1a1a]">
          {meta.title}
        </Text>
        {/* Le total suit les ajouts : un article personnalisé compte comme
            les autres, au numérateur comme au dénominateur. */}
        <Text className="text-[13px] font-medium text-accent">
          {checkedCount} sur {items.length} complétés
        </Text>
      </View>

      <ProgressBar progress={progress} />

      {categoryGroups.length > 0 ? (
        <View className="gap-4">
          {categoryGroups.map((group) => (
            <View key={group.category} className="gap-2.5">
              <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
                {CHECKLIST_CATEGORY_META[group.category].title.toUpperCase()}
              </Text>
              <View className="gap-2.5">
                {group.items.map((item) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    onToggle={onToggleItem}
                    onRemove={onRemoveItem}
                  />
                ))}

                {canAddCustomItem(slug, group.category) ? (
                  <AddChecklistItemRow
                    categoryTitle={
                      CHECKLIST_CATEGORY_META[group.category].title
                    }
                    onAdd={(label) =>
                      onAddItem({
                        checklistSlug: slug,
                        category: group.category,
                        label,
                      })
                    }
                  />
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="gap-2.5">
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onToggle={onToggleItem}
              onRemove={onRemoveItem}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * Dernière ligne d'une sous-section personnalisable : un bouton discret
 * qui se déplie en champ de saisie.
 *
 * Saisie en ligne plutôt qu'en modale : ajouter « Une brumisateur » à sa
 * valise est un geste bref et répétitif — on en ajoute souvent plusieurs
 * d'affilée, et le champ reste ouvert d'un ajout à l'autre.
 */
function AddChecklistItemRow({
  categoryTitle,
  onAdd,
}: {
  categoryTitle: string;
  onAdd: (label: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState('');
  const trimmed = label.trim();

  if (!isEditing) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ajouter un élément à la sous-section ${categoryTitle}`}
        onPress={() => setIsEditing(true)}
        className="flex-row items-center gap-3 rounded-2xl border border-dashed border-[#c9c9c9] px-4 py-3.5 active:opacity-60"
      >
        <Ionicons name="add-circle-outline" size={22} color="#2D5E5A" />
        <Text className="flex-1 text-[14px] text-[#6b6b6b]">
          Ajouter un élément
        </Text>
      </Pressable>
    );
  }

  function submit() {
    if (trimmed.length === 0) return;
    onAdd(trimmed);
    setLabel('');
  }

  return (
    <View
      style={CARD_SHADOW}
      className="gap-2.5 rounded-2xl bg-white px-4 py-3.5"
    >
      <PlainInput
        autoFocus
        placeholder={`À ajouter dans « ${categoryTitle} »`}
        value={label}
        onChangeText={setLabel}
        maxLength={120}
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <View className="flex-row items-center justify-end gap-4">
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => {
            setLabel('');
            setIsEditing(false);
          }}
        >
          <Text className="text-[13.5px] text-[#6b6b6b]">Annuler</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: trimmed.length === 0 }}
          disabled={trimmed.length === 0}
          onPress={submit}
          className={`rounded-full px-4 py-2 ${
            trimmed.length === 0 ? 'bg-[#1f3d3a]/30' : 'bg-[#1f3d3a]'
          }`}
        >
          <Text className="text-[13.5px] font-semibold text-white">
            Ajouter
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ChecklistItemRow({
  item,
  onToggle,
  onRemove,
}: {
  item: ChecklistItem;
  onToggle: (item: ChecklistItem) => void;
  onRemove: (item: ChecklistItem) => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={item.label}
      accessibilityState={{ checked: item.checked }}
      style={CARD_SHADOW}
      onPress={() => onToggle(item)}
      className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3.5"
    >
      <Ionicons
        name={item.checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={item.checked ? '#2D5E5A' : '#c0c0c0'}
      />
      <Text
        className={`flex-1 text-[14px] ${
          item.checked ? 'text-[#9a9a9a] line-through' : 'text-[#1a1a1a]'
        }`}
      >
        {item.label}
      </Text>

      {/* Seuls les articles ajoutés par le foyer se suppriment : le
          catalogue partagé reste intact, on ne fait que le cocher. */}
      {item.isCustom ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Supprimer « ${item.label} »`}
          hitSlop={10}
          onPress={() => onRemove(item)}
        >
          <Ionicons name="close" size={18} color="#b0b0b0" />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

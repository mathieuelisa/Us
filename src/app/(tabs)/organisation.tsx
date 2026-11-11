import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { type ComponentProps, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import { PremiumTeaserCard } from '@/components/hub/premium-teaser-card';
import { ProgressBar } from '@/components/organisation/progress-bar';
import { PlainInput } from '@/components/plain-input';
import {
  ChevronBubble,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  GlassCard,
  SparkLines,
} from '@/components/ui/glass-card';
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
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import {
  devBypassAccompanimentTypeAtom,
  devBypassAtom,
} from '@/lib/atoms/dev-bypass';
import { hexToRgba } from '@/lib/color';

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
 *
 * Liste modernisée d'après une capture de référence (demande explicite) :
 * grand bouton retour, ourson en en-tête, titre souligné, intitulés de
 * section à icône, checklists en cartes « verre dépoli » (grande pastille
 * d'emoji, avancement coché, barre de progression, chevron en pastille).
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
  const accent = useThemeAccent();

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
        <View>
          {selectedSlug ? null : <HeaderIllustration accent={accent} />}
          <Pressable
            accessibilityLabel="Revenir en arrière"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() =>
              selectedSlug ? setSelectedSlug(null) : router.back()
            }
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: accent,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            <Ionicons name="chevron-back" size={22} color={GLASS_TITLE_COLOR} />
          </Pressable>
        </View>

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
            <View className="gap-2">
              <View className="gap-2" style={{ maxWidth: '64%' }}>
                <Text
                  className="text-[28px] font-extrabold leading-[34px]"
                  style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
                >
                  Organisation & Préparation
                </Text>
                <Svg width={130} height={10} viewBox="0 0 130 10">
                  <Path
                    d="M3 7 C 38 2, 88 1.5, 127 4"
                    stroke={hexToRgba(accent, 0.5)}
                    strokeWidth={3}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              </View>
              <Text
                className="text-[14px] leading-5"
                style={{ color: GLASS_BODY_COLOR }}
              >
                L'organisation pratique... et les décisions plus légères, comme
                le prénom.
              </Text>
            </View>

            <View className="gap-3">
              <SectionHeading
                icon="clipboard-outline"
                label="LES CHECKLISTS DES VALISES"
                accent={accent}
              />
              <View className="gap-3">
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
                    <GlassCard
                      key={slug}
                      accessibilityLabel={`${meta.title}, ${checkedCount} sur ${slugItems.length} complétés`}
                      accent={accent}
                      onPress={() => setSelectedSlug(slug)}
                    >
                      <View className="flex-row items-center gap-3.5 py-4 pl-4 pr-3">
                        <View
                          style={{ backgroundColor: meta.bg }}
                          className="h-14 w-14 items-center justify-center rounded-full"
                        >
                          <Text className="text-[27px]">{meta.emoji}</Text>
                        </View>
                        <View className="flex-1 gap-1.5">
                          <Text
                            className="text-[16px] font-bold"
                            style={{ color: GLASS_TITLE_COLOR }}
                          >
                            {meta.title}
                          </Text>
                          <View className="flex-row items-center gap-1.5">
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={hexToRgba(accent, 0.75)}
                            />
                            <Text
                              className="text-[13px]"
                              style={{ color: GLASS_BODY_COLOR }}
                            >
                              {checkedCount} sur {slugItems.length} complétés
                            </Text>
                          </View>
                          <ProgressBar progress={progress} />
                        </View>
                        <ChevronBubble accent={accent} />
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            </View>

            {/* Même carte sobre que « Votre bébé » sur le hub
                (PremiumTeaserCard) — ouvre son propre écran d'accès
                verrouillé (`/prenoms`), même concept que `/bebe` (demande
                explicite). */}
            <View className="gap-3">
              <SectionHeading
                icon="game-controller-outline"
                label="JEUX"
                accent={accent}
              />
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
                illustration={<NameCardsIllustration />}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Intitulé de section : icône d'accent, libellé espacé. */
function SectionHeading({
  icon,
  label,
  accent,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  accent: string;
}) {
  return (
    <View className="flex-row items-center gap-2.5 px-1">
      <Ionicons name={icon} size={20} color={accent} />
      <Text
        className="text-[12.5px] font-bold"
        style={{ color: '#5b5470', letterSpacing: 1.1 }}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Ourson en haut à droite de l'en-tête, sur une tache d'accent, avec
 * feuille et cœurs (capture de référence).
 */
function HeaderIllustration({ accent }: { accent: string }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: -12 }}
    >
      <View
        style={{
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: 65,
          backgroundColor: hexToRgba(accent, 0.1),
          top: 14,
          left: 14,
        }}
      />
      <Ionicons
        name="leaf"
        size={34}
        color={hexToRgba(accent, 0.3)}
        style={{
          position: 'absolute',
          right: 4,
          bottom: 8,
          transform: [{ rotate: '25deg' }],
        }}
      />
      <Image
        source={require('@/assets/images/Baby_said_hi.png')}
        style={{ width: 128, height: 148 }}
        resizeMode="contain"
      />
      <Ionicons
        name="heart"
        size={18}
        color="#f08aa8"
        style={{ position: 'absolute', left: -10, top: 30 }}
      />
      <Ionicons
        name="heart"
        size={14}
        color="#f08aa8"
        style={{ position: 'absolute', right: 2, top: 4 }}
      />
    </View>
  );
}

/**
 * Deux cartes à jouer penchées (cœur, étoile) avec petits traits — évoque
 * le jeu du match des prénoms (capture de référence). Composée de vues et
 * d'icônes, faute d'illustration dédiée.
 */
function NameCardsIllustration() {
  const card = (
    rotate: string,
    left: number,
    top: number,
    background: string,
    icon: 'heart' | 'star',
    color: string,
  ) => (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width: 40,
        height: 48,
        borderRadius: 10,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <Ionicons name={icon} size={20} color={color} />
    </View>
  );

  return (
    <View pointerEvents="none" style={{ width: 82, height: 64 }}>
      {card('-14deg', 4, 10, '#fdf7fb', 'heart', '#f08aa8')}
      {card('10deg', 36, 6, '#fdf3dc', 'star', '#f2b84b')}
      <SparkLines
        color="#8fd3c0"
        style={{ left: 30, top: -14, transform: [{ scale: 0.8 }] }}
      />
    </View>
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

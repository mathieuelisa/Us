import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { type ComponentProps, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import { NameCardsIllustration } from '@/components/hub/name-cards-illustration';
import { PremiumTeaserCard } from '@/components/hub/premium-teaser-card';
import { ProgressBar } from '@/components/organisation/progress-bar';
import { PlainInput } from '@/components/plain-input';
import { BlobIllustration } from '@/components/ui/blob-illustration';
import {
  ChevronBubble,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  GlassCard,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useMyHousehold } from '@/features/household/hooks';
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
import {
  useAddCustomChecklistItem,
  useChecklistItems,
  useDeleteCustomChecklistItem,
  useToggleChecklistItem,
} from '@/features/organisation/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

/** Surface « verre dépoli » des cartes du détail d'une checklist. */
const GLASS_SURFACE = {
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.95)',
} as const;

const tintedShadow = (accent: string) =>
  ({
    shadowColor: accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  }) as const;

/** Icône de la pastille de chaque sous-section (Maman / Bébé / Co-parent). */
const CATEGORY_ICONS: Record<string, ComponentProps<typeof Ionicons>['name']> =
  {
    co_parent: 'man-outline',
  };

/**
 * Pictogrammes dessinés (fournis par l'utilisateur) à la place des icônes
 * génériques : mère portant son bébé pour « Maman », visage de bébé pour
 * « Bébé ». Images transparentes recolorées par `tintColor` : elles suivent
 * la couleur d'accent du thème, comme l'icône de « Co-parent ».
 */
const CATEGORY_IMAGES: Record<string, number> = {
  maman: require('@/assets/images/Icon_maman.png'),
  bebe: require('@/assets/images/Icon_bebe.png'),
};

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

  const { data: items = [] } = useChecklistItems(household);
  const toggleItem = useToggleChecklistItem(household);
  const addCustomItem = useAddCustomChecklistItem(household);
  const deleteCustomItem = useDeleteCustomChecklistItem(household);

  // Un foyer inconnu n'est jamais traité comme « Seul·e » par défaut.
  const hideCoParent = household?.accompaniment_type === 'seul';

  const toggleChecked = (item: ChecklistItem) => {
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

    addCustomItem.mutate({ ...input, sortOrder });
  };

  const removeItem = (item: ChecklistItem) => {
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
            hideCoParent={hideCoParent}
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

function ChecklistDetail({
  slug,
  hideCoParent,
  items,
  onToggleItem,
  onAddItem,
  onRemoveItem,
}: {
  slug: string;
  hideCoParent: boolean;
  items: ChecklistItem[];
  onToggleItem: (item: ChecklistItem) => void;
  onAddItem: (input: {
    checklistSlug: string;
    category: string;
    label: string;
  }) => void;
  onRemoveItem: (item: ChecklistItem) => void;
}) {
  const accent = useThemeAccent();
  const meta = CHECKLIST_META[slug];
  const checkedCount = items.filter((item) => item.checked).length;
  const progress = items.length === 0 ? 0 : checkedCount / items.length;
  const categoryGroups = groupChecklistItemsByCategory(items, slug, {
    hideCoParent,
  });

  return (
    <View className="gap-5">
      <View className="gap-3">
        {/* Illustration de la valise en haut à droite (image fournie, ou
            emoji sur une tache d'accent à défaut). */}
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: -56, right: -10 }}
        >
          {meta.image ? (
            <Image
              source={meta.image}
              style={{ width: 132, height: 102 }}
              resizeMode="contain"
            />
          ) : (
            <BlobIllustration accent={accent} size={96}>
              <Text style={{ fontSize: 50 }}>{meta.emoji}</Text>
            </BlobIllustration>
          )}
        </View>

        <View className="gap-1" style={{ maxWidth: '68%' }}>
          <Text
            className="text-[26px] font-extrabold leading-[31px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.5 }}
          >
            {meta.title}
          </Text>
          {/* Le total suit les ajouts : un article personnalisé compte comme
              les autres, au numérateur comme au dénominateur. */}
          <Text className="text-[14px] font-bold" style={{ color: accent }}>
            {checkedCount} sur {items.length} complétés
          </Text>
        </View>

        <ProgressBar progress={progress} />
      </View>

      {categoryGroups.length > 0 ? (
        <View className="gap-5">
          {categoryGroups.map((group) => (
            <View key={group.category} className="gap-3">
              <CategoryHeader category={group.category} accent={accent} />
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
  const accent = useThemeAccent();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState('');
  const trimmed = label.trim();

  if (!isEditing) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ajouter un élément à la sous-section ${categoryTitle}`}
        onPress={() => setIsEditing(true)}
        className="mt-1 h-12 flex-row items-center justify-center gap-2.5 rounded-full active:opacity-70"
        style={{
          borderWidth: 1.5,
          borderColor: accent,
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        <Ionicons name="add-circle" size={24} color={accent} />
        <Text className="text-[15px] font-bold" style={{ color: accent }}>
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
      className="gap-2.5 rounded-[22px] px-4 py-3.5"
      style={[tintedShadow(accent), GLASS_SURFACE]}
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
          className="rounded-full px-4 py-2"
          style={{
            backgroundColor: accent,
            opacity: trimmed.length === 0 ? 0.35 : 1,
          }}
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
  const accent = useThemeAccent();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={item.label}
      accessibilityState={{ checked: item.checked }}
      onPress={() => onToggle(item)}
      className="min-h-[56px] flex-row items-center gap-3.5 rounded-[22px] px-4 py-3"
      style={[tintedShadow(accent), GLASS_SURFACE]}
    >
      {/* Cochée : rond d'accent plein avec coche ; à faire : carré arrondi
          vide — l'état reste lisible même sans distinguer les couleurs. */}
      {item.checked ? (
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: accent }}
        >
          <Ionicons name="checkmark" size={18} color="#ffffff" />
        </View>
      ) : (
        <View className="h-8 w-8 items-center justify-center">
          <View
            className="h-6 w-6 rounded-[8px]"
            style={{ borderWidth: 1.5, borderColor: '#cfcdd8' }}
          />
        </View>
      )}
      <Text
        className="flex-1 text-[15px]"
        style={
          item.checked
            ? { color: '#a3a1b0', textDecorationLine: 'line-through' }
            : { color: GLASS_TITLE_COLOR }
        }
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
          className="h-8 w-8 items-center justify-center rounded-full bg-[#f4f3f7]"
        >
          <Ionicons name="close" size={16} color={GLASS_BODY_COLOR} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/**
 * En-tête d'une sous-section (Maman / Bébé / Co-parent) d'une valise : une
 * pastille teintée d'accent, pictogramme et titre côte à côte (maquette
 * fournie). Pas de rond blanc derrière le pictogramme (demande explicite) :
 * il se pose directement sur la pastille, recoloré à l'accent du thème.
 */
function CategoryHeader({
  category,
  accent,
}: {
  category: string;
  accent: string;
}) {
  const image = CATEGORY_IMAGES[category];

  return (
    <View
      className="flex-row items-center gap-2.5 self-start rounded-full py-2 pl-3 pr-5"
      style={{ backgroundColor: hexToRgba(accent, 0.1) }}
    >
      {image ? (
        <Image
          source={image}
          style={{ width: 24, height: 24, tintColor: accent }}
          resizeMode="contain"
        />
      ) : (
        <Ionicons
          name={CATEGORY_ICONS[category] ?? 'list-outline'}
          size={22}
          color={accent}
        />
      )}
      <Text
        className="text-[16px] font-bold"
        style={{ color: GLASS_TITLE_COLOR }}
      >
        {CHECKLIST_CATEGORY_META[category].title}
      </Text>
    </View>
  );
}

import type { ChecklistItem } from './api';

/**
 * ⚠️ Contenu inventé : ni les maquettes ni CONCEPT.md ne décrivent cette
 * section — demande explicite de l'utilisateur, sans liste d'affaires
 * fournie. Les deux listes reprennent des essentiels usuels (valise de
 * maternité / valise pour la salle de naissance), à ajuster si besoin.
 */
export const CHECKLIST_META: Record<
  string,
  { title: string; emoji: string; bg: string }
> = {
  'valise-maternite': {
    title: 'La Valise de maternité',
    emoji: '🧳',
    bg: '#DCEAFB',
  },
  'sac-naissance': {
    title: 'La valise en salle de naissance',
    emoji: '🎒',
    bg: '#FBE4D8',
  },
};

/** Ordre d'affichage des 2 blocs. */
export const CHECKLIST_ORDER = ['valise-maternite', 'sac-naissance'];

/**
 * Sous-sections Maman / Bébé / Co-parent, appliquées aux deux checklists
 * (demande explicite) — chaque article porte une `category`
 * (cf. `groupChecklistItemsByCategory`).
 */
export const CHECKLIST_CATEGORY_META: Record<string, { title: string }> = {
  maman: { title: 'Maman' },
  bebe: { title: 'Bébé' },
  co_parent: { title: 'Co-parent' },
};

export const CHECKLIST_CATEGORY_ORDER = ['maman', 'bebe', 'co_parent'];

/**
 * Sous-sections où l'on peut ajouter ses propres articles, par checklist.
 *
 * Les 3 sous-sections de la valise de maternité (demande explicite) ; la
 * valise de salle de naissance n'en a pas. Une table plutôt qu'un booléen
 * en dur dans l'écran : étendre le périmètre se fait ici, en une ligne.
 */
export const CUSTOM_ITEM_CATEGORIES: Record<string, string[]> = {
  'valise-maternite': ['maman', 'bebe', 'co_parent'],
};

export function canAddCustomItem(slug: string, category: string): boolean {
  return CUSTOM_ITEM_CATEGORIES[slug]?.includes(category) ?? false;
}

/**
 * Tri d'affichage : les articles ajoutés par le foyer passent après ceux
 * du catalogue, quel que soit leur `sortOrder` — « à la fin » de la
 * sous-section est une position, pas un rang à négocier avec le
 * catalogue.
 */
function sortChecklistItems(a: ChecklistItem, b: ChecklistItem): number {
  if (a.isCustom !== b.isCustom) return a.isCustom ? 1 : -1;
  return a.sortOrder - b.sortOrder;
}

export function groupChecklistItemsBySlug(
  items: ChecklistItem[],
): Record<string, ChecklistItem[]> {
  const grouped: Record<string, ChecklistItem[]> = {};
  for (const item of items) {
    const group = grouped[item.checklistSlug] ?? [];
    group.push(item);
    grouped[item.checklistSlug] = group;
  }
  for (const group of Object.values(grouped)) {
    group.sort(sortChecklistItems);
  }
  return grouped;
}

/**
 * Retire les articles « Co-parent » quand l'utilisateur a répondu « Seul·e »
 * à l'étape 1 de l'onboarding (`households.accompaniment_type === 'seul'`)
 * — demande explicite. Les autres catégories ne sont jamais filtrées.
 */
export function filterVisibleChecklistItems(
  items: ChecklistItem[],
  { hideCoParent }: { hideCoParent: boolean },
): ChecklistItem[] {
  return hideCoParent
    ? items.filter((item) => item.category !== 'co_parent')
    : items;
}

/**
 * Groupe par catégorie (Maman / Bébé / Co-parent) ; vide pour une liste
 * plate. Une sous-section vide reste affichée si elle accepte des ajouts —
 * sinon la ligne « Ajouter un élément » disparaîtrait avec elle.
 */
export function groupChecklistItemsByCategory(
  items: ChecklistItem[],
  slug: string,
): { category: string; items: ChecklistItem[] }[] {
  return CHECKLIST_CATEGORY_ORDER.map((category) => ({
    category,
    items: items
      .filter((item) => item.category === category)
      .sort(sortChecklistItems),
  })).filter(
    (group) => group.items.length > 0 || canAddCustomItem(slug, group.category),
  );
}

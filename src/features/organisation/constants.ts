import type { ChecklistItem } from './api';

/**
 * ⚠️ Contenu inventé : ni les maquettes ni CONCEPT.md ne décrivent cette
 * section — demande explicite de l'utilisateur, sans liste d'affaires
 * fournie. Les deux listes reprennent des essentiels usuels (valise de
 * maternité / sac pour la salle d'accouchement), à ajuster si besoin.
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
    title: 'Le sac en salle d’accouchement',
    emoji: '🎒',
    bg: '#FBE4D8',
  },
};

/** Ordre d'affichage des 2 blocs. */
export const CHECKLIST_ORDER = ['valise-maternite', 'sac-naissance'];

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
    group.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return grouped;
}

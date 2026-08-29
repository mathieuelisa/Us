-- Articles personnalisés des checklists de valises (demande explicite :
-- pouvoir ajouter ses propres affaires en fin de sous-section).
--
-- Table à part plutôt que `checklist_item_template_id` rendu nullable dans
-- `household_checklist_items` : le catalogue partagé
-- (`checklist_item_templates`) reste en lecture seule et auto-seedé par
-- trigger, tandis que ces lignes-ci sont les seules que le client insère.
-- Ça évite aussi d'ouvrir une policy INSERT sur une table dont l'invariant
-- est justement de n'être écrite que par le trigger.
--
-- `category` et `checklist_slug` sont dupliqués ici (au lieu d'être lus sur
-- un template) : un article personnalisé n'a pas de template, il porte donc
-- son propre rangement.

create table public.household_custom_checklist_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  checklist_slug text not null check (checklist_slug in ('valise-maternite', 'sac-naissance')),
  category text check (category in ('maman', 'bebe', 'co_parent')),
  label text not null check (char_length(btrim(label)) between 1 and 120),
  sort_order int not null default 0,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index household_custom_checklist_items_household_slug_idx
  on public.household_custom_checklist_items (household_id, checklist_slug);

alter table public.household_custom_checklist_items enable row level security;

-- Les deux parents voient et modifient les mêmes listes, comme pour les
-- articles du catalogue : aucune règle de visibilité par rôle ici.
create policy "household_custom_checklist_items_select_members"
  on public.household_custom_checklist_items for select
  using (public.is_household_member(household_id));

create policy "household_custom_checklist_items_insert_members"
  on public.household_custom_checklist_items for insert
  with check (public.is_household_member(household_id));

create policy "household_custom_checklist_items_update_members"
  on public.household_custom_checklist_items for update
  using (public.is_household_member(household_id));

create policy "household_custom_checklist_items_delete_members"
  on public.household_custom_checklist_items for delete
  using (public.is_household_member(household_id));

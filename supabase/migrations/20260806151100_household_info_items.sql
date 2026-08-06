-- Household info items: the "Information" tab — shared, reorderable list of
-- important facts (blood types, allergies, midwife contact, etc.). Modeled
-- as a free-form list rather than fixed columns so it supports the
-- drag-and-drop reordering from CONCEPT.md without a future migration.

create table public.household_info_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  label text not null,
  value text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.household_info_items enable row level security;

create policy "household_info_items_all_members"
  on public.household_info_items for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

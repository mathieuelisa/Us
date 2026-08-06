-- Contacts: shared address book (midwife, OB/GYN, maternity, emergency
-- number...), fully editable by both parents, manually reorderable.

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  role_label text,
  address text,
  phone text,
  is_emergency boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "contacts_all_members"
  on public.contacts for all
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

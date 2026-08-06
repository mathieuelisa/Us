-- Households: the single shared data space per couple (CONCEPT.md — "un
-- seul jeu de données par couple, pas une copie par utilisateur"). Exactly
-- two possible members: the pregnant person (creator) and an optional
-- partner, linked directly by column rather than a generic membership table
-- since the structure never exceeds two people.

create table public.households (
  id uuid primary key default gen_random_uuid(),
  pregnant_user_id uuid not null references public.profiles (id) on delete cascade,
  partner_user_id uuid references public.profiles (id) on delete set null,
  accompaniment_type text check (accompaniment_type in ('couple', 'coparentalite', 'seul', 'autre')),
  partner_uses_app boolean not null default true,
  professional_status text,
  region text,
  priorities text[] not null default '{}',
  reminder_frequency text check (reminder_frequency in ('realtime', 'weekly')),
  due_date date,
  is_first_child boolean,
  birth_date date,
  created_at timestamptz not null default now(),
  constraint households_distinct_members check (
    partner_user_id is null or partner_user_id <> pregnant_user_id
  )
);

alter table public.households enable row level security;

-- Helper: is the current user a member (either role) of this household?
create function public.is_household_member(hh_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.households h
    where h.id = hh_id
      and auth.uid() in (h.pregnant_user_id, h.partner_user_id)
  );
$$;

-- Helper: the current user's role within this household, or null.
create function public.household_role(hh_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when h.pregnant_user_id = auth.uid() then 'pregnant'
    when h.partner_user_id = auth.uid() then 'partner'
    else null
  end
  from public.households h
  where h.id = hh_id;
$$;

create policy "households_select_members"
  on public.households for select
  using (public.is_household_member(id));

create policy "households_insert_creator"
  on public.households for insert
  with check (pregnant_user_id = auth.uid());

create policy "households_update_members"
  on public.households for update
  using (public.is_household_member(id));

-- Now that households exists, a user can also see their household
-- partner's profile (needed for greetings, "Avec Paul" sections, etc.).
create policy "profiles_select_household_partner"
  on public.profiles for select
  using (
    exists (
      select 1 from public.households h
      where (h.pregnant_user_id = auth.uid() and h.partner_user_id = profiles.id)
         or (h.partner_user_id = auth.uid() and h.pregnant_user_id = profiles.id)
    )
  );

-- Household invites: tracks the magic-link invite sent from the pregnant
-- parent to the co-parent (CONCEPT.md — "invite l'autre par email
-- automatique ; l'espace devient partagé dès que le second parent clique le
-- lien"). Accepting an invite is handled in application code, which sets
-- households.partner_user_id and updates this row's status.

create table public.household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  invited_email text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

alter table public.household_invites enable row level security;

create policy "household_invites_select_members"
  on public.household_invites for select
  using (public.is_household_member(household_id));

-- Only the pregnant parent sends invites (CONCEPT.md: "le premier parent
-- (la mère) configure l'espace puis invite l'autre").
create policy "household_invites_insert_pregnant"
  on public.household_invites for insert
  with check (public.household_role(household_id) = 'pregnant');

create policy "household_invites_update_members"
  on public.household_invites for update
  using (public.is_household_member(household_id));

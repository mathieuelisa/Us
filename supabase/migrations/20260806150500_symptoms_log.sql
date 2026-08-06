-- Symptoms journal: written only by the pregnant parent, but readable by
-- both (CONCEPT.md — the co-parent gets read-only access via "Mon
-- partenaire" since they have no direct Journal tab). Health data: RLS is
-- deliberately the tightest write policy in this schema.

create table public.symptoms_log (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  symptoms text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (household_id, user_id, log_date)
);

alter table public.symptoms_log enable row level security;

create policy "symptoms_log_select_members"
  on public.symptoms_log for select
  using (public.is_household_member(household_id));

create policy "symptoms_log_insert_pregnant_only"
  on public.symptoms_log for insert
  with check (
    user_id = auth.uid()
    and public.household_role(household_id) = 'pregnant'
  );

create policy "symptoms_log_update_pregnant_only"
  on public.symptoms_log for update
  using (
    user_id = auth.uid()
    and public.household_role(household_id) = 'pregnant'
  );

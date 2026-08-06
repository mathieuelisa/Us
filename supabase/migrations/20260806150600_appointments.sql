-- Appointments: the pregnant parent creates and owns her calendar; each
-- entry can be marked shared/not-shared. The partner's Rendez-vous tab (and
-- the "Mon partenaire" hub block) only ever sees is_shared = true rows.

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  appointment_date date not null,
  appointment_time time,
  address text,
  notes text,
  is_shared boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.appointments enable row level security;

create policy "appointments_select_scoped"
  on public.appointments for select
  using (
    public.household_role(household_id) = 'pregnant'
    or (public.household_role(household_id) = 'partner' and is_shared = true)
  );

create policy "appointments_insert_pregnant_only"
  on public.appointments for insert
  with check (
    created_by = auth.uid()
    and public.household_role(household_id) = 'pregnant'
  );

create policy "appointments_update_pregnant_only"
  on public.appointments for update
  using (public.household_role(household_id) = 'pregnant');

create policy "appointments_delete_pregnant_only"
  on public.appointments for delete
  using (public.household_role(household_id) = 'pregnant');

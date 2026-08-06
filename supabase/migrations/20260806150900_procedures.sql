-- Procedure templates: the fixed V1 catalog of 6 French administrative
-- procedures (CONCEPT.md — "Pour une V1, 6 démarches administratives").
-- household_procedures tracks per-household status against that catalog;
-- rows are auto-created (via trigger) whenever a household is created, so
-- clients never need INSERT rights on household_procedures.

create table public.procedure_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  deadline_days_after_birth int,
  documents text[] not null default '{}',
  official_link text,
  sort_order int not null default 0
);

alter table public.procedure_templates enable row level security;

create policy "procedure_templates_select_all"
  on public.procedure_templates for select
  using (true);

insert into public.procedure_templates (slug, title, description, deadline_days_after_birth, documents, sort_order) values
  ('declaration-naissance', 'Déclaration de naissance', 'À faire à la mairie du lieu de naissance de l''enfant.', 5,
    array['Carte d''identité (CNI)', 'Livret de famille (si existant)', 'Justificatif de domicile', 'Certificat d''accouchement'], 1),
  ('caf', 'CAF', 'Prime et allocations.', null, '{}', 2),
  ('securite-sociale', 'Sécurité sociale', 'Rattachement du bébé.', null, '{}', 3),
  ('mutuelle', 'Mutuelle', 'Ajout de l''enfant.', null, '{}', 4),
  ('conge-employeur', 'Congé employeur', 'À planifier avec l''employeur.', null, '{}', 5),
  ('mode-de-garde', 'Mode de garde', 'Anticipation du mode de garde.', null, '{}', 6);

create table public.household_procedures (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  procedure_template_id uuid not null references public.procedure_templates (id) on delete cascade,
  status text not null default 'a_faire' check (status in ('a_faire', 'en_cours', 'fait')),
  reminder_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (household_id, procedure_template_id)
);

alter table public.household_procedures enable row level security;

create policy "household_procedures_select_members"
  on public.household_procedures for select
  using (public.is_household_member(household_id));

create policy "household_procedures_update_members"
  on public.household_procedures for update
  using (public.is_household_member(household_id));

-- Auto-seed the 6 procedures for every new household. Deadlines are not
-- stored here — compute deadline_days_after_birth + households.birth_date
-- at query time, since birth_date is the single source of truth.
create function public.create_default_household_procedures()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_procedures (household_id, procedure_template_id)
  select new.id, pt.id from public.procedure_templates pt;
  return new;
end;
$$;

create trigger on_household_created
  after insert on public.households
  for each row execute function public.create_default_household_procedures();

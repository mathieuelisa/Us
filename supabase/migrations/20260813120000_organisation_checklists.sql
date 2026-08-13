-- Organisation & Préparation : listes à cocher "La Valise de maternité" et
-- "Le sac en salle d'accouchement" — fonctionnalité entièrement nouvelle,
-- ni les maquettes ni CONCEPT.md ne la décrivent, ajoutée sur demande
-- explicite. Même schéma que procedure_templates / household_procedures :
-- catalogue partagé (checklist_item_templates) + statut coché par foyer
-- (household_checklist_items), auto-seedé par trigger à la création du
-- foyer, clients jamais en INSERT.

create table public.checklist_item_templates (
  id uuid primary key default gen_random_uuid(),
  checklist_slug text not null check (checklist_slug in ('valise-maternite', 'sac-naissance')),
  label text not null,
  sort_order int not null default 0
);

alter table public.checklist_item_templates enable row level security;

create policy "checklist_item_templates_select_all"
  on public.checklist_item_templates for select
  using (true);

insert into public.checklist_item_templates (checklist_slug, label, sort_order) values
  ('valise-maternite', 'Pyjamas et vêtements confortables', 1),
  ('valise-maternite', 'Sous-vêtements et culottes filet/jetables', 2),
  ('valise-maternite', 'Trousse de toilette', 3),
  ('valise-maternite', 'Soutiens-gorge d''allaitement', 4),
  ('valise-maternite', 'Coussinets d''allaitement', 5),
  ('valise-maternite', 'Chaussons ou chaussettes chaudes', 6),
  ('valise-maternite', 'Chargeur de téléphone', 7),
  ('valise-maternite', 'Carte d''identité et carte vitale', 8),
  ('valise-maternite', 'Dossier de maternité', 9),
  ('valise-maternite', 'Bodys et pyjamas pour bébé (plusieurs tailles)', 10),
  ('valise-maternite', 'Turbulette ou couverture', 11),
  ('valise-maternite', 'Bonnet et moufles pour bébé', 12),
  ('valise-maternite', 'Couches nouveau-né', 13),
  ('valise-maternite', 'Tenue de sortie pour bébé', 14),
  ('valise-maternite', 'Siège auto installé dans la voiture', 15),
  ('sac-naissance', 'Tenue confortable pour le travail', 1),
  ('sac-naissance', 'Chaussettes chaudes', 2),
  ('sac-naissance', 'Brumisateur ou huile de massage', 3),
  ('sac-naissance', 'Musique ou playlist de relaxation', 4),
  ('sac-naissance', 'Bouteille d''eau et en-cas', 5),
  ('sac-naissance', 'Coussin d''allaitement', 6),
  ('sac-naissance', 'Appareil photo ou téléphone chargé', 7),
  ('sac-naissance', 'Serviette de toilette', 8),
  ('sac-naissance', 'Body pour le peau à peau', 9),
  ('sac-naissance', 'Liste des personnes à prévenir', 10);

create table public.household_checklist_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  checklist_item_template_id uuid not null references public.checklist_item_templates (id) on delete cascade,
  checked boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (household_id, checklist_item_template_id)
);

alter table public.household_checklist_items enable row level security;

create policy "household_checklist_items_select_members"
  on public.household_checklist_items for select
  using (public.is_household_member(household_id));

create policy "household_checklist_items_update_members"
  on public.household_checklist_items for update
  using (public.is_household_member(household_id));

create function public.create_default_household_checklist_items()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.household_checklist_items (household_id, checklist_item_template_id)
  select new.id, cit.id from public.checklist_item_templates cit;
  return new;
end;
$$;

create trigger on_household_created_checklist_items
  after insert on public.households
  for each row execute function public.create_default_household_checklist_items();

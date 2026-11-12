-- « Le match des prénoms » (demande explicite du 2026-11-12) : chaque parent
-- swipe des prénoms de son côté ; un prénom gardé par les deux devient un
-- « match ». Le catalogue des prénoms reste côté client
-- (`features/names/catalog.ts`) : seuls les choix sont en base.
--
-- Deux tables, parce que les règles de visibilité diffèrent (choix
-- explicites) :
--
-- 1. `name_swipes` — un choix par parent et par prénom (`liked` : gardé à
--    droite, écarté à gauche). Lisible par **les deux** membres du foyer :
--    les matchs se calculent en croisant les prénoms gardés de chacun.
--    Écriture : uniquement ses propres choix.
-- 2. `name_favorites` — favoris **personnels** (carte touchée). Visibles et
--    modifiables par leur seul auteur, même au sein du foyer.
--
-- Le prénom est la clé du choix, pas le pays : « Lina » vue côté France ou
-- côté Maroc est le même prénom (unicité par foyer, parent, genre, prénom).
--
-- Module premium côté produit, mais le paiement est hors MVP : pas de
-- filtre sur un droit premium qui n'existe pas encore (cf. dette n°53).

create table public.name_swipes (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade
    default auth.uid(),
  gender text not null check (gender in ('girl', 'boy')),
  name text not null check (char_length(name) between 1 and 60),
  liked boolean not null,
  created_at timestamptz not null default now(),
  unique (household_id, user_id, gender, name)
);

create index name_swipes_user_idx on public.name_swipes (user_id);

alter table public.name_swipes enable row level security;

create policy "name_swipes_select_members"
  on public.name_swipes for select
  to authenticated
  using (public.is_household_member(household_id));

create policy "name_swipes_insert_own"
  on public.name_swipes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.is_household_member(household_id)
  );

create policy "name_swipes_update_own"
  on public.name_swipes for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and public.is_household_member(household_id)
  );

create policy "name_swipes_delete_own"
  on public.name_swipes for delete
  to authenticated
  using (user_id = (select auth.uid()));

create table public.name_favorites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade
    default auth.uid(),
  gender text not null check (gender in ('girl', 'boy')),
  name text not null check (char_length(name) between 1 and 60),
  created_at timestamptz not null default now(),
  unique (household_id, user_id, gender, name)
);

create index name_favorites_user_idx on public.name_favorites (user_id);

alter table public.name_favorites enable row level security;

create policy "name_favorites_select_own"
  on public.name_favorites for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "name_favorites_insert_own"
  on public.name_favorites for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.is_household_member(household_id)
  );

create policy "name_favorites_delete_own"
  on public.name_favorites for delete
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.name_swipes from anon;
revoke all on public.name_favorites from anon;

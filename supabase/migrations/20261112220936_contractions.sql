-- Assistant contractions & départ maternité (demande explicite du
-- 2026-11-12) : chronométrer les contractions pendant le travail et
-- signaler quand il est temps de partir à la maternité.
--
-- Deux tables :
--   - `contraction_sessions` : un suivi, de la première contraction notée
--     jusqu'à « Terminer le suivi ». Un seul suivi ouvert par foyer à la
--     fois (index unique partiel), pour que les deux téléphones écrivent
--     dans le même ;
--   - `contractions` : une contraction (début, fin). `ended_at` nul =
--     contraction en cours ; une seule en cours par suivi (index unique
--     partiel). Durée = fin − début, intervalle = début − début précédent :
--     tout se calcule côté client, rien n'est dénormalisé.
--   Le foyer est recopié sur chaque contraction (clé étrangère composite
--   vers le suivi) : les policies restent de simples tests d'appartenance
--   au foyer, sans jointure, et une contraction ne peut pas pointer vers le
--   suivi d'un autre foyer.
--
-- Données de santé de la grossesse — RLS revue explicitement (CLAUDE.md) :
--   - lire / créer / modifier / supprimer : membre du foyer seulement, les
--     deux parents (choix explicite : stockage partagé, la mère ou le
--     partenaire chronomètre) ;
--   - `created_by` = l'appelant à la création ;
--   - modification limitée aux colonnes de fin (`ended_at`) : on ne
--     réécrit ni le foyer, ni l'auteur, ni le début (droits par colonne) ;
--   - suppression : pour corriger un appui de trop ou effacer un suivi.
--   Aucun accès `anon`.
--
-- Fonctionnalité premium côté produit, paiement hors MVP : comme
-- `baby_entries`, la base ne filtre pas encore sur `has_premium()`.

create table public.contraction_sessions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null
    default auth.uid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint contraction_sessions_end_after_start
    check (ended_at is null or ended_at >= started_at),
  -- Cible de la clé étrangère composite de `contractions`.
  constraint contraction_sessions_id_household_key unique (id, household_id)
);

-- Un seul suivi ouvert par foyer.
create unique index contraction_sessions_one_open_per_household
  on public.contraction_sessions (household_id)
  where ended_at is null;

-- Requête de l'écran : le dernier suivi du foyer.
create index contraction_sessions_household_started_idx
  on public.contraction_sessions (household_id, started_at desc);

create index contraction_sessions_created_by_idx
  on public.contraction_sessions (created_by);

create table public.contractions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  household_id uuid not null,
  created_by uuid references public.profiles (id) on delete set null
    default auth.uid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint contractions_session_fkey
    foreign key (session_id, household_id)
    references public.contraction_sessions (id, household_id)
    on delete cascade,
  constraint contractions_end_after_start
    check (ended_at is null or ended_at >= started_at)
);

-- Une seule contraction en cours par suivi.
create unique index contractions_one_open_per_session
  on public.contractions (session_id)
  where ended_at is null;

-- Contractions d'un suivi, dans l'ordre (et clé étrangère indexée).
create index contractions_session_started_idx
  on public.contractions (session_id, started_at);

create index contractions_household_idx
  on public.contractions (household_id);

create index contractions_created_by_idx
  on public.contractions (created_by);

alter table public.contraction_sessions enable row level security;
alter table public.contractions enable row level security;

create policy "contraction_sessions_select_members"
  on public.contraction_sessions for select
  to authenticated
  using (public.is_household_member(household_id));

create policy "contraction_sessions_insert_members"
  on public.contraction_sessions for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and public.is_household_member(household_id)
  );

create policy "contraction_sessions_update_members"
  on public.contraction_sessions for update
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "contraction_sessions_delete_members"
  on public.contraction_sessions for delete
  to authenticated
  using (public.is_household_member(household_id));

create policy "contractions_select_members"
  on public.contractions for select
  to authenticated
  using (public.is_household_member(household_id));

create policy "contractions_insert_members"
  on public.contractions for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and public.is_household_member(household_id)
  );

create policy "contractions_update_members"
  on public.contractions for update
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "contractions_delete_members"
  on public.contractions for delete
  to authenticated
  using (public.is_household_member(household_id));

-- Seule la fin se renseigne après coup.
revoke update on public.contraction_sessions from authenticated;
grant update (ended_at) on public.contraction_sessions to authenticated;
revoke update on public.contractions from authenticated;
grant update (ended_at) on public.contractions to authenticated;

revoke all on public.contraction_sessions from anon;
revoke all on public.contractions from anon;

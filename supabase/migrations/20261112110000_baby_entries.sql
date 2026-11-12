-- Suivi « Votre bébé » enregistré en base (demande explicite) : croissance,
-- biberons, allaitement, bain & soins. Jusqu'ici les entrées vivaient dans
-- l'état de l'écran et disparaissaient au redémarrage de l'app.
--
-- Une seule table pour les 4 modules, comme côté client (`BABY_MODULES`
-- décrit ce que chacun saisit) :
--   - `module`    : croissance | biberon | allaitement | bain ;
--   - `segment`   : option de tête (« Lait maternel », « Sein gauche »…) ;
--   - `measures`  : valeurs chiffrées par clé (`weight`, `height`,
--                   `quantity`, `duration`…), gardées en texte telles que
--                   saisies (« 5.690 ») — le client les affiche à la
--                   française. Une colonne par mesure figerait le schéma à
--                   chaque nouveau champ de formulaire.
--   Nom `measures` plutôt que `values`, mot réservé SQL.
--
-- Données de santé de l'enfant — RLS revue explicitement (CLAUDE.md) :
--   - lire / créer / modifier / supprimer : membre du foyer seulement ;
--   - les deux parents corrigent toutes les entrées, y compris celles
--     saisies par l'autre (choix explicite du 2026-11-12 : journal partagé,
--     un biberon noté par le co-parent doit pouvoir être corrigé par la
--     personne qui a accouché, et inversement) ;
--   - `created_by` = l'appelant à la création ; une modification ne peut ni
--     changer de foyer (WITH CHECK) ni réattribuer l'auteur (colonne non
--     modifiable, cf. `revoke update` plus bas).
--   Aucun accès `anon` (pas de policy, et `is_household_member` n'est pas
--   exécutable par `anon`).
--
-- Le module est premium côté produit, mais le paiement est hors MVP : la
-- base ne filtre pas sur un abonnement qui n'existe pas encore.

create table public.baby_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  -- `set null` : la suppression du compte d'un parent ne doit pas effacer
  -- l'historique du bébé, qui appartient au foyer.
  created_by uuid references public.profiles (id) on delete set null
    default auth.uid(),
  module text not null
    check (module in ('croissance', 'biberon', 'allaitement', 'bain')),
  entry_date date not null,
  entry_time time,
  segment text check (char_length(segment) between 1 and 60),
  measures jsonb not null default '{}'::jsonb
    check (jsonb_typeof(measures) = 'object'),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Requête unique de l'écran : un module d'un foyer, du plus récent au plus
-- ancien.
create index baby_entries_household_module_date_idx
  on public.baby_entries (household_id, module, entry_date desc, entry_time desc);

-- Clé étrangère indexée (suppression d'un profil → `set null`).
create index baby_entries_created_by_idx
  on public.baby_entries (created_by);

alter table public.baby_entries enable row level security;

create policy "baby_entries_select_members"
  on public.baby_entries for select
  to authenticated
  using (public.is_household_member(household_id));

create policy "baby_entries_insert_members"
  on public.baby_entries for insert
  to authenticated
  with check (
    created_by = (select auth.uid())
    and public.is_household_member(household_id)
  );

create policy "baby_entries_update_members"
  on public.baby_entries for update
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

create policy "baby_entries_delete_members"
  on public.baby_entries for delete
  to authenticated
  using (public.is_household_member(household_id));

-- L'auteur et le foyer d'une entrée ne se réécrivent pas : seules les
-- colonnes saisies dans le formulaire restent modifiables.
revoke update on public.baby_entries from authenticated;
grant update (entry_date, entry_time, segment, measures, comment, updated_at)
  on public.baby_entries to authenticated;
revoke all on public.baby_entries from anon;

-- Vaccins de bébé (demande explicite du 2026-11-15) : 6e module de « Votre
-- bébé », saisie libre (aucun calendrier vaccinal dans l'app, choix
-- explicite : pas de contenu médical à valider). Policies inchangées
-- (membres du foyer + premium, RLS revue dans `premium_rls`).
--   entry_date : date du vaccin (fait) ou date prévue (à faire) ;
--   segment    : « Fait » ou « À faire » ;
--   measures   : `name` (nom du vaccin), `boosterDate` (prochain rappel,
--                AAAA-MM-JJ), `doctor`, `lot`.
alter table public.baby_entries drop constraint baby_entries_module_check;
alter table public.baby_entries add constraint baby_entries_module_check
  check (module in ('croissance', 'biberon', 'allaitement', 'bain', 'sommeil', 'vaccin'));

-- Rappels de vaccins sur le téléphone (7 jours avant et le jour J, 9h),
-- coupables dans Réglages, pour chacun des deux parents.
alter table public.profiles
  add column if not exists notify_vaccines boolean not null default true;

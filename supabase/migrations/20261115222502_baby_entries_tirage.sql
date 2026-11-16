-- Tirage de lait (demande explicite du 2026-11-15) : 7e module de « Votre
-- bébé », dans la même table que les 6 autres. Policies inchangées (membres
-- du foyer + premium, RLS revue dans `premium_rls`) : elles ne filtrent pas
-- sur `module`, un tirage est lu et corrigé par les deux parents comme un
-- biberon.
--   entry_date / entry_time : moment du tirage ;
--   segment                 : aucun ;
--   measures                : `quantity` (ml, texte tel que saisi).
alter table public.baby_entries drop constraint baby_entries_module_check;
alter table public.baby_entries add constraint baby_entries_module_check
  check (module in ('croissance', 'biberon', 'allaitement', 'bain', 'sommeil', 'vaccin', 'tirage'));

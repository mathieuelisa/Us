-- Suivi du sommeil de bébé (demande explicite du 2026-11-15) : 5e module de
-- « Votre bébé », dans la même table que les 4 autres. Policies inchangées
-- (membres du foyer + premium, RLS revue dans `premium_rls`).
--   entry_date / entry_time : coucher ;
--   segment                 : « Sieste » ou « Nuit » ;
--   measures                : `wakeTime` (HH:MM, absent tant que bébé dort),
--                             `duration` (secondes, calculée), `wakeups`.
alter table public.baby_entries drop constraint baby_entries_module_check;
alter table public.baby_entries add constraint baby_entries_module_check
  check (module in ('croissance', 'biberon', 'allaitement', 'bain', 'sommeil'));

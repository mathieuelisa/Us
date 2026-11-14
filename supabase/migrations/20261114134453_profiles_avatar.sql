-- Avatar du profil (demande explicite du 2026-11-14) : choisi dans une
-- modale de la page Profil parmi quelques avatars simples, à la place de
-- l'initiale. `null` = l'initiale du prénom, comme avant.
--
-- Clé d'avatar plutôt qu'URL : les visuels vivent dans l'app
-- (`PROFILE_AVATARS`), la base n'en garde que le nom, limité aux valeurs
-- connues. Aucune règle d'accès nouvelle : `profiles_update_own` ne laisse
-- déjà chacun modifier que son propre profil, et le partenaire du foyer
-- le lit via `profiles_select_household_partner`.

alter table public.profiles
  add column if not exists avatar text
    check (avatar in ('ourson', 'lapin', 'renard', 'panda', 'koala', 'lion'));

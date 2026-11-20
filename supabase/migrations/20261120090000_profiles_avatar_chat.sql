-- Avatar « chat » (demande explicite du 2026-11-20) : les avatars passent
-- aux illustrations fournies, avec un chat en plus des six animaux
-- existants. Seule la liste des valeurs autorisées change ; aucune règle
-- d'accès nouvelle (`profiles_update_own` limite toujours chacun à son
-- propre profil).

alter table public.profiles
  drop constraint if exists profiles_avatar_check;

alter table public.profiles
  add constraint profiles_avatar_check
    check (avatar in ('ourson', 'lapin', 'renard', 'panda', 'koala', 'lion', 'chat'));

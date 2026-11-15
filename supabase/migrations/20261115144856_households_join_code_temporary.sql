-- Code d'espace **temporaire et à usage unique** (demande explicite du
-- 2026-11-15 : « un code secure temporaire »), à la place du code fixe de
-- `households_join_code`.
--
-- - Un code n'est valable qu'avec une date d'expiration
--   (`join_code_expires_at`). `create_household_join_code()` le crée quand
--   la personne enceinte ouvre « Ajouter votre partenaire », valable
--   30 minutes. Rouvrir la modale reprend le code en cours s'il lui reste
--   plus de 5 minutes, sinon en crée un nouveau, qui remplace l'ancien.
-- - Les codes fixes déjà générés n'ont pas d'expiration : ils ne valent
--   plus rien, sans qu'il faille les effacer.
-- - `join_household_by_code` refuse un code expiré (`expired_code`) et, une
--   fois le code utilisé, le remplace par un nouveau code sans expiration
--   (donc inutilisable) : il ne sert qu'une fois.
-- - Fenêtre de 30 min sur 31^6 combinaisons tirées par pgcrypto : deviner
--   un code devient irréaliste.
--
-- Seule la personne enceinte du foyer crée un code, et seulement tant que
-- la place de partenaire est libre et que le foyer n'est pas « Seul·e ».

alter table public.households
  add column if not exists join_code_expires_at timestamptz;

create or replace function public.create_household_join_code()
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_household public.households;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_household
    from public.households
   where pregnant_user_id = v_uid
   for update;

  if v_household.id is null then
    raise exception 'no_household';
  end if;

  if v_household.accompaniment_type = 'seul' then
    raise exception 'household_solo';
  end if;

  if v_household.partner_user_id is not null then
    raise exception 'household_full';
  end if;

  -- Code en cours encore valable assez longtemps : on le reprend.
  if v_household.join_code_expires_at > now() + interval '5 minutes' then
    return query select v_household.join_code, v_household.join_code_expires_at;
    return;
  end if;

  update public.households
     set join_code = public.generate_household_join_code(),
         join_code_expires_at = now() + interval '30 minutes'
   where id = v_household.id
  returning households.join_code, households.join_code_expires_at
    into code, expires_at;

  return next;
end;
$$;

revoke execute on function public.create_household_join_code()
  from public, anon;
grant execute on function public.create_household_join_code()
  to authenticated;

create or replace function public.join_household_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_household public.households;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if exists (
    select 1 from public.households
     where pregnant_user_id = v_uid or partner_user_id = v_uid
  ) then
    raise exception 'already_in_household';
  end if;

  select * into v_household
    from public.households
   where join_code = v_code
   for update;

  if v_household.id is null then
    raise exception 'invalid_code';
  end if;

  if v_household.join_code_expires_at is null
     or v_household.join_code_expires_at <= now() then
    raise exception 'expired_code';
  end if;

  if v_household.accompaniment_type = 'seul' then
    raise exception 'household_solo';
  end if;

  if v_household.partner_user_id is not null then
    raise exception 'household_full';
  end if;

  -- Usage unique : un nouveau code sans expiration remplace celui-ci.
  update public.households
     set partner_user_id = v_uid,
         join_code = public.generate_household_join_code(),
         join_code_expires_at = null
   where id = v_household.id
     and partner_user_id is null;

  return v_household.id;
end;
$$;

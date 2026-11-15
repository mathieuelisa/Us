-- Rejoindre un espace avec un code (demande explicite du 2026-11-15) : la
-- personne enceinte partage un code de 6 caractères (ou son QR code) ; le
-- ou la partenaire, qui a choisi « Je suis le ou la partenaire » à
-- l'inscription, le saisit ou le scanne pour rejoindre l'espace. Complète
-- l'invitation par email (`accept_household_invite`), cachée dans
-- l'onboarding, sans dépendre d'une adresse exacte.
--
-- Sécurité (le code ouvre l'accès aux données de santé du foyer) :
--   - code tiré au hasard (pgcrypto) dans un alphabet sans caractères
--     ambigus (pas de 0/O, 1/I/L) : 31^6 ≈ 887 millions de combinaisons ;
--   - `join_household_by_code` est la seule porte d'entrée, en `security
--     definer` parce que l'appelant ne voit pas encore le foyer (RLS) ; elle
--     ne rattache que l'appelant lui-même, comme partenaire, et refuse si :
--     il appartient déjà à un foyer, le code est inconnu, la place de
--     partenaire est prise, ou le foyer est « Seul·e » ;
--   - aucun accès `anon` ; le code n'est lisible que par les membres du
--     foyer (policies existantes de `households`).

create or replace function public.generate_household_join_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_code text;
begin
  loop
    v_bytes := extensions.gen_random_bytes(6);
    v_code := '';
    for i in 0..5 loop
      v_code := v_code
        || substr(v_alphabet, 1 + (get_byte(v_bytes, i) % length(v_alphabet)), 1);
    end loop;
    -- Sous RLS, l'appelant ne voit que son foyer : la contrainte `unique`
    -- reste le vrai garde-fou contre une collision (improbable).
    exit when not exists (
      select 1 from public.households where join_code = v_code
    );
  end loop;
  return v_code;
end;
$$;

alter table public.households
  add column if not exists join_code text;

update public.households
   set join_code = public.generate_household_join_code()
 where join_code is null;

alter table public.households
  alter column join_code set default public.generate_household_join_code(),
  alter column join_code set not null,
  add constraint households_join_code_key unique (join_code);

revoke execute on function public.generate_household_join_code() from public, anon;
grant execute on function public.generate_household_join_code() to authenticated;

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

  if v_household.accompaniment_type = 'seul' then
    raise exception 'household_solo';
  end if;

  if v_household.partner_user_id is not null then
    raise exception 'household_full';
  end if;

  update public.households
     set partner_user_id = v_uid
   where id = v_household.id
     and partner_user_id is null;

  return v_household.id;
end;
$$;

revoke execute on function public.join_household_by_code(text) from public, anon;
grant execute on function public.join_household_by_code(text) to authenticated;

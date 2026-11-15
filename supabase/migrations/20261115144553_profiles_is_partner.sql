-- Rôle annoncé à l'inscription, porté par le profil (demande explicite du
-- 2026-11-15) : `is_partner` = inscrit comme « partenaire » (il ou elle
-- rejoint l'espace de l'autre parent avec un code) plutôt que comme la
-- personne qui attend le bébé (elle crée l'espace).
--
-- Sert à l'aiguillage de l'app (onboarding ou « Rejoindre l'espace »),
-- **jamais à une autorisation** : le rôle réel dans un foyer reste
-- `household_role()`. Chacun peut donc le modifier sur son propre profil
-- (`profiles_update_own`), par exemple « Je crée mon espace » depuis
-- l'écran Rejoindre.
--
-- 1. Colonne, et rattrapage des partenaires déjà rattachés à un foyer.
-- 2. À la création du compte, `handle_new_user` lit le choix de
--    l'inscription (`raw_user_meta_data.signup_role`).
-- 3. Devenir partenaire d'un foyer (code d'espace ou invitation email) le
--    passe à `true`, par déclencheur — quelle que soit la porte d'entrée.

alter table public.profiles
  add column if not exists is_partner boolean not null default false;

update public.profiles p
   set is_partner = true
 where exists (
   select 1 from public.households h where h.partner_user_id = p.id
 );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_partner)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'signup_role', '') = 'partner'
  );
  return new;
end;
$$;

create or replace function public.mark_household_partner_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.partner_user_id is not null
     and new.partner_user_id is distinct from old.partner_user_id then
    update public.profiles
       set is_partner = true
     where id = new.partner_user_id;
  end if;
  return new;
end;
$$;

revoke execute on function public.mark_household_partner_profile()
  from public, anon, authenticated;

create trigger on_household_partner_joined
  after update of partner_user_id on public.households
  for each row execute function public.mark_household_partner_profile();

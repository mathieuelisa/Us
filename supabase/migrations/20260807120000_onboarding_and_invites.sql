-- Phase 1.2 — onboarding + mise en place de l'espace partagé.
--
-- Trois manques du schéma initial, révélés en implémentant le parcours :
--
-- 1. Le prénom du co-parent est saisi par le premier parent pendant
--    l'onboarding, donc AVANT que le co-parent ait un compte (et donc une
--    ligne `profiles`). Il n'avait nulle part où vivre : on l'ajoute sur
--    `households`. Une fois le co-parent inscrit, `profiles.first_name`
--    fait foi — cette colonne sert de valeur d'attente / de repli.
-- 2. Rien n'empêchait un même utilisateur de créer plusieurs foyers (double
--    soumission de l'onboarding, retry réseau…). D'où les index uniques.
-- 3. Le co-parent invité ne peut PAS accepter son invitation avec les
--    policies existantes : au moment où il clique le lien, il n'est pas
--    encore membre du foyer, donc `is_household_member()` est faux — il ne
--    voit pas son invitation et ne peut pas se rattacher. D'où la fonction
--    `security definer` ci-dessous, qui est la seule porte d'entrée.

alter table public.households
  add column partner_first_name text;

-- Un utilisateur n'est le parent porteur que d'un seul foyer, et n'est le
-- co-parent que d'un seul foyer (NULL reste autorisé plusieurs fois).
create unique index households_one_per_pregnant_user
  on public.households (pregnant_user_id);

create unique index households_one_per_partner_user
  on public.households (partner_user_id)
  where partner_user_id is not null;

-- Rattache le co-parent connecté au foyer qui l'a invité.
--
-- `security definer` est indispensable ici (l'appelant n'est membre de rien
-- au moment de l'appel), mais le périmètre reste étroit : on ne matche que
-- sur l'email vérifié du JWT de l'appelant — il n'y a aucun paramètre
-- d'entrée, donc rien à falsifier côté client. Les garde-fous :
--   - l'invitation doit être `pending`
--   - le foyer ne doit pas déjà avoir un co-parent (pas de vol de place)
--   - on ne peut pas rejoindre son propre foyer
create function public.accept_household_invite()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_invite public.household_invites;
begin
  v_email := lower(auth.jwt() ->> 'email');
  if v_email is null then
    return null;
  end if;

  select hi.* into v_invite
  from public.household_invites hi
  join public.households h on h.id = hi.household_id
  where lower(hi.invited_email) = v_email
    and hi.status = 'pending'
    and h.partner_user_id is null
    and h.pregnant_user_id <> auth.uid()
  order by hi.created_at desc
  limit 1;

  if v_invite.id is null then
    return null;
  end if;

  update public.households
     set partner_user_id = auth.uid()
   where id = v_invite.household_id
     and partner_user_id is null;

  -- Si la place a été prise entre le select et l'update, on n'acte pas
  -- l'invitation comme acceptée.
  if not found then
    return null;
  end if;

  update public.household_invites
     set status = 'accepted', accepted_at = now()
   where id = v_invite.id;

  return v_invite.household_id;
end;
$$;

revoke execute on function public.accept_household_invite() from public, anon;
grant execute on function public.accept_household_invite() to authenticated;

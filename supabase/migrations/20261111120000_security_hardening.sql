-- Durcissement des fonctions SECURITY DEFINER (linter de sécurité Supabase,
-- avertissements 0028/0029 — dette n°50) et du rattachement du co-parent.
--
-- 1. Les fonctions de trigger n'ont pas à être appelables via l'API
--    (/rest/v1/rpc/…) : un trigger s'exécute sans que le rôle appelant ait
--    le droit EXECUTE sur sa fonction.
-- 2. Les fonctions utilisées par les policies RLS restent exécutables par
--    `authenticated` (les policies sont évaluées avec les droits de
--    l'appelant), mais plus par `anon` : une requête anonyme sur une table
--    protégée échoue désormais au lieu de renvoyer une liste vide — l'app
--    n'interroge jamais ces tables sans session.
-- 3. `accept_household_invite()` exige maintenant un email **confirmé** :
--    avec la connexion par mot de passe, n'importe qui pourrait s'inscrire
--    avec l'adresse invitée sans la posséder, et rejoindre le foyer — donc
--    lire ses données de santé. Le lien magique garantissait la possession
--    de l'adresse ; un mot de passe, non.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.create_default_household_procedures() from public, anon, authenticated;
revoke execute on function public.create_default_household_checklist_items() from public, anon, authenticated;

revoke execute on function public.is_household_member(uuid) from public, anon;
grant execute on function public.is_household_member(uuid) to authenticated;

revoke execute on function public.household_role(uuid) from public, anon;
grant execute on function public.household_role(uuid) to authenticated;

create or replace function public.accept_household_invite()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_invite public.household_invites;
begin
  -- L'email doit être confirmé (lien de confirmation cliqué, ou fournisseur
  -- OAuth qui le garantit, comme Google) : c'est la seule preuve que
  -- l'appelant possède bien l'adresse invitée.
  select lower(u.email) into v_email
  from auth.users u
  where u.id = auth.uid()
    and u.email_confirmed_at is not null;

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

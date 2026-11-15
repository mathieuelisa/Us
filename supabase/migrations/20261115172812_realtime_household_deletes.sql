-- Les suppressions ne passent pas par les Postgres Changes filtrés sur
-- household_id (l'ancienne ligne n'a que sa clé primaire sous RLS). Un
-- déclencheur AFTER DELETE envoie donc un Broadcast privé sur le canal
-- « household:<id> », avec le seul nom de la table — rien du contenu
-- supprimé. L'app recharge alors les données du domaine.

create or replace function public.broadcast_household_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object('table', tg_table_name),
    'row_deleted',
    'household:' || old.household_id::text,
    true
  );
  return old;
end;
$$;

revoke execute on function public.broadcast_household_delete() from public, anon, authenticated;

create trigger broadcast_delete after delete on public.mood_checkins
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.symptoms_log
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.appointments
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.contacts
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.household_info_items
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.household_procedures
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.household_checklist_items
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.household_custom_checklist_items
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.baby_entries
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.name_swipes
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.contraction_sessions
  for each row execute function public.broadcast_household_delete();
create trigger broadcast_delete after delete on public.contractions
  for each row execute function public.broadcast_household_delete();

-- Canal privé « household:<id> » : seuls les membres de l'espace peuvent
-- s'y abonner et en recevoir les messages.
create policy household_members_receive_broadcasts
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.messages.extension = 'broadcast'
    and split_part((select realtime.topic()), ':', 1) = 'household'
    and split_part((select realtime.topic()), ':', 2)
      ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    and public.is_household_member(
      split_part((select realtime.topic()), ':', 2)::uuid
    )
  );

-- Notifications push (Lot 5 du plan Supabase, demande explicite) : alertes de
-- l'autre parent envoyées par le serveur, via Expo Push puis Firebase.
-- Les rappels de rendez-vous et de démarches, eux, sont programmés en local
-- sur le téléphone (aucune table ici).

create extension if not exists pg_net with schema extensions;

-- Préférences par personne, modifiables dans Réglages.
alter table public.profiles
  add column if not exists notify_appointments boolean not null default true,
  add column if not exists notify_procedures boolean not null default true,
  add column if not exists notify_partner boolean not null default true;

-- Un token Expo par appareil. Le token est la clé : un téléphone appartient
-- au compte connecté dessus en dernier (register_push_token).
create table public.push_tokens (
  token text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);
create index push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;
create policy push_tokens_select_own on public.push_tokens
  for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.push_tokens to authenticated;
grant all on public.push_tokens to service_role;

create function public.register_push_token(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated';
  end if;
  insert into public.push_tokens (token, user_id, platform, updated_at)
  values (p_token, (select auth.uid()), p_platform, now())
  on conflict (token) do update
    set user_id = excluded.user_id,
        platform = excluded.platform,
        updated_at = now();
end;
$$;
revoke execute on function public.register_push_token(text, text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;

create function public.unregister_push_token(p_token text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.push_tokens
  where token = p_token and user_id = (select auth.uid());
$$;
revoke execute on function public.unregister_push_token(text) from public, anon;
grant execute on function public.unregister_push_token(text) to authenticated;

-- File d'envoi : une ligne par notification, jamais deux fois la même
-- (dedupe_key). Aucune policy : seul le serveur y accède.
create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  dedupe_key text not null unique,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error text
);
create index notification_outbox_user_id_idx on public.notification_outbox (user_id);
alter table public.notification_outbox enable row level security;
grant all on public.notification_outbox to service_role;

-- « lundi 16 nov. à 10h00 », sans dépendre de la locale du serveur.
create function public.format_fr_datetime(p_date date, p_time time)
returns text
language sql
immutable
set search_path = ''
as $$
  select (array['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'])[extract(dow from p_date)::int + 1]
    || ' ' || extract(day from p_date)::int
    || ' ' || (array['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'])[extract(month from p_date)::int]
    || coalesce(' à ' || to_char(p_time, 'HH24"h"MI'), '');
$$;

-- Met en file une notification pour l'autre parent de l'espace, s'il a un
-- appareil enregistré et n'a pas coupé ces alertes, puis réveille l'Edge
-- Function d'envoi.
create function public.enqueue_partner_notification(
  p_household_id uuid,
  p_actor uuid,
  p_kind text,
  p_title text,
  p_body text,
  p_data jsonb,
  p_dedupe_key text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient uuid;
  v_id uuid;
begin
  if p_actor is null then
    return;
  end if;

  select case
           when h.pregnant_user_id = p_actor then h.partner_user_id
           when h.partner_user_id = p_actor then h.pregnant_user_id
         end
    into v_recipient
    from public.households h
   where h.id = p_household_id;

  if v_recipient is null then
    return;
  end if;
  if not exists (
    select 1 from public.profiles p
     where p.id = v_recipient and p.notify_partner
  ) then
    return;
  end if;
  if not exists (
    select 1 from public.push_tokens t where t.user_id = v_recipient
  ) then
    return;
  end if;

  insert into public.notification_outbox (user_id, kind, title, body, data, dedupe_key)
  values (v_recipient, p_kind, p_title, p_body, coalesce(p_data, '{}'::jsonb), p_dedupe_key)
  on conflict (dedupe_key) do nothing
  returning id into v_id;

  if v_id is not null then
    perform net.http_post(
      url := 'https://hsclyntlnoyevstdhgvu.supabase.co/functions/v1/send-push',
      body := jsonb_build_object('id', v_id),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  end if;
end;
$$;
revoke execute on function public.enqueue_partner_notification(uuid, uuid, text, text, text, jsonb, text)
  from public, anon, authenticated;

create function public.display_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(nullif(trim(p.first_name), ''), 'Votre partenaire')
    from public.profiles p
   where p.id = p_user_id;
$$;
revoke execute on function public.display_name(uuid) from public, anon, authenticated;

-- 1. Rendez-vous partagé ajouté (ou rendu partagé) par l'autre parent.
create function public.notify_shared_appointment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_shared
     and (tg_op = 'INSERT' or not old.is_shared)
     and new.appointment_date >= current_date then
    perform public.enqueue_partner_notification(
      new.household_id,
      new.created_by,
      'shared_appointment',
      'Nouveau rendez-vous partagé',
      coalesce(public.display_name(new.created_by), 'Votre partenaire')
        || ' a ajouté « ' || new.title || ' », '
        || public.format_fr_datetime(new.appointment_date, new.appointment_time) || '.',
      jsonb_build_object('url', '/sante?tab=appointments'),
      'shared_appointment:' || new.id
    );
  end if;
  return new;
end;
$$;
revoke execute on function public.notify_shared_appointment() from public, anon, authenticated;

create trigger notify_shared_appointment
  after insert or update of is_shared on public.appointments
  for each row execute function public.notify_shared_appointment();

-- 2. Naissance déclarée (« J'ai accouché ») par l'autre parent.
create function public.notify_birth_declared()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.birth_date is null and new.birth_date is not null then
    perform public.enqueue_partner_notification(
      new.id,
      (select auth.uid()),
      'birth_declared',
      'Bienvenue bébé ! 🎉',
      coalesce(public.display_name((select auth.uid())), 'Votre partenaire')
        || ' a déclaré la naissance. Pensez aux démarches des premiers jours.',
      jsonb_build_object('url', '/demarches'),
      'birth_declared:' || new.id
    );
  end if;
  return new;
end;
$$;
revoke execute on function public.notify_birth_declared() from public, anon, authenticated;

create trigger notify_birth_declared
  after update of birth_date on public.households
  for each row execute function public.notify_birth_declared();

-- 3. Trois jours d'humeur difficile d'affilée : une seule alerte par série
-- (la clé porte la date de début de la série).
create function public.notify_difficult_moods()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int := 0;
  v_day date := new.checkin_date;
begin
  if new.mood not in ('bad', 'terrible') then
    return new;
  end if;

  loop
    exit when not exists (
      select 1 from public.mood_checkins m
       where m.user_id = new.user_id
         and m.checkin_date = v_day
         and m.mood in ('bad', 'terrible')
    );
    v_count := v_count + 1;
    v_day := v_day - 1;
    exit when v_count >= 30;
  end loop;

  if v_count >= 3 then
    perform public.enqueue_partner_notification(
      new.household_id,
      new.user_id,
      'difficult_moods',
      'Un petit geste ?',
      coalesce(public.display_name(new.user_id), 'Votre partenaire')
        || ' traverse quelques jours difficiles. Un message, une attention : ça compte.',
      jsonb_build_object('url', '/partenaire'),
      'difficult_moods:' || new.user_id || ':' || (v_day + 1)
    );
  end if;
  return new;
end;
$$;
revoke execute on function public.notify_difficult_moods() from public, anon, authenticated;

create trigger notify_difficult_moods
  after insert or update of mood on public.mood_checkins
  for each row execute function public.notify_difficult_moods();

-- Alertes au partenaire (demande explicite du 2026-11-15) : quand la
-- personne enceinte partage son humeur du jour ou note des symptômes,
-- l'autre parent est prévenu — « savoir comment se porte la femme ».
--
--   - humeur : à chaque saisie du jour, une notification au plus par jour,
--     avec la phrase d'humeur et les besoins exprimés ; l'alerte « 3 jours
--     difficiles » (`notify_difficult_moods`) reste en plus ;
--   - symptômes : dès qu'au moins un symptôme est noté (pas pour « Pas de
--     symptômes »), une notification au plus par jour, qui les nomme.
--
-- L'app enregistre l'humeur au tap, puis le besoin quelques secondes plus
-- tard (et les symptômes un par un) : la notification est mise en file avec
-- un délai, et son texte suit les modifications tant qu'elle n'est pas
-- partie. Une correction après l'envoi ne renvoie rien.
--
-- Données de santé (CLAUDE.md) : rien de nouveau n'est lisible en base —
-- le partenaire voit déjà humeur et symptômes dans l'app (policies SELECT
-- existantes). Le texte part par push (Expo → Firebase) et s'affiche sur
-- l'écran verrouillé : choix explicite de nommer les symptômes. Le
-- partenaire peut couper ces alertes (Réglages → « Votre partenaire »,
-- `profiles.notify_partner`).

-- Destinataire d'une alerte : l'autre parent du foyer, s'il n'a pas coupé
-- ces alertes et a un appareil enregistré. Mêmes règles que
-- `enqueue_partner_notification`.
create function public.partner_notification_recipient(
  p_household_id uuid,
  p_actor uuid
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select r.recipient
    from (
      select case
               when h.pregnant_user_id = p_actor then h.partner_user_id
               when h.partner_user_id = p_actor then h.pregnant_user_id
             end as recipient
        from public.households h
       where h.id = p_household_id
    ) r
   where r.recipient is not null
     and exists (
       select 1 from public.profiles p
        where p.id = r.recipient and p.notify_partner
     )
     and exists (
       select 1 from public.push_tokens t where t.user_id = r.recipient
     );
$$;
revoke execute on function public.partner_notification_recipient(uuid, uuid)
  from public, anon, authenticated;

-- Comme `enqueue_partner_notification`, mais la ligne de `p_dedupe_key`
-- peut être réécrite tant qu'elle n'est pas partie, et l'envoi attend
-- `p_delay_seconds` (géré par `send-push`). Seule la création réveille
-- l'envoi : les réécritures suivantes ne font que changer le texte.
create function public.upsert_partner_notification(
  p_household_id uuid,
  p_actor uuid,
  p_kind text,
  p_title text,
  p_body text,
  p_data jsonb,
  p_dedupe_key text,
  p_delay_seconds int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recipient uuid;
  v_id uuid;
  v_inserted boolean;
begin
  if p_actor is null then
    return;
  end if;

  v_recipient := public.partner_notification_recipient(p_household_id, p_actor);
  if v_recipient is null then
    return;
  end if;

  insert into public.notification_outbox (user_id, kind, title, body, data, dedupe_key)
  values (v_recipient, p_kind, p_title, p_body, coalesce(p_data, '{}'::jsonb), p_dedupe_key)
  on conflict (dedupe_key) do update
    set title = excluded.title,
        body = excluded.body,
        data = excluded.data
    where public.notification_outbox.sent_at is null
  returning id, (xmax = 0) into v_id, v_inserted;

  if v_id is not null and v_inserted then
    perform net.http_post(
      url := 'https://hsclyntlnoyevstdhgvu.supabase.co/functions/v1/send-push',
      body := jsonb_build_object('id', v_id, 'delaySeconds', p_delay_seconds),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  end if;
end;
$$;
revoke execute on function public.upsert_partner_notification(uuid, uuid, text, text, text, jsonb, text, int)
  from public, anon, authenticated;

-- Humeur du jour --------------------------------------------------------

create function public.notify_mood_checkin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_phrase text;
  v_need text;
begin
  -- Seule l'humeur de la personne enceinte, et seulement celle du jour
  -- (pas une journée passée complétée après coup).
  if not exists (
    select 1 from public.households h
     where h.id = new.household_id and h.pregnant_user_id = new.user_id
  ) then
    return new;
  end if;
  if new.checkin_date <> (now() at time zone 'Europe/Paris')::date then
    return new;
  end if;

  -- Mêmes phrases que la carte « Mon partenaire » (PARTNER_MOOD_PHRASES),
  -- sans accord de genre.
  v_phrase := case new.mood
    when 'great' then 'est en pleine forme'
    when 'good' then 'va bien'
    when 'neutral' then 'va à peu près'
    when 'bad' then 'a besoin d’un peu de douceur'
    when 'terrible' then 'a besoin de vous aujourd’hui'
  end;
  v_need := left(nullif(btrim(new.need_note), ''), 120);

  perform public.upsert_partner_notification(
    new.household_id,
    new.user_id,
    'mood_checkin',
    'Humeur du jour',
    coalesce(public.display_name(new.user_id), 'Votre partenaire')
      || ' ' || v_phrase
      || coalesce(' · Besoin : ' || v_need, ''),
    jsonb_build_object('url', '/partenaire'),
    'mood_checkin:' || new.user_id || ':' || new.checkin_date,
    30
  );
  return new;
end;
$$;
revoke execute on function public.notify_mood_checkin() from public, anon, authenticated;

create trigger notify_mood_checkin
  after insert or update of mood, need_note on public.mood_checkins
  for each row execute function public.notify_mood_checkin();

-- Symptômes du jour -----------------------------------------------------

create function public.notify_symptoms()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_labels text;
begin
  if not exists (
    select 1 from public.households h
     where h.id = new.household_id and h.pregnant_user_id = new.user_id
  ) then
    return new;
  end if;
  if new.log_date <> (now() at time zone 'Europe/Paris')::date then
    return new;
  end if;

  -- Libellés du catalogue (SYMPTOM_OPTIONS) ; un symptôme personnalisé est
  -- déjà stocké sous son libellé. « aucun » = « Pas de symptômes ».
  select string_agg(
           case t.symptom
             when 'vomissements' then 'vomissements'
             when 'vertiges' then 'vertiges'
             when 'mal_de_dos' then 'mal de dos'
             when 'fatigue' then 'fatigue'
             when 'reflux_gastrique' then 'reflux gastrique'
             when 'bouffees_de_chaleur' then 'bouffées de chaleur'
             when 'insomnies' then 'insomnies'
             when 'nausees' then 'nausées'
             else t.symptom
           end,
           ', ' order by t.position)
    into v_labels
    from unnest(new.symptoms) with ordinality as t(symptom, position)
   where t.symptom <> 'aucun';

  if v_labels is null then
    return new;
  end if;

  perform public.upsert_partner_notification(
    new.household_id,
    new.user_id,
    'symptoms',
    'Symptômes du jour',
    coalesce(public.display_name(new.user_id), 'Votre partenaire')
      || ' a noté : ' || left(v_labels, 150),
    jsonb_build_object('url', '/partenaire'),
    'symptoms:' || new.user_id || ':' || new.log_date,
    60
  );
  return new;
end;
$$;
revoke execute on function public.notify_symptoms() from public, anon, authenticated;

create trigger notify_symptoms
  after insert or update of symptoms on public.symptoms_log
  for each row execute function public.notify_symptoms();

-- Rappel quotidien d'humeur (local, sur le téléphone de la personne
-- enceinte) : préférence coupable dans Réglages.
alter table public.profiles
  add column if not exists notify_mood_reminder boolean not null default true;

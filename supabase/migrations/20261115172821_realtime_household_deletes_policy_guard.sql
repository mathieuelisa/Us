-- Postgres ne garantit pas l'ordre d'évaluation d'un AND : le CASE assure
-- que le cast en uuid n'a lieu qu'après la vérification du format du canal.
alter policy household_members_receive_broadcasts
  on realtime.messages
  using (
    realtime.messages.extension = 'broadcast'
    and case
      when split_part((select realtime.topic()), ':', 1) = 'household'
        and split_part((select realtime.topic()), ':', 2)
          ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then public.is_household_member(
        split_part((select realtime.topic()), ':', 2)::uuid
      )
      else false
    end
  );

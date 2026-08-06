-- Gesture suggestions: static catalog of "geste du jour" tips, one pool per
-- role. Selection/delivery logic (including the behavioral trigger on
-- repeated difficult moods, see DOCS/02-ACTION-PLAN.md Phase 4) lives in
-- application code — this table is just the content pool.

create table public.gesture_suggestions (
  id uuid primary key default gen_random_uuid(),
  target_role text not null check (target_role in ('pregnant', 'partner')),
  body text not null,
  sort_order int not null default 0
);

alter table public.gesture_suggestions enable row level security;

create policy "gesture_suggestions_select_all"
  on public.gesture_suggestions for select
  using (true);

insert into public.gesture_suggestions (target_role, body, sort_order) values
  ('partner', 'N''hésite pas à lui dire qu''elle est belle', 1),
  ('partner', 'Propose-lui de dormir 1h de plus', 2),
  ('partner', 'Fais-lui couler un bain ce soir', 3),
  ('partner', 'Propose-lui un massage des pieds', 4),
  ('partner', 'Prépare le dîner pour la surprendre', 5),
  ('pregnant', 'N''hésite pas à lui dire qu''il est important aux rendez-vous', 1),
  ('pregnant', 'Partage avec lui ce que tu ressens aujourd''hui', 2),
  ('pregnant', 'Invite-le à poser sa main sur ton ventre ce soir', 3);

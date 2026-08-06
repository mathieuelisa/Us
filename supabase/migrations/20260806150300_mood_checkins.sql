-- Mood check-ins: one per user per day. The optional need_note comes from
-- the "besoin de..." popup and surfaces directly on the partner's home
-- screen "Humeur du jour" card (CONCEPT.md). The 7-day trend shown in the
-- app is qualitative only (never raw numbers) — that's a client-side
-- rendering rule, not something enforced by this table.

create table public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  checkin_date date not null,
  mood text not null check (mood in ('great', 'good', 'neutral', 'bad', 'terrible')),
  need_note text,
  created_at timestamptz not null default now(),
  unique (household_id, user_id, checkin_date)
);

alter table public.mood_checkins enable row level security;

-- Both parents can read all check-ins in the household (own + partner's).
create policy "mood_checkins_select_members"
  on public.mood_checkins for select
  using (public.is_household_member(household_id));

-- Each user only ever writes their own check-in.
create policy "mood_checkins_insert_own"
  on public.mood_checkins for insert
  with check (user_id = auth.uid() and public.is_household_member(household_id));

create policy "mood_checkins_update_own"
  on public.mood_checkins for update
  using (user_id = auth.uid());

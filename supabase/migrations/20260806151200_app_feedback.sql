-- App feedback: the in-app review prompt (rating + optional comment). Each
-- submission is personal — visible only to its author, not the partner.

create table public.app_feedback (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.app_feedback enable row level security;

create policy "app_feedback_select_own"
  on public.app_feedback for select
  using (user_id = auth.uid());

create policy "app_feedback_insert_own"
  on public.app_feedback for insert
  with check (user_id = auth.uid() and public.is_household_member(household_id));

-- Exercises: static catalog of pregnancy exercises, filtered client-side by
-- current trimester. No household scoping — same content for everyone.

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  trimester int not null check (trimester in (1, 2, 3)),
  title text not null,
  duration_label text,
  description text,
  sort_order int not null default 0
);

alter table public.exercises enable row level security;

create policy "exercises_select_all"
  on public.exercises for select
  using (true);

insert into public.exercises (trimester, title, duration_label, sort_order) values
  (1, 'Étirement du dos', '5 min · assis', 1),
  (1, 'Respiration prénatale', '3 min · allongée', 2),
  (2, 'Yoga prénatal doux', '10 min · tapis', 1),
  (3, 'Marche douce', '15 min · extérieur', 1);

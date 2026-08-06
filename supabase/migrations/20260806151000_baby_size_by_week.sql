-- Baby size by week: static referential used by the "Aujourd'hui" screens
-- (fruit/vegetable comparison). No household scoping.

create table public.baby_size_by_week (
  week int primary key,
  fruit_label text not null,
  length_cm numeric
);

alter table public.baby_size_by_week enable row level security;

create policy "baby_size_by_week_select_all"
  on public.baby_size_by_week for select
  using (true);

insert into public.baby_size_by_week (week, fruit_label, length_cm) values
  (8, 'Comme une framboise', 1.6),
  (12, 'Comme une prune', 5.4),
  (16, 'Comme une pêche', 11.6),
  (20, 'Comme une banane', 25.6),
  (24, 'Comme un avocat', 30),
  (28, 'Comme une aubergine', 37.6),
  (32, 'Comme un chou', 42.4),
  (36, 'Comme une laitue romaine', 47.4),
  (40, 'Comme une pastèque', 51.2);

-- Adds "groupe sanguin" as an allowed category for household_info_items
-- (20260814120000_household_info_items_category.sql) — same reasoning as
-- that migration: no new RLS needed, `household_info_items_all_members` is
-- already table-level and covers every column/value.

alter table public.household_info_items
  drop constraint if exists household_info_items_category_check;

alter table public.household_info_items
  add constraint household_info_items_category_check
    check (
      category in (
        'phone',
        'address',
        'date',
        'allergy',
        'social_security',
        'vigilance',
        'blood_type'
      )
    );

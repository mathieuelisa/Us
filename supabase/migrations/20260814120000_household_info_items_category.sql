-- Adds a category to household_info_items so the "Informations importantes"
-- screen can render a dedicated icon/form per type (téléphone, adresse,
-- date, allergie, n° sécurité sociale, point de vigilance maternel) instead
-- of a single generic label/value list.
--
-- RLS: no new policy needed. `household_info_items_all_members`
-- (20260806151100_household_info_items.sql) is already table-level
-- (`for all ... using/with check (is_household_member)`), so it covers this
-- new column automatically — both household members keep read/write on
-- every field, consistent with this screen already being "Partagées et
-- modifiables par vous deux". Reviewed explicitly rather than deferred, per
-- CLAUDE.md (données de santé).

alter table public.household_info_items
  add column category text
    check (
      category in (
        'phone',
        'address',
        'date',
        'allergy',
        'social_security',
        'vigilance'
      )
    );

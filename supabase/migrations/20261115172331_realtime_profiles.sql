-- Realtime sur les profils : prénom, photo et pronom de l'autre parent mis à
-- jour en direct. La policy profiles_select_household_partner limite les
-- événements à son propre profil et à celui de l'autre parent de l'espace.
alter publication supabase_realtime add table public.profiles;

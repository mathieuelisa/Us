-- Rendez-vous créés par les deux parents (décision D3 du 2026-11-11, plan
-- Supabase lot 3). Jusqu'ici seule la personne enceinte créait, modifiait et
-- supprimait, et voyait tout ; le co-parent ne voyait que les rendez-vous
-- partagés.
--
-- Nouvelle règle, symétrique (choix explicite) :
--   - lire      : membre du foyer ET (créateur OU rendez-vous partagé) —
--                 un rendez-vous non partagé n'est visible que de son
--                 créateur, quel que soit son rôle ;
--   - créer     : membre du foyer, pour soi-même (`created_by`) ;
--   - modifier  : le créateur seulement, sans pouvoir changer de foyer ni
--                 d'auteur ;
--   - supprimer : le créateur seulement.
--
-- Les 4 policies existantes sont réécrites et renommées (`alter policy`)
-- plutôt que supprimées puis recréées : même résultat, sans fenêtre où la
-- table n'aurait plus de règle.

alter policy "appointments_select_scoped" on public.appointments
  to authenticated
  using (
    public.is_household_member(household_id)
    and (created_by = auth.uid() or is_shared = true)
  );
alter policy "appointments_select_scoped" on public.appointments
  rename to "appointments_select_own_or_shared";

alter policy "appointments_insert_pregnant_only" on public.appointments
  to authenticated
  with check (
    created_by = auth.uid()
    and public.is_household_member(household_id)
  );
alter policy "appointments_insert_pregnant_only" on public.appointments
  rename to "appointments_insert_members";

alter policy "appointments_update_pregnant_only" on public.appointments
  to authenticated
  using (created_by = auth.uid() and public.is_household_member(household_id))
  with check (created_by = auth.uid() and public.is_household_member(household_id));
alter policy "appointments_update_pregnant_only" on public.appointments
  rename to "appointments_update_creator";

alter policy "appointments_delete_pregnant_only" on public.appointments
  to authenticated
  using (created_by = auth.uid() and public.is_household_member(household_id));
alter policy "appointments_delete_pregnant_only" on public.appointments
  rename to "appointments_delete_creator";

create index if not exists appointments_household_date_idx
  on public.appointments (household_id, appointment_date);

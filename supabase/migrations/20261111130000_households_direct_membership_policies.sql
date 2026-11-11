-- Corrige la création du foyer en fin d'onboarding, qui échouait avec
-- « new row violates row-level security policy for table "households" »
-- (premier essai avec un vrai compte, 2026-11-11).
--
-- `completeOnboarding()` fait `insert … returning` (`.select()` côté
-- client) : Postgres vérifie alors la policy SELECT sur la ligne insérée.
-- Or `households_select_members` passait par `is_household_member(id)`,
-- une fonction STABLE qui relit `households` avec la photographie prise au
-- début de l'instruction — elle ne voit donc pas encore la ligne en cours
-- d'insertion et répond « non membre ».
--
-- Sur `households` elle-même, inutile de relire la table : l'appartenance
-- se lit directement sur les colonnes de la ligne. Même règle, sans le
-- détour qui la cassait. `update` suit le même modèle, avec un WITH CHECK
-- qui empêche de se retirer soi-même du foyer en le modifiant.
-- Les autres tables gardent `is_household_member(household_id)` : leur
-- foyer existe toujours avant elles.

alter policy "households_select_members" on public.households
  to authenticated
  using (auth.uid() in (pregnant_user_id, partner_user_id));

alter policy "households_update_members" on public.households
  to authenticated
  using (auth.uid() in (pregnant_user_id, partner_user_id))
  with check (auth.uid() in (pregnant_user_id, partner_user_id));

alter policy "households_insert_creator" on public.households
  to authenticated
  with check (pregnant_user_id = auth.uid());

-- Premium exigé en base (dette n°53, demande explicite du 2026-11-15) : les
-- tables des modules premium ne sont lisibles et modifiables que si le foyer
-- a un droit premium (`has_premium`, migration
-- `household_entitlements`). Le droit est porté par le foyer : celui des
-- deux parents qui paie débloque l'autre, y compris un partenaire arrivé
-- après l'achat.
--
-- RLS revue explicitement (données de santé de l'enfant dans
-- `baby_entries`) :
--   - lecture, création, modification : membre du foyer **et** premium ;
--   - suppression : inchangée (membre du foyer, ou auteur pour les
--     prénoms). On n'empêche jamais quelqu'un d'effacer ses propres
--     données, même sans premium ;
--   - les données saisies avant cette migration ne sont pas supprimées :
--     un foyer sans premium ne les voit plus, elles réapparaissent au
--     paiement.

-- Votre bébé ---------------------------------------------------------------

alter policy "baby_entries_select_members" on public.baby_entries
  using (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "baby_entries_insert_members" on public.baby_entries
  with check (
    created_by = (select auth.uid())
    and public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "baby_entries_update_members" on public.baby_entries
  using (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  )
  with check (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

-- Assistant contractions ---------------------------------------------------

alter policy "contraction_sessions_select_members" on public.contraction_sessions
  using (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "contraction_sessions_insert_members" on public.contraction_sessions
  with check (
    created_by = (select auth.uid())
    and public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "contraction_sessions_update_members" on public.contraction_sessions
  using (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  )
  with check (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "contractions_select_members" on public.contractions
  using (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "contractions_insert_members" on public.contractions
  with check (
    created_by = (select auth.uid())
    and public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "contractions_update_members" on public.contractions
  using (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  )
  with check (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

-- Le match des prénoms -----------------------------------------------------

alter policy "name_swipes_select_members" on public.name_swipes
  using (
    public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "name_swipes_insert_own" on public.name_swipes
  with check (
    user_id = (select auth.uid())
    and public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

alter policy "name_swipes_update_own" on public.name_swipes
  using (
    user_id = (select auth.uid())
    and public.has_premium(household_id)
  )
  with check (
    user_id = (select auth.uid())
    and public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

-- Favoris personnels : lecture limitée à soi, et au premium.
alter policy "name_favorites_select_own" on public.name_favorites
  using (
    user_id = (select auth.uid())
    and public.has_premium(household_id)
  );

alter policy "name_favorites_insert_own" on public.name_favorites
  with check (
    user_id = (select auth.uid())
    and public.is_household_member(household_id)
    and public.has_premium(household_id)
  );

-- Temps réel : quand un parent paie, l'app de l'autre se met à jour sans
-- geste (même mécanisme que `realtime_household_tables`). La policy SELECT
-- de `household_entitlements` limite la diffusion aux membres du foyer.
alter publication supabase_realtime add table public.household_entitlements;

-- Remboursement (ligne supprimée par `stripe-webhook`) : même déclencheur
-- de diffusion que les autres tables de l'espace.
create trigger broadcast_delete after delete on public.household_entitlements
  for each row execute function public.broadcast_household_delete();

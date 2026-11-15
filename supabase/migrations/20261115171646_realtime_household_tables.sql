-- Supabase Realtime (Postgres Changes) sur les tables partagées d'un espace :
-- l'app d'un parent se met à jour quand l'autre écrit. Les policies SELECT
-- existantes s'appliquent aussi aux événements temps réel (un rendez-vous non
-- partagé n'est pas diffusé à l'autre parent). name_favorites, personnelles,
-- et les tables de référence restent hors publication.
alter publication supabase_realtime add table
  public.households,
  public.mood_checkins,
  public.symptoms_log,
  public.appointments,
  public.contacts,
  public.household_info_items,
  public.household_procedures,
  public.household_checklist_items,
  public.household_custom_checklist_items,
  public.baby_entries,
  public.name_swipes,
  public.contraction_sessions,
  public.contractions;

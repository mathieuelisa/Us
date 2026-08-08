-- Écran de détail d'exercice (Phase 1.5+, ajout hors périmètre initial) :
-- image d'illustration, optionnelle. Nullable — le catalogue actuel n'a
-- aucune photo réelle disponible (aucun asset dans design/) ; l'écran
-- affiche un repli visuel tant que le champ n'est pas renseigné.
alter table public.exercises
  add column image_url text;

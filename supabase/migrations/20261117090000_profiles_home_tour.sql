-- Visite guidée de l'accueil (demande explicite du 2026-11-17) : affichée à
-- la première arrivée sur le hub, puis plus jamais — y compris après une
-- réinstallation ou sur un autre téléphone, d'où un champ sur le profil
-- plutôt qu'un stockage local (choix validé). « Revoir la visite guidée »
-- (Réglages) la relance sans toucher à ce champ.
--
-- Aucune donnée de santé. RLS inchangée : `profiles_update_own` laisse
-- chacun écrire sur sa propre ligne, et `profiles_select_household_partner`
-- expose déjà les colonnes du profil à l'autre parent — ce booléen n'a rien
-- de sensible.
--
-- Comptes existants : `false` aussi, ils verront la visite une fois.
alter table public.profiles
  add column has_seen_home_tour boolean not null default false;

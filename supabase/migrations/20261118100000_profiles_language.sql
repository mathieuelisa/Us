-- Langue de l'interface (demande explicite du 2026-11-18) : français,
-- anglais ou espagnol, choisie dans Réglages. Stockée sur le profil pour
-- qu'elle suive le compte (réinstallation, autre téléphone) et pour que les
-- notifications envoyées par le serveur puissent un jour partir dans la
-- bonne langue ; l'app en garde aussi une copie locale pour les écrans
-- d'avant connexion. `null` = langue du téléphone (choix validé).
--
-- Aucune donnée de santé. RLS inchangée : `profiles_update_own` laisse
-- chacun écrire sur sa propre ligne, et `profiles_select_household_partner`
-- expose déjà les colonnes du profil à l'autre parent — la langue n'a rien
-- de sensible.
alter table public.profiles
  add column language text
    constraint profiles_language_supported
    check (language in ('fr', 'en', 'es'));

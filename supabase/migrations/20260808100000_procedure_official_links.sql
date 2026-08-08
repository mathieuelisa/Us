-- Liens vers les téléservices officiels (écran 5b — CONCEPT.md : « lien
-- direct vers le téléservice officiel, pas d'explication de procédure dans
-- l'app »). Absents de la migration initiale des démarches.
--
-- Chaque URL a été vérifiée manuellement (recherche web, pas de mémoire du
-- modèle) au moment de l'écriture de cette migration, pour une source
-- officielle française à jour :
--   - déclaration-naissance : fiche service-public.fr sur le délai légal
--     de 5 jours et le lieu de déclaration (mairie du lieu de naissance)
--   - caf : rubrique "j'attends un enfant" du site caf.fr
--   - securite-sociale : démarche de déclaration de l'enfant sur ameli.fr
--   - conge-employeur : démarche officielle "congé de paternité et
--     d'accueil de l'enfant" pour le secteur privé (demarches.interieur.gouv.fr)
--   - mode-de-garde : monenfant.fr, portail national officiel
--
-- « mutuelle » reste volontairement sans lien : c'est un assureur privé
-- propre à chaque foyer, aucun téléservice officiel générique n'existe.
-- Deviner une URL ici serait pire que ne rien afficher.

update public.procedure_templates
   set official_link = 'https://www.service-public.fr/particuliers/vosdroits/F961'
 where slug = 'declaration-naissance';

update public.procedure_templates
   set official_link = 'https://www.caf.fr/allocataires/aides-et-demarches/ma-situation/vie-personnelle/j-attends-un-enfant'
 where slug = 'caf';

update public.procedure_templates
   set official_link = 'https://www.ameli.fr/assure/droits-demarches/famille/maternite-paternite-adoption/declaration-de-son-enfant'
 where slug = 'securite-sociale';

update public.procedure_templates
   set official_link = 'https://www.demarches.interieur.gouv.fr/particuliers/conge-paternite-accueil-enfant-salarie-secteur-prive'
 where slug = 'conge-employeur';

update public.procedure_templates
   set official_link = 'https://monenfant.fr/'
 where slug = 'mode-de-garde';

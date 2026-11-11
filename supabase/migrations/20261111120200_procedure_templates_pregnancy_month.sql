-- Mois de grossesse auquel prévoir chaque démarche (écran Démarches, classé
-- par mois et ouvert sur le mois en cours). La correspondance vivait dans le
-- code (`PROCEDURE_PREGNANCY_MONTH`) : elle passe en base pour qu'une démarche
-- ajoutée au référentiel porte son propre rangement.

alter table public.procedure_templates
  add column if not exists pregnancy_month smallint
    check (pregnancy_month between 1 and 9);

update public.procedure_templates
   set pregnancy_month = case slug
     when 'mode-de-garde' then 3
     when 'assurance-habitation' then 5
     when 'securite-sociale' then 6
     when 'administration-fiscale' then 7
     when 'declaration-naissance' then 9
     when 'conge-employeur' then 9
     when 'caf' then 9
     when 'mutuelle' then 9
   end
 where slug in (
   'mode-de-garde', 'assurance-habitation', 'securite-sociale',
   'administration-fiscale', 'declaration-naissance', 'conge-employeur',
   'caf', 'mutuelle'
 );

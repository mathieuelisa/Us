-- Remplace la description courte de la déclaration de naissance par un
-- texte expliquant à quoi sert cette démarche (demande explicite),
-- affiché sous l'échéance sur l'écran de détail (5a/5b).
update public.procedure_templates
set description = 'La déclaration de naissance se fait à la mairie du lieu de naissance de l''enfant. C''est cette démarche qui donne officiellement son état civil au bébé et permet ensuite toutes les autres inscriptions administratives. Elle doit être réalisée par l''un des parents, en présentant les documents ci-dessous.'
where slug = 'declaration-naissance';

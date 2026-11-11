-- « Seul·e » exclut un co-parent : `partner_uses_app` ne peut pas valoir
-- `true` pour ce type d'accompagnement. L'onboarding enregistrait pourtant
-- la réponse par défaut (Oui) de la question « Le co-parent utilisera-t-il
-- aussi l'app ? », affichée même pour « Seul·e » (corrigé côté app le
-- 2026-11-11).
--
-- 1. Remet d'aplomb les foyers déjà créés.
-- 2. Contrainte pour que la base refuse désormais cette combinaison.

update public.households
   set partner_uses_app = false
 where accompaniment_type = 'seul'
   and partner_uses_app;

alter table public.households
  add constraint households_solo_without_partner
    check (accompaniment_type is distinct from 'seul' or partner_uses_app = false);

-- "La Valise de maternité" se décline en 3 sous-sections (demande
-- explicite) : Maman / Bébé / Co-parent. Colonne nullable — seule
-- "valise-maternite" l'utilise pour l'instant, "sac-naissance" reste une
-- liste plate (l'écran bascule automatiquement sur l'absence de catégorie).
alter table public.checklist_item_templates
  add column category text check (category in ('maman', 'bebe', 'co_parent'));

update public.checklist_item_templates set category = 'maman'
where checklist_slug = 'valise-maternite' and label in (
  'Pyjamas et vêtements confortables',
  'Sous-vêtements et culottes filet/jetables',
  'Trousse de toilette',
  'Soutiens-gorge d''allaitement',
  'Coussinets d''allaitement',
  'Chaussons ou chaussettes chaudes',
  'Chargeur de téléphone',
  'Carte d''identité et carte vitale',
  'Dossier de maternité'
);

update public.checklist_item_templates set category = 'bebe'
where checklist_slug = 'valise-maternite' and label in (
  'Bodys et pyjamas pour bébé (plusieurs tailles)',
  'Turbulette ou couverture',
  'Bonnet et moufles pour bébé',
  'Couches nouveau-né',
  'Tenue de sortie pour bébé',
  'Siège auto installé dans la voiture'
);

-- Nouveaux articles "Co-parent" — n'existaient pas dans le référentiel
-- initial (contenu inventé, comme le reste de cette section). Masqués côté
-- client quand `households.accompaniment_type = 'seul'`.
insert into public.checklist_item_templates (checklist_slug, label, sort_order, category) values
  ('valise-maternite', 'Vêtements de rechange', 16, 'co_parent'),
  ('valise-maternite', 'Trousse de toilette', 17, 'co_parent'),
  ('valise-maternite', 'Chargeur de téléphone et batterie externe', 18, 'co_parent'),
  ('valise-maternite', 'De quoi manger et boire pour la journée', 19, 'co_parent'),
  ('valise-maternite', 'Oreiller et couverture pour la nuit', 20, 'co_parent');

-- Le trigger `on_household_created_checklist_items` ne seede que les foyers
-- créés après lui : les 5 nouveaux articles doivent être rattrapés pour les
-- foyers déjà existants, même parti pris que pour les démarches (cf.
-- 20260809130000_procedures_descriptions_and_new_items.sql).
insert into public.household_checklist_items (household_id, checklist_item_template_id)
select h.id, cit.id
from public.households h
cross join public.checklist_item_templates cit
where cit.category = 'co_parent'
on conflict (household_id, checklist_item_template_id) do nothing;

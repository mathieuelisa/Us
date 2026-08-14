-- « La valise en salle de naissance » (ex « Le sac en salle
-- d'accouchement », renommage côté client uniquement — cf.
-- `CHECKLIST_META`) se décline elle aussi en 3 sous-sections Maman / Bébé /
-- Co-parent, même parti pris que « La Valise de maternité »
-- (20260814100000_checklist_categories.sql).

update public.checklist_item_templates set category = 'maman'
where checklist_slug = 'sac-naissance' and label in (
  'Tenue confortable pour le travail',
  'Chaussettes chaudes',
  'Brumisateur ou huile de massage',
  'Musique ou playlist de relaxation',
  'Bouteille d''eau et en-cas',
  'Serviette de toilette'
);

update public.checklist_item_templates set category = 'bebe'
where checklist_slug = 'sac-naissance' and label in (
  'Body pour le peau à peau',
  'Coussin d''allaitement'
);

update public.checklist_item_templates set category = 'co_parent'
where checklist_slug = 'sac-naissance' and label in (
  'Appareil photo ou téléphone chargé',
  'Liste des personnes à prévenir'
);

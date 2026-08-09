-- Étoffe les descriptions de 5 des 6 démarches existantes (textes fournis
-- par l'utilisateur, affichés sous l'échéance sur l'écran de détail), et
-- ajoute 2 démarches supplémentaires au référentiel V1 — écart assumé avec
-- CONCEPT.md, qui n'en liste que 6 (demande explicite, documentée dans
-- DOCS/02-ACTION-PLAN.md).
update public.procedure_templates
set description = 'Après la naissance, les rendez-vous médicaux et achats de produits en pharmacie pour votre enfant vont se multiplier. Il est donc important d''être bien couvert en matière de protection santé. Il vous faudra donc indiquer le changement de situation à votre organisme'
where slug = 'securite-sociale';

update public.procedure_templates
set description = 'En ce qui concerne la mutuelle pour les enfants, le fonctionnement est le même, avec une double affiliation possible. Avec l''arrivée d''un bébé, vos besoins en matière de santé évoluent cependant drastiquement. Un changement de contrat complémentaire santé pourrait alors se révéler opportun.'
where slug = 'mutuelle';

update public.procedure_templates
set description = 'Si vous êtes salarié, prévenez immédiatement votre employeur afin de bénéficier de votre congé paternité ou maternité. Vous devrez lui fournir une copie de l''acte de naissance afin d''être dans les règles administrativement. Rappel : il vous incombe d''informer votre employeur par lettre recommandée avec accusé de réception en amont de la naissance pour profiter de vos congés dans leur intégralité. Certaines entreprises prévoient des primes à la naissance ou des cadeaux !'
where slug = 'conge-employeur';

update public.procedure_templates
set description = 'Si vous devez inscrire votre enfant à la crèche, prévenez-la rapidement. En particulier si la date de commission d''attribution est proche.'
where slug = 'mode-de-garde';

update public.procedure_templates
set description = 'L''arrivée d''un nouvel enfant dans la famille vous ouvre de nouveaux droits ainsi que des aides. Afin d''en profiter, il faudra donc contacter l''organisme en charge des prestations sociales et familiales auquel vous êtes affilié : CAF ou MSA'
where slug = 'caf';

insert into public.procedure_templates (slug, title, description, deadline_days_after_birth, documents, sort_order) values
  ('assurance-habitation', 'Assurance habitation', 'Voici un point que l''on a parfois tendance à oublier lors des démarches administratives naissance après l''accouchement. Il est pourtant très important de contacter votre assurance habitation afin de la notifier après la naissance. Ainsi, votre enfant pourra être intégré au contrat et bénéficier du statut d''ayant-droit. Au cas contraire, il ne sera pas couvert et cette omission pourrait avoir des conséquences sérieuses en cas de sinistre.', null, '{}', 7),
  ('administration-fiscale', 'Administration fiscale', 'Parmi les démarches administratives naissance, il est obligatoire de déclarer votre nouveau-né à l''administration fiscale. Selon votre choix, vous pouvez opter pour différentes formules : rattacher l''enfant à charge de l''un des parents seulement ou répartir la charge entre les deux parents.', null, '{}', 8);

-- Le trigger `on_household_created` ne seede que les foyers créés après
-- lui : les 2 nouvelles démarches doivent être rattrapées pour les foyers
-- déjà existants, sans quoi elles resteraient invisibles pour eux.
insert into public.household_procedures (household_id, procedure_template_id)
select h.id, pt.id
from public.households h
cross join public.procedure_templates pt
where pt.slug in ('assurance-habitation', 'administration-fiscale')
on conflict (household_id, procedure_template_id) do nothing;

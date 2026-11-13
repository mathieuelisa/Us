-- Démarches mois par mois de la grossesse (liste fournie par l'utilisateur,
-- demande explicite du 2026-11-13) : 48 démarches du 1er au 9e mois, qui
-- s'ajoutent aux 8 existantes (conservées, choix explicite). Titres repris
-- tels quels ; descriptions d'une ligne rédigées pour l'app (choix
-- explicite), à faire relire comme le reste du contenu administratif.
--
-- Slug `<catégorie>-m<mois>-<sujet>` : la catégorie (sante, cpam, caf,
-- maternite, travail, garde, mutuelle, mairie, impots) donne son icône côté
-- client (`getProcedureIconStyle`). `sort_order` = mois × 100 + rang, pour
-- garder l'ordre de la liste fournie dans chaque mois.

insert into public.procedure_templates
  (slug, title, description, pregnancy_month, sort_order)
values
  ('sante-m1-premier-rdv', 'Prendre rendez-vous avec une sage-femme ou un médecin', 'Votre sage-femme, votre médecin traitant ou un gynécologue peut assurer le suivi de la grossesse dès le début.', 1, 101),
  ('sante-m1-confirmer-grossesse', 'Faire confirmer la grossesse et estimer la date d''accouchement', 'Une prise de sang et une première consultation confirment la grossesse ; la date d’accouchement est estimée, puis affinée à la première échographie.', 1, 102),
  ('maternite-m1-se-renseigner', 'Se renseigner sur les maternités et les modalités d''inscription', 'Certaines maternités sont très demandées : renseignez-vous tôt sur leur type, leur distance et leur façon d’inscrire.', 1, 103),
  ('cpam-m1-verifier-droits', 'Vérifier ses droits auprès de la CPAM et de la mutuelle', 'Assurez-vous que vos droits à l’Assurance Maladie sont à jour et regardez ce que votre mutuelle couvre pendant la grossesse.', 1, 104),
  ('sante-m2-premier-examen', 'Effectuer le premier examen prénatal si ce n''est pas déjà fait', 'Ce premier examen est obligatoire avant la fin du 3e mois : c’est lui qui donne lieu à la déclaration de grossesse.', 2, 201),
  ('cpam-m2-declaration-grossesse', 'Faire transmettre la déclaration de grossesse à la CPAM et à la CAF', 'Le professionnel qui vous suit transmet en ligne la déclaration de grossesse à l’Assurance Maladie et à la CAF.', 2, 202),
  ('cpam-m2-verifier-enregistrement', 'Vérifier l''enregistrement de la grossesse auprès des organismes', 'Quelques jours plus tard, vérifiez sur votre compte ameli et votre espace CAF que la grossesse est bien enregistrée.', 2, 203),
  ('maternite-m2-preparer-inscription', 'Préparer son inscription à la maternité', 'Rassemblez les pièces souvent demandées (pièce d’identité, carte Vitale, carte de mutuelle) pour vous inscrire sans attendre.', 2, 204),
  ('travail-m2-droits-professionnels', 'Se renseigner sur les droits professionnels et les indemnités', 'Absences pour les examens, aménagements de poste, indemnités journalières : faites le point selon votre situation.', 2, 205),
  ('cpam-m3-finaliser-declaration', 'Finaliser la déclaration de grossesse avant la fin du 3e mois', 'La déclaration doit parvenir à l’Assurance Maladie et à la CAF avant la fin du 3e mois pour ouvrir tous vos droits.', 3, 301),
  ('sante-m3-premier-examen', 'Effectuer le premier examen prénatal avant la fin du 3e mois', 'Dernier délai pour ce premier examen obligatoire, souvent proche de la première échographie.', 3, 302),
  ('cpam-m3-carte-vitale', 'Mettre à jour sa carte Vitale après la déclaration', 'Mettez à jour votre carte Vitale en pharmacie ou sur une borne pour que la prise en charge grossesse s’applique.', 3, 303),
  ('caf-m3-dossier-prime', 'Vérifier son dossier CAF et son éventuelle éligibilité à la prime à la naissance', 'La prime à la naissance dépend de vos ressources : vérifiez votre dossier et simulez vos droits sur caf.fr.', 3, 304),
  ('travail-m3-informer-employeur', 'Informer son employeur si souhaité, pour bénéficier des droits liés à la grossesse', 'Aucune date imposée, mais le dire à votre employeur ouvre la protection et les aménagements prévus pour la grossesse.', 3, 305),
  ('mairie-m3-reconnaissance-anticipee', 'Effectuer une reconnaissance anticipée en mairie si nécessaire', 'Pour un couple non marié, le père peut reconnaître l’enfant avant la naissance dans n’importe quelle mairie ; pour deux mères, la reconnaissance conjointe se fait chez le notaire.', 3, 306),
  ('sante-m4-consultation', 'Effectuer la consultation prénatale mensuelle', 'À partir du 4e mois, une consultation prénatale chaque mois, prise en charge par l’Assurance Maladie.', 4, 401),
  ('sante-m4-entretien-precoce', 'Participer à l''entretien prénatal précoce, s''il n''a pas encore eu lieu', 'Obligatoire, cet entretien avec une sage-femme ou un médecin fait le point sur vos besoins, vos questions et votre projet de naissance.', 4, 402),
  ('maternite-m4-finaliser-inscription', 'Finaliser l''inscription à la maternité selon ses modalités', 'Confirmez votre inscription comme la maternité le demande : en ligne, sur place, avec ou sans rendez-vous.', 4, 403),
  ('garde-m4-modes-de-garde', 'S''informer sur les modes de garde et les préinscriptions en crèche', 'Crèche, assistante maternelle, garde partagée : les places sont rares et les préinscriptions commencent souvent pendant la grossesse.', 4, 404),
  ('travail-m4-dates-conge', 'Préparer les dates prévisionnelles du congé maternité', 'Pour un premier ou deuxième enfant, le congé maternité dure en général 16 semaines : 6 avant la naissance, 10 après.', 4, 405),
  ('sante-m5-consultation', 'Effectuer la consultation prénatale mensuelle', 'Consultation prénatale du 5e mois, prise en charge par l’Assurance Maladie.', 5, 501),
  ('sante-m5-sage-femme-referente', 'Déclarer sa sage-femme référente avant la fin du 5e mois, si ce dispositif est choisi', 'Facultative, la sage-femme référente coordonne votre suivi pendant la grossesse et après la naissance ; elle se déclare auprès de l’Assurance Maladie.', 5, 502),
  ('cpam-m5-indemnites', 'Vérifier ses droits à indemnisation pendant le congé maternité', 'Vos indemnités journalières dépendent de vos salaires et de votre affiliation : estimez-les sur votre compte ameli.', 5, 503),
  ('travail-m5-informer-employeur', 'Informer ou préparer l''information de son employeur', 'Préparez le courrier, de préférence recommandé, qui indique vos dates de congé maternité, avec un certificat médical de grossesse.', 5, 504),
  ('garde-m5-preinscription-creche', 'Poursuivre les démarches de préinscription en crèche si nécessaire', 'Complétez ou relancez vos dossiers : dans de nombreuses communes, les places sont attribuées en commission.', 5, 505),
  ('mutuelle-m5-garanties-accouchement', 'Vérifier ses garanties de mutuelle pour l''accouchement', 'Chambre particulière, dépassements d’honoraires, forfait naissance : regardez ce que votre mutuelle rembourse.', 5, 506),
  ('sante-m6-consultation', 'Effectuer la consultation prénatale mensuelle', 'Consultation prénatale du 6e mois, prise en charge par l’Assurance Maladie.', 6, 601),
  ('maternite-m6-modalites-accueil', 'Confirmer les modalités d''accueil à la maternité', 'Quand venir, par quelle entrée, qui appeler : notez les consignes d’accueil, elles varient d’une maternité à l’autre.', 6, 602),
  ('cpam-m6-prise-en-charge-100', 'Vérifier la prise en charge maternité à 100 % à compter du 6e mois', 'Du 1er jour du 6e mois jusqu’à 12 jours après l’accouchement, vos frais médicaux remboursables sont pris en charge à 100 %.', 6, 603),
  ('travail-m6-finaliser-conge', 'Finaliser les démarches liées au congé maternité selon sa situation', 'Salariée, indépendante ou demandeuse d’emploi : les démarches et les indemnités du congé diffèrent, finalisez celles qui vous concernent.', 6, 604),
  ('caf-m6-aides-naissance', 'Se renseigner sur les aides après la naissance (PAJE, CMG)', 'L’allocation de base de la PAJE et le complément de libre choix du mode de garde (CMG) aident après la naissance, selon vos ressources.', 6, 605),
  ('sante-m7-consultation', 'Effectuer la consultation prénatale mensuelle', 'Consultation prénatale du 7e mois, prise en charge par l’Assurance Maladie.', 7, 701),
  ('caf-m7-versement-prime', 'Vérifier le versement de la prime à la naissance si éligible', 'Si vous y avez droit, la CAF verse la prime à la naissance pendant la grossesse, vers le 7e mois : vérifiez qu’elle est bien arrivée.', 7, 702),
  ('travail-m7-documents-conge', 'Contrôler les documents et démarches liés au congé maternité', 'Vérifiez que votre employeur, ou France Travail, transmet bien à l’Assurance Maladie ce qu’il faut pour vos indemnités.', 7, 703),
  ('mairie-m7-reconnaissance-anticipee', 'Effectuer la reconnaissance anticipée si nécessaire et non encore faite', 'Pas encore faite ? La reconnaissance anticipée reste possible jusqu’à la naissance, puis au moment de la déclaration.', 7, 704),
  ('maternite-m7-documents', 'Préparer les documents administratifs pour la maternité', 'Préparez une pochette : pièce d’identité, carte Vitale, carte de mutuelle, dossier de grossesse et résultats d’examens.', 7, 705),
  ('sante-m8-consultation', 'Effectuer la consultation prénatale mensuelle', 'Consultation prénatale du 8e mois, prise en charge par l’Assurance Maladie.', 8, 801),
  ('sante-m8-preanesthesique', 'Effectuer la consultation préanesthésique', 'Obligatoire même sans péridurale prévue, elle a lieu avec un anesthésiste de la maternité au 3e trimestre.', 8, 802),
  ('travail-m8-conge-second-parent', 'Vérifier les démarches du second parent pour son congé', 'Le second parent prévient son employeur au moins un mois avant son congé de paternité et d’accueil de l’enfant (25 jours, en plus des 3 jours de naissance).', 8, 803),
  ('mairie-m8-documents-declaration', 'Préparer les documents pour la déclaration de naissance', 'Rassemblez ce que demande la mairie : pièces d’identité des parents, livret de famille s’il existe, acte de reconnaissance anticipée.', 8, 804),
  ('mutuelle-m8-ajout-bebe', 'Contacter sa mutuelle pour anticiper l''ajout du bébé au contrat', 'Demandez quelles pièces fournir pour que bébé soit couvert dès sa naissance.', 8, 805),
  ('sante-m8-suivi-bebe', 'Choisir le professionnel qui assurera le suivi après la naissance', 'Pédiatre, médecin généraliste ou PMI : choisissez qui suivra bébé, les premiers examens obligatoires arrivent vite.', 8, 806),
  ('sante-m9-consultation', 'Effectuer la dernière consultation prénatale mensuelle', 'Dernière consultation prénatale : on fait le point sur l’accouchement et le terme.', 9, 901),
  ('maternite-m9-verifier-documents', 'Vérifier l''ensemble des documents nécessaires à la maternité', 'Vérifiez la pochette : pièces d’identité, carte Vitale, carte de mutuelle, dossier de suivi, résultats et échographies.', 9, 902),
  ('mairie-m9-declaration-naissance', 'Organiser la déclaration de naissance en mairie dans les 5 jours suivant l''accouchement', 'La déclaration se fait à la mairie du lieu de naissance dans les 5 jours ; certaines maternités ont un bureau qui s’en charge.', 9, 903),
  ('cpam-m9-declaration-naissance', 'Préparer la déclaration de naissance à la CPAM et à la CAF', 'Après la naissance, déclarez bébé à la CAF et faites-le rattacher à l’Assurance Maladie de l’un ou des deux parents.', 9, 904),
  ('sante-m9-suivi-domicile', 'Confirmer le suivi à domicile par une sage-femme après l''accouchement', 'Avec le service PRADO, l’Assurance Maladie organise des visites de sage-femme à domicile après la sortie ; vous pouvez aussi choisir la vôtre.', 9, 905),
  ('impots-m9-apres-naissance', 'Préparer les démarches auprès des impôts et de la mutuelle après la naissance', 'Après la naissance, signalez bébé dans votre espace impots.gouv (prélèvement à la source) et ajoutez-le à votre mutuelle.', 9, 906)
on conflict (slug) do nothing;

-- Le trigger `on_household_created` ne seede que les nouveaux foyers : les
-- foyers existants reçoivent ces démarches ici (même rattrapage que
-- `20260809130000_procedures_descriptions_and_new_items`).
insert into public.household_procedures (household_id, procedure_template_id)
select h.id, pt.id
from public.households h
cross join public.procedure_templates pt
where pt.slug ~ '^(sante|cpam|caf|maternite|travail|garde|mutuelle|mairie|impots)-m[1-9]-'
on conflict (household_id, procedure_template_id) do nothing;

-- Gestes du jour (pilier Ensemble) : textes fournis par l'utilisateur
-- (demande explicite du 2026-11-12), ajoutés aux 8 existants, et séparés
-- en deux périodes.
--
-- `phase` : « pendant la grossesse » ou « après la naissance ». L'app choisit
-- la période d'après `households.birth_date` (naissance déclarée ou non) :
-- « Laisse-la dormir en t'occupant de bébé » n'a pas de sens avant. Les
-- 8 gestes existants parlent tous de la grossesse.
--
-- `target_role` reste le rôle de la personne qui **lit** le geste (un geste
-- à faire envers l'autre parent), comme jusqu'ici.
--
-- Pas de policy à revoir : catalogue en lecture seule, déjà ouvert en
-- lecture (`gesture_suggestions_select_all`), aucune écriture côté client.

alter table public.gesture_suggestions
  add column if not exists phase text not null default 'pregnancy'
    check (phase in ('pregnancy', 'after_birth'));

insert into public.gesture_suggestions (target_role, phase, sort_order, emoji, body) values
  ('pregnant', 'pregnancy', 4, '📸', 'Envoie-lui la photo de la dernière échographie avec un petit mot.'),
  ('pregnant', 'pregnancy', 5, '💓', 'Fais-lui écouter le cœur de bébé au prochain rendez-vous.'),
  ('pregnant', 'pregnancy', 6, '📝', 'Demande-lui son avis sur un prénom qui lui tient à cœur.'),
  ('pregnant', 'pregnancy', 7, '🗣️', 'Propose-lui de parler à bébé à travers ton ventre : il reconnaîtra sa voix.'),
  ('pregnant', 'pregnancy', 8, '🧸', 'Choisissez ensemble un objet pour la chambre de bébé.'),
  ('pregnant', 'pregnancy', 9, '🛠️', 'Laisse-le monter le lit ou préparer un coin de la chambre à sa façon.'),
  ('pregnant', 'pregnancy', 10, '💫', 'Raconte-lui un moment où tu as pensé à lui en sentant bébé bouger.'),
  ('pregnant', 'pregnancy', 11, '✨', 'Demande-lui ce qui l’enthousiasme le plus dans le fait de devenir père.'),
  ('pregnant', 'pregnancy', 12, '🧳', 'Propose-lui de préparer la valise de maternité avec toi.'),
  ('pregnant', 'pregnancy', 13, '💛', 'Dis-lui ce que sa présence change pour toi pendant cette grossesse.'),
  ('pregnant', 'pregnancy', 14, '📖', 'Partage-lui un article ou une vidéo que tu as trouvés utiles sur la grossesse.'),
  ('pregnant', 'pregnancy', 15, '✂️', 'Demande-lui s’il veut couper le cordon le jour J.'),
  ('pregnant', 'after_birth', 16, '🛁', 'Confie-lui le premier bain de bébé.'),
  ('pregnant', 'after_birth', 17, '🤱', 'Laisse-le faire du peau à peau avec bébé.'),
  ('pregnant', 'after_birth', 18, '🏅', 'Dis-lui ce que tu admires chez lui en tant que père.'),
  ('pregnant', 'after_birth', 19, '🤲', 'Laisse-le trouver ses propres gestes pour calmer bébé, sans intervenir.'),
  ('pregnant', 'after_birth', 20, '📷', 'Prends une photo de lui avec bébé et envoie-la-lui.'),
  ('partner', 'pregnancy', 6, '💬', 'Demande-lui comment elle va aujourd’hui, et écoute vraiment la réponse.'),
  ('partner', 'pregnancy', 7, '💆', 'Propose-lui un massage des pieds ou du dos ce soir.'),
  ('partner', 'pregnancy', 8, '🍲', 'Prépare le repas ce soir sans qu’elle ait à y penser.'),
  ('partner', 'pregnancy', 9, '📅', 'Note la date du prochain rendez-vous dans ton agenda.'),
  ('partner', 'pregnancy', 10, '🤰', 'Pose ta main sur son ventre et parle à bébé.'),
  ('partner', 'pregnancy', 11, '🌸', 'Dis-lui qu’elle est belle, avec ses changements.'),
  ('partner', 'pregnancy', 12, '🍓', 'Apporte-lui quelque chose dont elle a envie, sans qu’elle demande.'),
  ('partner', 'pregnancy', 13, '📚', 'Renseigne-toi sur le mois de grossesse en cours et parle-lui-en.'),
  ('partner', 'pregnancy', 14, '🧺', 'Prends en charge une tâche qu’elle n’arrive plus à faire facilement.'),
  ('partner', 'pregnancy', 15, '✉️', 'Écris-lui un petit mot et laisse-le là où elle le trouvera.'),
  ('partner', 'pregnancy', 16, '🌳', 'Propose-lui une sortie calme à deux : une balade, un restaurant.'),
  ('partner', 'pregnancy', 17, '🫶', 'Demande-lui ce qui l’inquiète en ce moment.'),
  ('partner', 'after_birth', 18, '🌙', 'Lève-toi cette nuit pour le change ou pour rendormir bébé.'),
  ('partner', 'after_birth', 19, '🥤', 'Apporte-lui à boire et à manger pendant qu’elle nourrit bébé.'),
  ('partner', 'after_birth', 20, '🚪', 'Filtre les visites si elle a besoin de calme.'),
  ('partner', 'after_birth', 21, '😴', 'Laisse-la dormir ce matin en t’occupant de bébé.'),
  ('partner', 'after_birth', 22, '🙏', 'Dis-lui merci pour tout ce qu’elle a traversé.'),
  ('partner', 'after_birth', 23, '🛀', 'Offre-lui un moment rien qu’à elle : une douche tranquille, une sieste, une sortie.');

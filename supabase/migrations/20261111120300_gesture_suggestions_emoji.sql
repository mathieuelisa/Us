-- Émoji du « geste du jour » (pilier Ensemble). Il était associé côté client
-- par correspondance exacte du texte (dette n°24) : une reformulation en base
-- le faisait retomber silencieusement sur l'émoji par défaut.

alter table public.gesture_suggestions
  add column if not exists emoji text;

update public.gesture_suggestions
   set emoji = case body
     when 'N''hésite pas à lui dire qu''elle est belle' then '💛'
     when 'Propose-lui de dormir 1h de plus' then '🌙'
     when 'Fais-lui couler un bain ce soir' then '🛁'
     when 'Propose-lui un massage des pieds' then '💆'
     when 'Prépare le dîner pour la surprendre' then '🍽️'
     when 'N''hésite pas à lui dire qu''il est important aux rendez-vous' then '💬'
     when 'Partage avec lui ce que tu ressens aujourd''hui' then '💭'
     when 'Invite-le à poser sa main sur ton ventre ce soir' then '🤰'
   end
 where emoji is null;

-- Émoji du fruit ou du légume de « Votre bébé cette semaine » (Mon
-- partenaire, demande explicite) : la taille se lit d'un coup d'œil, à côté
-- du libellé « Comme une laitue romaine ». En base plutôt qu'associé côté
-- client par le texte, même raison que `gesture_suggestions.emoji`.
--
-- Framboise et prune n'ont pas d'émoji exact : 🍓 et 🍒 sont les plus
-- proches. Chou et laitue se distinguent par 🥦 et 🥬.

alter table public.baby_size_by_week
  add column if not exists emoji text;

update public.baby_size_by_week
   set emoji = case week
     when 8 then '🍓'
     when 12 then '🍒'
     when 16 then '🍑'
     when 20 then '🍌'
     when 24 then '🥑'
     when 28 then '🍆'
     when 32 then '🥦'
     when 36 then '🥬'
     when 40 then '🍉'
   end
 where emoji is null;

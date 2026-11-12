import type { HouseholdRole } from '@/lib/atoms/role';

/**
 * Astuce liée aux symptômes du jour (bloc « Aujourd'hui » du hub, demande
 * explicite). Une par symptôme du catalogue, en deux versions : un conseil
 * pour la personne enceinte, un geste d'aide pour le co-parent — qui voit
 * aussi ce bloc. Même partage par rôle que l'astuce du jour.
 *
 * ⚠️ Contenu rédigé pour l'app, volontairement général et non prescriptif,
 * **sans relecture professionnelle** (dette n°47) : à faire valider par une
 * sage-femme avant mise en production. Les signes qui doivent alerter
 * renvoient vers un professionnel plutôt que d'être traités ici.
 *
 * Constante client, comme le catalogue des symptômes (dette n°28) : à
 * passer en base avec lui s'il devient configurable.
 */
export const SYMPTOM_TIPS: Record<
  string,
  { pregnant: string; partner: string }
> = {
  vomissements: {
    pregnant:
      'Buvez par petites gorgées tout au long de la journée plutôt qu’en une fois. Si rien ne reste, même l’eau, appelez votre sage-femme.',
    partner:
      'Gardez une bouteille d’eau et quelque chose de léger à portée de main pour elle, et prenez le relais pour les odeurs de cuisine.',
  },
  vertiges: {
    pregnant:
      'Levez-vous en deux temps : asseyez-vous d’abord quelques secondes au bord du lit. Si les vertiges vont jusqu’au malaise, parlez-en à votre sage-femme.',
    partner:
      'Proposez-lui de s’asseoir dès qu’elle se sent partir, et restez à côté d’elle le temps que ça passe.',
  },
  mal_de_dos: {
    pregnant:
      'Un coussin calé entre les genoux pour dormir sur le côté soulage souvent le bas du dos.',
    partner:
      'Un massage doux du bas du dos, sans appuyer fort, peut vraiment l’aider ce soir.',
  },
  fatigue: {
    pregnant:
      'Une courte sieste ou quelques minutes allongée, sans culpabiliser : votre corps travaille beaucoup en ce moment.',
    partner:
      'Prenez en charge une tâche de la soirée, le repas ou la vaisselle, pour qu’elle puisse se reposer.',
  },
  reflux_gastrique: {
    pregnant:
      'Fractionnez les repas en petites portions et évitez de vous allonger juste après avoir mangé.',
    partner:
      'Proposez des dîners plus légers et un peu plus tôt : c’est souvent le soir que les brûlures se font sentir.',
  },
  bouffees_de_chaleur: {
    pregnant:
      'Superposez des vêtements légers faciles à retirer et gardez de l’eau fraîche près de vous.',
    partner:
      'Aérez la chambre et prévoyez une couverture plus légère pour la nuit.',
  },
  insomnies: {
    pregnant:
      'Si le sommeil ne vient pas, levez-vous pour une activité calme plutôt que de rester à tourner dans le lit.',
    partner:
      'Si elle se réveille souvent, proposez-lui de faire la grasse matinée demain pendant que vous gérez le matin.',
  },
  nausees: {
    pregnant:
      'Un petit en-cas avant de vous lever, quelques biscuits secs par exemple, aide souvent les matins difficiles.',
    partner:
      'Préparez-lui quelques biscuits secs et de l’eau sur la table de nuit pour son réveil.',
  },
};

/**
 * Conseils pour les symptômes notés aujourd'hui, un par symptôme qui en a
 * un, dans l'ordre où ils ont été notés (celui des pastilles du hub) — le
 * hub les fait défiler (`SymptomTipCarousel`). Vide s'il n'y en a aucun.
 */
export function getSymptomTips(
  symptoms: string[],
  role: HouseholdRole,
): { symptom: string; text: string }[] {
  return symptoms
    .filter((symptom) => SYMPTOM_TIPS[symptom])
    .map((symptom) => {
      const tip = SYMPTOM_TIPS[symptom];
      return {
        symptom,
        text: role === 'pregnant' ? tip.pregnant : tip.partner,
      };
    });
}

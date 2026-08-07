import type { HouseholdRole } from '@/lib/atoms/role';
import { pickForToday } from '@/lib/date';

/**
 * Astuces du jour, une par rôle. Volontairement en constante côté client et
 * non en base, contrairement à `gesture_suggestions` : il s'agit d'un
 * contenu court et figé, et une table de plus n'apporterait rien tant que
 * personne ne l'édite. À basculer en base le jour où ce contenu s'enrichit
 * ou doit être modifiable sans redéploiement.
 *
 * Distinct du « geste du jour » du pilier Ensemble : celui-ci suggère une
 * action envers l'autre, celles-ci parlent de la grossesse elle-même.
 */
const TIPS_BY_ROLE: Record<HouseholdRole, string[]> = {
  pregnant: [
    'Buvez régulièrement dans la journée, même sans soif.',
    'Une sieste de 20 minutes vaut mieux qu’un long réveil difficile.',
    'Notez vos questions au fil de l’eau pour le prochain rendez-vous.',
    'Bougez un peu chaque jour, à votre rythme — rien d’intense.',
  ],
  partner: [
    'Proposez de préparer le sac de maternité ensemble.',
    'Accompagnez-la au prochain rendez-vous si vous le pouvez.',
    'Prenez en charge une tâche du quotidien sans qu’elle ait à demander.',
    'Demandez-lui comment elle se sent, vraiment — puis écoutez.',
  ],
};

export function getTipOfTheDay(role: HouseholdRole): string | null {
  return pickForToday(TIPS_BY_ROLE[role]);
}

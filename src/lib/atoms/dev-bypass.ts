import { atom } from 'jotai';

/**
 * ⚠️ TEMPORAIRE — À SUPPRIMER.
 *
 * Force l'affichage de l'onboarding sans session authentifiée, pour pouvoir
 * travailler dessus tant que le retour du lien magique n'aboutit pas dans
 * l'app (cf. DOCS/02-ACTION-PLAN.md, dette de vérification de la 1.2).
 *
 * Conséquence à connaître : sans utilisateur réel, l'écran de finalisation
 * **échouera** au moment d'écrire en base — c'est attendu, seul le parcours
 * jusque-là est explorable.
 *
 * Pour retirer ce contournement : supprimer ce fichier, puis les trois
 * usages qu'il a dans `src/app/_layout.tsx` et `src/app/(auth)/login.tsx`
 * (le compilateur les signalera).
 */
export const devBypassOnboardingAtom = atom(false);

import { atom } from 'jotai';

/**
 * ⚠️ TEMPORAIRE — À SUPPRIMER.
 *
 * Permet de parcourir l'app sans session authentifiée, tant que le retour
 * du lien magique n'aboutit pas dans l'app (cf.
 * [Dette et points ouverts](../../../DOCS/05-DETTE-ET-POINTS-OUVERTS.md)).
 *
 * - `off` : comportement normal, la session fait foi.
 * - `onboarding` : force le parcours d'onboarding.
 * - `app` : force le hub, comme après un onboarding réussi.
 *
 * L'étape `app` existe parce que la finalisation de l'onboarding **échoue**
 * sans utilisateur réel : sans elle, le hub resterait inatteignable en
 * mode contournement.
 *
 * Pour retirer ce contournement : supprimer ce fichier, puis les usages
 * dans `src/app/_layout.tsx`, `src/app/(auth)/login.tsx`,
 * `src/app/(onboarding)/finalisation.tsx` et `src/app/(tabs)/index.tsx`
 * (le compilateur les signalera).
 */
export type DevBypassStage = 'off' | 'onboarding' | 'app';

export const devBypassAtom = atom<DevBypassStage>('off');

/**
 * Prénom saisi à l'étape 2 de l'onboarding, conservé au moment où le
 * brouillon est effacé (`finalisation.tsx`) pour que le hub puisse encore
 * personnaliser la salutation en mode contournement — sans utilisateur
 * réel, `useMyProfile()` ne renvoie rien.
 */
export const devBypassFirstNameAtom = atom<string>('');

import { Stack } from 'expo-router';

/**
 * Chaque étape est une route à part, empilée : la pile de navigation fait
 * donc office d'historique du parcours, et le retour arrière est gratuit.
 *
 * `gestureEnabled` est déjà le défaut sur iOS mais pas sur Android — on
 * l'active explicitement pour que le swipe gauche → droite ramène à l'étape
 * précédente sur les deux plateformes. Sans effet en web, où le geste
 * n'existe pas : c'est le bouton retour qui prend le relais.
 *
 * Le paywall (1g) n'est plus une route ici : il s'affiche en pop-up
 * (composant `Modal`) par-dessus la réassurance, voir
 * `src/components/onboarding/paywall-modal.tsx`. Une route avec
 * `presentation: 'modal'` a été essayée d'abord, mais casse la navigation
 * suivante sur web (l'écran ouvert juste après reste caché derrière le
 * paywall) — pas fiable pour un projet qui tourne aussi en web.
 *
 * `bienvenue` (4 slides de présentation, demande explicite) est désormais
 * le premier écran du groupe — avant `index` (« Qui vous accompagne… »,
 * étape 1/6). Hors du décompte « Étape X sur 6 », ce n'est pas une étape du
 * formulaire, juste une introduction skippable.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      initialRouteName="bienvenue"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    />
  );
}

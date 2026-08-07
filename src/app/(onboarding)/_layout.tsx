import { Stack } from 'expo-router';

/**
 * Chaque étape est une route à part, empilée : la pile de navigation fait
 * donc office d'historique du parcours, et le retour arrière est gratuit.
 *
 * `gestureEnabled` est déjà le défaut sur iOS mais pas sur Android — on
 * l'active explicitement pour que le swipe gauche → droite ramène à l'étape
 * précédente sur les deux plateformes. Sans effet en web, où le geste
 * n'existe pas : c'est le bouton retour qui prend le relais.
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    />
  );
}

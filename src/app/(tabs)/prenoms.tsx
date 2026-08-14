import { PremiumLockedScreen } from '@/components/hub/premium-locked-screen';

// Aperçu des 4 catégories du jeu — contenu réel hors périmètre MVP, ces
// blocs ne sont que la vitrine derrière le paywall (même traitement que
// `/bebe`, demande explicite « exactement le même concept »).
const PRENOMS_MODULES = [
  { emoji: '👧', label: 'Prénoms filles' },
  { emoji: '👦', label: 'Prénoms garçons' },
  { emoji: '💚', label: 'Vos matchs' },
  { emoji: '⭐', label: 'Favoris' },
];

/**
 * Écran d'accès « Le match des prénoms » (mini-jeu premium, hors MVP — voir
 * DOCS/versions/MVP.md). Ouvert depuis la carte teaser d'Organisation &
 * Préparation. Structure partagée avec `/bebe` — voir
 * `PremiumLockedScreen`.
 */
export default function PrenomsScreen() {
  return (
    <PremiumLockedScreen
      title="Le match des prénoms"
      image={require('@/assets/images/Heart_girls_boys.png')}
      description="Swipez chacun de votre côté et découvrez les prénoms sur lesquels vous êtes tombés d'accord."
      paywallTitle="Débloquez le match des prénoms"
      modules={PRENOMS_MODULES}
    />
  );
}

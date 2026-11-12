import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { SparkLines } from '@/components/ui/glass-card';

/**
 * Deux cartes à jouer penchées (cœur, étoile) avec petits traits — évoque
 * le jeu du match des prénoms (capture de référence). Composée de vues et
 * d'icônes, faute d'illustration dédiée.
 *
 * Partagée entre la carte « Le match des prénoms » d'Organisation et le
 * paywall « Débloquez le match des prénoms », pour qu'elles soient raccord
 * (demande explicite). `scale` l'agrandit proportionnellement (paywall).
 */
export function NameCardsIllustration({ scale = 1 }: { scale?: number }) {
  const card = (
    rotate: string,
    left: number,
    top: number,
    background: string,
    icon: 'heart' | 'star',
    color: string,
  ) => (
    <View
      style={{
        position: 'absolute',
        left: left * scale,
        top: top * scale,
        width: 40 * scale,
        height: 48 * scale,
        borderRadius: 10 * scale,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <Ionicons name={icon} size={20 * scale} color={color} />
    </View>
  );

  return (
    <View
      pointerEvents="none"
      style={{ width: 82 * scale, height: 64 * scale }}
    >
      {card('-14deg', 4, 10, '#fdf7fb', 'heart', '#f08aa8')}
      {card('10deg', 36, 6, '#fdf3dc', 'star', '#f2b84b')}
      <SparkLines
        color="#8fd3c0"
        style={{
          left: 30 * scale,
          top: -14 * scale,
          transform: [{ scale: 0.8 * scale }],
        }}
      />
    </View>
  );
}

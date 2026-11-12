import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Image, type ImageSourcePropType, View } from 'react-native';

import { SparkLines } from '@/components/ui/glass-card';
import { hexToRgba } from '@/lib/color';

/**
 * Petite illustration de tête de modale : un pictogramme (emoji ou icône,
 * passé en `children`) sur une tache d'accent aux coins irréguliers, avec
 * feuille, cœur et petits traits. Composée faute d'illustrations dédiées —
 * modales d'ajout des suivis bébé et des informations importantes.
 *
 * Avec `image` (icône 3D qui a déjà sa tuile, ex. suivis bébé) : l'icône
 * remplace tache et feuille — sinon on verrait une tuile dans une tache —
 * et garde le cœur et les petits traits.
 */
export function BlobIllustration({
  accent,
  size = 76,
  image,
  children,
}: {
  accent: string;
  size?: number;
  image?: ImageSourcePropType;
  children?: ReactNode;
}) {
  if (image) {
    return (
      <View pointerEvents="none" style={{ width: size, height: size }}>
        <Image
          source={image}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
        <Ionicons
          name="heart"
          size={size * 0.18}
          color="#f08aa8"
          style={{ position: 'absolute', right: -2, top: 0 }}
        />
        <SparkLines
          color={hexToRgba(accent, 0.55)}
          style={{ left: -12, top: -12, transform: [{ rotate: '-70deg' }] }}
        />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          borderTopLeftRadius: size * 0.53,
          borderTopRightRadius: size * 0.45,
          borderBottomRightRadius: size * 0.53,
          borderBottomLeftRadius: size * 0.4,
          backgroundColor: hexToRgba(accent, 0.12),
        }}
      />
      <Ionicons
        name="leaf"
        size={size * 0.32}
        color={hexToRgba(accent, 0.35)}
        style={{
          position: 'absolute',
          left: 2,
          bottom: 4,
          transform: [{ rotate: '-30deg' }],
        }}
      />
      <View className="flex-1 items-center justify-center">{children}</View>
      <Ionicons
        name="heart"
        size={size * 0.18}
        color="#f08aa8"
        style={{ position: 'absolute', right: 2, top: 6 }}
      />
      <SparkLines
        color={hexToRgba(accent, 0.55)}
        style={{ left: -10, top: -10, transform: [{ rotate: '-70deg' }] }}
      />
    </View>
  );
}

import { type ImageSourcePropType, Text, View } from 'react-native';

import {
  CardWave,
  ChevronBubble,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  GlassCard,
  IconTile,
} from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

/** Rouge des rappels, celui des numéros d'urgence des contacts. */
const URGENT_RED = '#d64545';

/**
 * Carte d'un des 3 piliers (et d'« Organisation & Préparation », juste
 * dessous). Toutes ont volontairement le **même poids visuel** (CONCEPT.md :
 * « exactement 3 piliers de même poids visuel ») : même taille, même
 * structure, même tuile d'icône teintée d'accent.
 *
 * Habillage repris des cartes de `/bebe` (demande explicite) : verre dépoli,
 * vague pastel, chevron en pastille. Seule la teinte de la vague
 * (`waveColor`) change d'une carte à l'autre, à intensité égale — elle aide
 * à les distinguer sans en mettre une en avant.
 *
 * `state` est un état contextuel — ce qu'il y a à faire maintenant — et non
 * une description de la section.
 *
 * `id` sert à nommer les dégradés SVG de la vague : unique par carte.
 *
 * `isStateUrgent` passe l'état en rouge, comme rappel (« Prochain
 * rendez-vous » la veille et le jour du rendez-vous, demande explicite).
 */
export function PillarCard({
  id,
  emoji,
  image,
  imageFillsTile,
  title,
  state,
  isStateUrgent = false,
  waveColor,
  onPress,
}: {
  id: string;
  emoji: string;
  /** Illustration à la place de l'émoji, quand la section en a une. */
  image?: ImageSourcePropType;
  /** L'illustration a sa propre tuile : voir `IconTile`. */
  imageFillsTile?: boolean;
  title: string;
  state: string;
  isStateUrgent?: boolean;
  waveColor: string;
  onPress: () => void;
}) {
  const accent = useThemeAccent();

  return (
    <GlassCard
      accessibilityLabel={`${title} — ${state}`}
      accent={accent}
      onPress={onPress}
    >
      <CardWave id={`pillar-wave-${id}`} color={waveColor} height={40} />
      <View className="flex-row items-center gap-3.5 p-4">
        <IconTile
          emoji={emoji}
          image={image}
          imageFillsTile={imageFillsTile}
          tint={hexToRgba(accent, 0.12)}
          size={52}
        />
        <View className="flex-1 gap-0.5">
          <Text
            className="text-[16.5px] font-bold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {title}
          </Text>
          <Text
            className={`text-[12.5px] leading-4 ${
              isStateUrgent ? 'font-semibold' : ''
            }`}
            style={{ color: isStateUrgent ? URGENT_RED : GLASS_BODY_COLOR }}
          >
            {state}
          </Text>
        </View>
        <ChevronBubble accent={accent} />
      </View>
    </GlassCard>
  );
}

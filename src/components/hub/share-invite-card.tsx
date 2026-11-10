import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
  SPARKS_ABOVE,
  SparkLines,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';

const LILAC = '#8b7fd4';
const HEART_PINK = '#f08aa8';

/**
 * Un téléphone penché avec un avatar : deux d'entre eux, l'un contre
 * l'autre, illustrent le partage à deux. Composé de vues et d'icônes,
 * aucune illustration de ce type n'existant dans les assets.
 */
function Phone({
  color,
  rotate,
  style,
}: {
  color: string;
  rotate: string;
  style: object;
}) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          width: 50,
          height: 84,
          borderRadius: 12,
          borderWidth: 3,
          borderColor: color,
          backgroundColor: lightenHex(color, 0.38),
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate }],
          shadowColor: color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
        },
        style,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          top: 5,
          width: 14,
          height: 3,
          borderRadius: 2,
          backgroundColor: hexToRgba(color, 0.5),
        }}
      />
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: hexToRgba(color, 0.18),
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="person" size={18} color={color} />
      </View>
    </View>
  );
}

function SharingIllustration({ accent }: { accent: string }) {
  return (
    <View pointerEvents="none" style={{ width: 104, height: 112 }}>
      <View
        style={{
          position: 'absolute',
          left: 4,
          top: 14,
          width: 96,
          height: 90,
          borderRadius: 48,
          backgroundColor: hexToRgba(accent, 0.08),
        }}
      />
      <Phone color={LILAC} rotate="-14deg" style={{ left: 8, top: 20 }} />
      <Phone color={accent} rotate="12deg" style={{ left: 48, top: 14 }} />
      <Ionicons
        name="heart"
        size={20}
        color={HEART_PINK}
        style={{ position: 'absolute', left: 42, top: -4 }}
      />
      <SparkLines
        color={hexToRgba(accent, 0.55)}
        sparks={SPARKS_ABOVE}
        style={{ left: 6, top: -8, transform: [{ rotate: '-30deg' }] }}
      />
      <Svg
        width={70}
        height={8}
        viewBox="0 0 70 8"
        style={{ position: 'absolute', left: 20, bottom: 0 }}
      >
        <Path
          d="M3 6 C 22 1, 48 1, 67 5"
          stroke={hexToRgba(accent, 0.3)}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </View>
  );
}

/**
 * Bloc « Partager vos infos à deux » du hub, tant que le co-parent n'a pas
 * rejoint l'espace. Habillage d'après une capture de référence (demande
 * explicite) : illustration de deux téléphones à gauche, texte à droite
 * séparé par un filet, puis bouton principal en gélule (`PillButton`, même
 * style que le reste de l'app) et lien « Comment ça marche ? ».
 *
 * Le bouton passe sous le texte (et non à droite de l'illustration comme
 * sur la capture, cadrée large) : sur un écran de téléphone, la colonne de
 * droite serait trop étroite pour un bouton lisible.
 */
export function ShareInviteCard({
  onAddPartner,
  onHowItWorks,
}: {
  onAddPartner: () => void;
  onHowItWorks: () => void;
}) {
  const accent = useThemeAccent();

  return (
    <View
      className="gap-4 rounded-[28px] px-4 pb-3 pt-5"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 4,
      }}
    >
      <View className="flex-row items-center gap-3.5">
        <SharingIllustration accent={accent} />
        <View
          className="w-px self-stretch"
          style={{ backgroundColor: hexToRgba(accent, 0.12) }}
        />
        <View className="flex-1 gap-1.5 pr-3">
          <Text
            className="text-[17px] font-extrabold leading-[22px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.3 }}
          >
            Partager vos infos à deux
          </Text>
          <Text
            className="text-[13px] leading-[18px]"
            style={{ color: GLASS_BODY_COLOR }}
          >
            Ajoutez le co-parent ou un proche, tout se synchronisera en temps
            réel.
          </Text>
        </View>
      </View>

      <PillButton
        label="Ajouter le co-parent"
        icon="people-outline"
        size="compact"
        onPress={onAddPartner}
      />

      <Pressable
        accessibilityRole="button"
        onPress={onHowItWorks}
        className="flex-row items-center justify-center gap-1 py-1"
      >
        <Text className="text-[14px] font-semibold" style={{ color: accent }}>
          Comment ça marche ?
        </Text>
        <Ionicons name="chevron-forward" size={15} color={accent} />
      </Pressable>
    </View>
  );
}

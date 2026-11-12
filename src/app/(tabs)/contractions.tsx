import { Image, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ContractionAssistant } from '@/components/contractions/contraction-assistant';
import { PremiumLockedScreen } from '@/components/hub/premium-locked-screen';
import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const VALISE_IMAGE = require('@/assets/images/Valise_maternite.png');

const DESCRIPTION =
  'Chronométrez vos contractions à deux, suivez leur rythme et sachez quand prendre la route de la maternité.';

/**
 * « Assistant Contractions & Départ Maternité » (demande explicite),
 * ouvert depuis Organisation & Préparation. Premium comme « Le match des
 * prénoms » (demande explicite) : même écran d'accès verrouillé
 * (`PremiumLockedScreen`, paiement hors MVP) — le paywall s'ouvre à chaque
 * arrivée, le fermer révèle l'assistant.
 */
export default function ContractionsScreen() {
  const accent = useThemeAccent();

  return (
    <PremiumLockedScreen
      title="Assistant contractions"
      image={VALISE_IMAGE}
      description={DESCRIPTION}
      paywallTitle="Débloquez l’assistant contractions"
      header={<ContractionsHeader accent={accent} />}
      gridContent={({ isPaywallVisible }) => (
        <ContractionAssistant canShowDeparture={!isPaywallVisible} />
      )}
    />
  );
}

/** En-tête au gabarit du match des prénoms : titre souligné, valise penchée. */
function ContractionsHeader({ accent }: { accent: string }) {
  return (
    <View className="gap-4">
      <View className="min-h-[118px] justify-center">
        <Image
          source={VALISE_IMAGE}
          style={{
            position: 'absolute',
            top: -14,
            right: -18,
            width: 160,
            height: 124,
            transform: [{ rotate: '6deg' }],
          }}
          resizeMode="contain"
        />
        <View className="gap-2" style={{ maxWidth: '62%' }}>
          <Text
            className="text-[29px] font-extrabold leading-[35px]"
            style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.7 }}
          >
            Contractions & départ
          </Text>
          <Svg width={120} height={10} viewBox="0 0 120 10">
            <Path
              d="M3 7 C 34 2, 80 1.5, 117 4"
              stroke={hexToRgba(accent, 0.5)}
              strokeWidth={3}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
      </View>
      <Text
        className="text-[14.5px] leading-[21px]"
        style={{ color: GLASS_BODY_COLOR }}
      >
        {DESCRIPTION}
      </Text>
    </View>
  );
}

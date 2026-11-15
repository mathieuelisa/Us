import { Ionicons } from '@expo/vector-icons';
import { Image, View } from 'react-native';

/**
 * Illustration de la carte « Assistant contractions » : la valise de
 * maternité (illustration de l'app) et un chronomètre en pastille, au
 * gabarit de `NameCardsIllustration`. Partagée entre Organisation et la
 * page Premium.
 */
export function ContractionsIllustration() {
  return (
    <View pointerEvents="none" style={{ width: 82, height: 64 }}>
      <Image
        source={require('@/assets/images/Valise_maternite.png')}
        style={{ position: 'absolute', left: 0, top: 2, width: 74, height: 58 }}
        resizeMode="contain"
      />
      <View
        className="absolute h-8 w-8 items-center justify-center rounded-full bg-white"
        style={{
          right: 0,
          bottom: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <Ionicons name="timer" size={18} color="#e8739a" />
      </View>
    </View>
  );
}

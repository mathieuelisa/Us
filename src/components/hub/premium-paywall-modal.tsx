import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { PremiumOffer } from '@/components/hub/premium-offer';
import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { lightenHex } from '@/lib/color';

/**
 * Paywall des écrans d'accès premium (`/bebe`, `/prenoms`) — variante
 * centrée du `PaywallModal` de l'onboarding (qui, lui, glisse depuis le
 * bas) : demande explicite d'une « modale centrale » avec un bouton dédié
 * pour la fermer, plutôt qu'un lien texte « Plus tard ». S'ouvre
 * automatiquement à l'arrivée sur l'écran.
 *
 * Habillage clair d'après une capture de référence (demande explicite),
 * à la place de l'ancien fond vert sombre et or. Le contenu (`PremiumOffer`)
 * est partagé avec la page `/premium`. Il suit la couleur du thème, comme
 * le reste de l'app.
 *
 * `title`/`image` varient par écran (demande explicite « exactement le même
 * concept » pour « Le match des prénoms » que pour « Votre bébé ») ; la
 * liste de fonctionnalités reste la même partout — un seul paiement
 * débloque tout le bundle premium, pas une fonctionnalité isolée.
 */
export function PremiumPaywallModal({
  visible,
  onClose,
  title,
  image,
  illustration,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  image: ImageSourcePropType;
  /** Voir `PremiumOffer` : remplace `image` dans l'offre. */
  illustration?: ReactNode;
}) {
  const accent = useThemeAccent();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-5">
        <View
          className="max-h-[88%] w-full overflow-hidden rounded-[32px] bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.2,
            shadowRadius: 30,
            elevation: 12,
          }}
        >
          {/* Taches pâles aux coins, rognées par leur propre cadre. */}
          <View
            pointerEvents="none"
            className="absolute inset-0 overflow-hidden"
          >
            <View
              style={{
                position: 'absolute',
                top: -80,
                right: -70,
                width: 230,
                height: 210,
                borderRadius: 115,
                backgroundColor: lightenHex(accent, 0.55),
                opacity: 0.35,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -90,
                left: -80,
                width: 220,
                height: 200,
                borderRadius: 110,
                backgroundColor: lightenHex(accent, 0.55),
                opacity: 0.3,
              }}
            />
          </View>

          <Pressable
            accessibilityLabel="Fermer"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}
            className="absolute right-4 top-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: accent,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.16,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Ionicons name="close" size={20} color={GLASS_TITLE_COLOR} />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4 px-5 pb-6 pt-5"
          >
            <PremiumOffer
              title={title}
              image={image}
              illustration={illustration}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

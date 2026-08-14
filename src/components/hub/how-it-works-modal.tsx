import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';

const STEPS = [
  'Cliquer sur « Ajouter le co-parent »',
  'Partager-lui le code à 6 chiffres ou le QR code',
  'La personne installe l’application et intègre le code à l’ouverture',
];

/**
 * Pop-up « Comment ça marche ? » du bloc d'invitation (hub).
 *
 * ⚠️ Texte fourni tel quel par l'utilisateur, décrit un parcours code à 6
 * chiffres / QR code qui **n'existe pas encore** : le mécanisme réel est
 * un email + lien magique envoyé pendant l'onboarding (`invitePartner()`),
 * et le bouton « Ajouter le co-parent » ne fait d'ailleurs qu'ouvrir
 * l'écran « Mon partenaire » sans envoyer quoi que ce soit — voir le point
 * ouvert n°31 de DOCS/05-DETTE-ET-POINTS-OUVERTS.md. Cette pop-up décrit
 * donc la cible produit, pas le comportement actuel ; à corriger dès que
 * le vrai mécanisme d'invitation post-onboarding est tranché.
 *
 * `animationType="none"` sur `Modal` (demande explicite) : le fond opaque
 * doit apparaître instantanément, sans glisser avec le reste — seule la
 * carte anime (`SlideInDown`/`SlideOutDown`, Reanimated). `Modal` démonte
 * réellement ses enfants quand `visible` passe à `false` (son `render()`
 * renvoie `null`), donc l'animation d'entrée se rejoue bien à chaque
 * ouverture.
 */
export function HowItWorksModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(300)}
          className="gap-5 rounded-t-[24px] bg-white px-6 pb-8 pt-4"
        >
          <View className="h-1 w-10 self-center rounded-full bg-[#e0e0e0]" />

          <Text className="text-[18px] font-bold text-[#1a1a1a]">
            Comment ça marche ?
          </Text>

          <View className="gap-4">
            {STEPS.map((step, index) => (
              <View key={step} className="flex-row items-start gap-3">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-accent">
                  <Text className="text-[12px] font-bold text-accent-foreground">
                    {index + 1}
                  </Text>
                </View>
                <Text className="flex-1 text-[14px] leading-5 text-[#1a1a1a]">
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="items-center rounded-full bg-accent py-3"
          >
            <Text className="text-[15px] font-medium text-accent-foreground">
              Compris
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

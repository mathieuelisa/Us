import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Modal, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { GLASS_TITLE_COLOR, SparkLines } from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const LILAC = '#8b7fd4';
const HEART_PINK = '#f08aa8';

/**
 * Étapes : texte fourni tel quel par l'utilisateur, plus une icône chacune
 * (pur repère visuel). `badge` ajoute une pastille d'accent sur l'icône.
 */
const STEPS: { text: string; icon: IoniconName; badge?: IoniconName }[] = [
  {
    text: 'Cliquer sur « Ajouter votre partenaire »',
    icon: 'person-outline',
    badge: 'add',
  },
  {
    text: 'Partager-lui le code à 6 chiffres ou le QR code',
    icon: 'qr-code-outline',
  },
  {
    text: 'La personne installe l’application et intègre le code à l’ouverture',
    icon: 'phone-portrait-outline',
    badge: 'checkmark',
  },
];

/**
 * Téléphone avec avatar et coche validée, sur une tache d'accent, avec
 * feuille, cœur et petits traits. Composé de vues et d'icônes : aucune
 * illustration de ce type n'existe dans les assets.
 */
function ConnectedPhoneIllustration({ accent }: { accent: string }) {
  return (
    <View pointerEvents="none" style={{ width: 112, height: 124 }}>
      <View
        style={{
          position: 'absolute',
          left: 6,
          top: 10,
          width: 104,
          height: 108,
          borderTopLeftRadius: 60,
          borderTopRightRadius: 48,
          borderBottomRightRadius: 56,
          borderBottomLeftRadius: 44,
          backgroundColor: hexToRgba(accent, 0.08),
        }}
      />
      <Ionicons
        name="leaf"
        size={40}
        color={hexToRgba(accent, 0.3)}
        style={{
          position: 'absolute',
          right: -6,
          bottom: 8,
          transform: [{ rotate: '25deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 30,
          top: 14,
          width: 58,
          height: 98,
          borderRadius: 14,
          borderWidth: 3,
          borderColor: LILAC,
          backgroundColor: '#f6f4fd',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transform: [{ rotate: '6deg' }],
          shadowColor: LILAC,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: hexToRgba(accent, 0.14),
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="person" size={20} color={accent} />
        </View>
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="checkmark" size={14} color="#ffffff" />
        </View>
      </View>
      <Ionicons
        name="heart"
        size={20}
        color={HEART_PINK}
        style={{ position: 'absolute', right: 6, top: 0 }}
      />
      <SparkLines
        color={hexToRgba(accent, 0.6)}
        style={{ left: 2, top: 0, transform: [{ rotate: '-70deg' }] }}
      />
    </View>
  );
}

function StepRow({
  index,
  step,
  accent,
}: {
  index: number;
  step: (typeof STEPS)[number];
  accent: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(accent, 0.1) }}
      >
        <Text className="text-[15px] font-extrabold" style={{ color: accent }}>
          {index + 1}
        </Text>
      </View>
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: hexToRgba(accent, 0.07) }}
      >
        <Ionicons name={step.icon} size={24} color={GLASS_TITLE_COLOR} />
        {step.badge ? (
          <View
            className="absolute bottom-1.5 right-1.5 h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white"
            style={{ backgroundColor: accent }}
          >
            <Ionicons name={step.badge} size={10} color="#ffffff" />
          </View>
        ) : null}
      </View>
      <Text
        className="flex-1 text-[14.5px] leading-5"
        style={{ color: GLASS_TITLE_COLOR }}
      >
        {step.text}
      </Text>
    </View>
  );
}

/**
 * Pop-up « Comment ça marche ? » du bloc d'invitation (hub).
 *
 * Habillage d'après une capture de référence (demande explicite) : grand
 * titre souligné, téléphone validé en illustration, étapes en trois
 * colonnes (numéro dans un rond teinté, tuile d'icône, texte), bouton
 * « Compris » en gélule (`PillButton`).
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
  const accent = useThemeAccent();

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
          className="gap-6 overflow-hidden rounded-t-[32px] bg-white px-6 pb-10 pt-4"
        >
          {/* Tache pâle en haut à droite, derrière l'illustration. */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: -60,
              right: -70,
              width: 240,
              height: 220,
              borderRadius: 120,
              backgroundColor: lightenHex(accent, 0.55),
              opacity: 0.35,
            }}
          />

          <View className="h-1.5 w-12 self-center rounded-full bg-[#e6e6ea]" />

          <View className="flex-row items-center justify-between">
            <View className="flex-1 gap-2 pr-2">
              <Text
                className="text-[26px] font-extrabold leading-8"
                style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.5 }}
              >
                Comment ça marche ?
              </Text>
              <Svg width={120} height={12} viewBox="0 0 120 12">
                <Path
                  d="M4 8 C 36 3, 82 2, 116 5"
                  stroke={hexToRgba(accent, 0.45)}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </View>
            <ConnectedPhoneIllustration accent={accent} />
          </View>

          <View className="gap-4">
            {STEPS.map((step, index) => (
              <StepRow
                key={step.text}
                index={index}
                step={step}
                accent={accent}
              />
            ))}
          </View>

          <View className="mt-1">
            <PillButton label="Compris" onPress={onClose} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

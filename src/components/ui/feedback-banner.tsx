import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import { hexToRgba } from '@/lib/color';

const ERROR_RED = '#d14b3a';

export type FeedbackBannerTone = 'success' | 'error';

/**
 * Bandeau de confirmation posé en haut de l'écran : il glisse depuis le
 * haut, puis repart. Sert à dire « c'est pris en compte » après un
 * enregistrement, sans bloquer l'écran ni naviguer ailleurs (première
 * utilisation : prénom de l'écran Profil).
 *
 * Purement visuel : c'est l'appelant qui décide quand l'afficher et quand
 * le retirer (`message` à `null`), en général après 2 à 3 secondes. Monté
 * en `absolute` : à placer en dernier enfant du conteneur de l'écran.
 * `accessibilityLiveRegion` / `role="alert"` pour que le message soit lu par
 * les lecteurs d'écran.
 */
export function FeedbackBanner({
  message,
  tone = 'success',
  accent,
}: {
  message: string | null;
  tone?: FeedbackBannerTone;
  accent: string;
}) {
  if (!message) return null;

  const color = tone === 'success' ? accent : ERROR_RED;

  return (
    <Animated.View
      entering={FadeInUp.duration(260)}
      exiting={FadeOutUp.duration(220)}
      pointerEvents="none"
      className="absolute left-5 right-5 top-3 z-10"
    >
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-3 rounded-full py-2.5 pl-2.5 pr-5"
        style={{
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: hexToRgba(color, 0.18),
          shadowColor: color,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.16,
          shadowRadius: 20,
          elevation: 6,
        }}
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: color }}
        >
          <Ionicons
            name={tone === 'success' ? 'checkmark' : 'alert'}
            size={19}
            color="#ffffff"
          />
        </View>
        <Text
          className="flex-1 text-[14.5px] font-semibold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

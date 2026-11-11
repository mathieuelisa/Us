import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import { hexToRgba } from '@/lib/color';

const ERROR_RED = '#d14b3a';

export type FeedbackBannerTone = 'success' | 'error';

export type Feedback = { tone: FeedbackBannerTone; message: string };

/** Durée d'affichage par défaut d'un bandeau. */
export const FEEDBACK_DURATION_MS = 2500;

/**
 * État d'un `FeedbackBanner` : `showFeedback()` l'affiche puis le retire
 * seul après `durationMs`. Un nouvel appel remplace le précédent et relance
 * le délai. `feedback` sert aussi à l'appelant pour l'état « Enregistré » de
 * son bouton pendant le même laps de temps.
 */
export function useFeedbackBanner(durationMs = FEEDBACK_DURATION_MS) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showFeedback = useCallback(
    (tone: FeedbackBannerTone, message: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setFeedback({ tone, message });
      timeoutRef.current = setTimeout(() => {
        setFeedback(null);
        timeoutRef.current = null;
      }, durationMs);
    },
    [durationMs],
  );

  return { feedback, showFeedback };
}

/**
 * Bandeau de confirmation posé en haut de l'écran : il glisse depuis le
 * haut, puis repart. Sert à dire « c'est pris en compte » après un
 * enregistrement, sans bloquer l'écran ni naviguer ailleurs (première
 * utilisation : prénom de l'écran Profil, puis Journal des symptômes).
 *
 * Purement visuel : l'état vit dans `useFeedbackBanner()`, qui l'affiche et
 * le retire après 2,5 s. Monté
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

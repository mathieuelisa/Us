import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import type { Household } from '@/features/household/api';
import { useMyProfile } from '@/features/profile/hooks';
import { useThemeAccent } from '@/features/settings/hooks';
import { useMyWeekCheckins } from '@/features/together/hooks';
import {
  claimMoodNudgeSlot,
  currentMoodNudgeSlot,
} from '@/features/together/mood-nudge';
import { sessionAtom } from '@/lib/atoms/session';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

/** Durée d'affichage du toast avant qu'il reparte seul. */
const VISIBLE_MS = 8000;

/**
 * Toast « Comment vous sentez-vous ? » de l'accueil (demande explicite du
 * 2026-11-15) : à l'ouverture de l'app sur l'accueil, si l'humeur du jour
 * n'est pas encore remplie, au plus une fois par créneau (9h, 14h, 19h —
 * `currentMoodNudgeSlot`). Pour chacun des deux parents, sur sa propre
 * humeur. Remplace l'ancien rappel du téléphone de 20h ; coupable dans
 * Réglages (`profiles.notify_mood_reminder`).
 *
 * Toucher le toast ouvre l'écran d'humeur (`/ensemble`) ; la croix le
 * ferme. Il repart seul après 8 s, et dès que l'humeur est remplie.
 * Monté en `absolute` : à placer en dernier enfant du conteneur de l'écran.
 */
export function MoodNudgeToast({
  household,
}: {
  household: Household | null | undefined;
}) {
  const accent = useThemeAccent();
  const userId = useAtomValue(sessionAtom)?.user.id;
  const { data: profile } = useMyProfile();
  const checkinsQuery = useMyWeekCheckins(household);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasCheckedInToday = Boolean(checkinsQuery.data?.[todayIso()]);
  const isEnabled = profile?.notify_mood_reminder ?? false;
  const isReady = Boolean(userId && household) && checkinsQuery.isSuccess;
  const isSolo = household?.accompaniment_type === 'seul';

  const hide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
    setIsVisible(false);
  }, []);

  const maybeShow = useCallback(async () => {
    if (!isReady || !isEnabled || hasCheckedInToday || !userId) return;
    const slot = currentMoodNudgeSlot();
    if (!slot) return;
    if (!(await claimMoodNudgeSlot(userId, slot))) return;
    setIsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(hide, VISIBLE_MS);
  }, [isReady, isEnabled, hasCheckedInToday, userId, hide]);

  // Arrivée sur l'accueil : les onglets restent montés, un simple effet au
  // montage ne suffirait pas. Quitter l'accueil retire le toast.
  const [isFocused, setIsFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        hide();
      };
    }, [hide]),
  );

  // Accueil affiché : dès que les données sont prêtes, et à chaque retour
  // dans l'app. Le créneau réservé empêche un second affichage.
  useEffect(() => {
    if (!isFocused) return;
    maybeShow();
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') maybeShow();
    });
    return () => subscription.remove();
  }, [isFocused, maybeShow]);

  // Humeur remplie entre-temps (ici, ou depuis un autre écran) : on retire.
  useEffect(() => {
    if (hasCheckedInToday) hide();
  }, [hasCheckedInToday, hide]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(280)}
      exiting={FadeOutUp.duration(220)}
      className="absolute left-5 right-5 top-3 z-10"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Partager mon humeur du jour"
        accessibilityLiveRegion="polite"
        onPress={() => {
          hide();
          router.push('/ensemble');
        }}
        className="flex-row items-center gap-3 rounded-[24px] py-3 pl-3 pr-2"
        style={{
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: hexToRgba(accent, 0.18),
          shadowColor: accent,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.16,
          shadowRadius: 20,
          elevation: 6,
        }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: accent }}
        >
          <Ionicons name="happy-outline" size={22} color="#ffffff" />
        </View>
        <View className="flex-1 gap-0.5">
          <Text
            className="text-[14.5px] font-bold"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            Comment vous sentez-vous ?
          </Text>
          <Text className="text-[12.5px]" style={{ color: GLASS_BODY_COLOR }}>
            {isSolo
              ? 'Un tap pour noter votre humeur du jour.'
              : 'Un tap pour partager votre humeur du jour.'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le rappel"
          hitSlop={10}
          onPress={hide}
          className="h-8 w-8 items-center justify-center rounded-full"
        >
          <Ionicons name="close" size={18} color={GLASS_BODY_COLOR} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

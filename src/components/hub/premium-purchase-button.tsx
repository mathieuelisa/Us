import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { GLASS_BODY_COLOR, SparkLines } from '@/components/ui/glass-card';
import {
  getPremiumPaymentErrorMessage,
  isStripeConfigured,
} from '@/features/premium/api';
import {
  type PurchaseOutcome,
  useIsPremium,
  usePremiumPurchase,
} from '@/features/premium/hooks';
import { isPaymentSheetSupported } from '@/features/premium/payment-sheet';
import { useThemeAccent } from '@/features/settings/hooks';
import type { TranslationKey } from '@/i18n/types';
import { hexToRgba, lightenHex } from '@/lib/color';

const OUTCOME_MESSAGES: Partial<Record<PurchaseOutcome, TranslationKey>> = {
  pending: 'premium.purchase.pending',
  canceled: 'premium.purchase.canceled',
};

/**
 * Bouton d'achat du premium (paiement dans l'app, Stripe PaymentSheet —
 * parcours retenu le 2026-11-15, demande explicite). Gélule d'accent, même
 * dessin que l'ancien bouton inerte de `PremiumOffer`.
 *
 * États :
 *   - foyer déjà premium : « Premium actif », non cliquable ;
 *   - web : le formulaire Stripe natif n'existe pas, achat sur mobile ;
 *   - paiement en cours : indicateur, bouton désactivé ;
 *   - sinon : « Débloquer — 14,99 € ».
 *
 * Un achat réussi fait passer `useIsPremium` à vrai : les paywalls des
 * écrans premium se ferment d'eux-mêmes, chez l'acheteur comme chez l'autre
 * parent (Realtime).
 */
export function PremiumPurchaseButton({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const accent = useThemeAccent();
  const { isPremium } = useIsPremium();
  const purchase = usePremiumPurchase();
  const [message, setMessage] = useState<string | null>(null);

  const height = compact ? 48 : 54;
  const fontSize = compact ? 15 : 16;
  const canBuy =
    !isPremium &&
    isPaymentSheetSupported &&
    isStripeConfigured &&
    !purchase.isPending;

  const label = isPremium
    ? t('premium.purchase.active')
    : !isPaymentSheetSupported
      ? t('premium.purchase.mobileOnly')
      : purchase.isPending
        ? t('premium.purchase.processing')
        : t('premium.purchase.unlock');
  const icon = isPremium ? 'checkmark-circle' : 'lock-open-outline';

  const onPress = () => {
    setMessage(null);
    purchase.mutate(undefined, {
      onSuccess: (outcome) => {
        const key = OUTCOME_MESSAGES[outcome];
        setMessage(key ? t(key) : null);
      },
      onError: (error) => setMessage(getPremiumPaymentErrorMessage(error)),
    });
  };

  return (
    <View className={compact ? 'gap-2' : 'mt-1 gap-2'}>
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled: !canBuy, busy: purchase.isPending }}
          disabled={!canBuy}
          onPress={onPress}
          className="flex-row items-center justify-center gap-2.5 overflow-hidden rounded-full"
          style={{
            height,
            backgroundColor: accent,
            opacity: canBuy || isPremium ? 1 : 0.6,
            shadowColor: accent,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 18,
            elevation: 4,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -30,
              top: -20,
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: lightenHex(accent, 0.12),
              opacity: 0.6,
            }}
          />
          {purchase.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name={icon} size={20} color="#ffffff" />
          )}
          <Text className="font-bold text-white" style={{ fontSize }}>
            {label}
          </Text>
        </Pressable>
        {canBuy ? (
          <SparkLines
            color={hexToRgba(accent, 0.6)}
            style={{ right: -6, top: -20 }}
          />
        ) : null}
      </View>

      {message ? (
        <Text
          className="text-center text-[12.5px]"
          style={{ color: GLASS_BODY_COLOR }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

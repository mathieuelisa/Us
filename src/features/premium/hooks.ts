import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useMyHousehold } from '@/features/household/hooks';
import { queryKeys } from '@/lib/query/keys';
import { createPaymentSheetIntent, fetchEntitlement } from './api';
import { payWithPaymentSheet } from './payment-sheet';

/** Droit premium du foyer courant (`null` : pas de premium). */
export function useHouseholdEntitlement() {
  const { data: household } = useMyHousehold();
  const householdId = household?.id;

  return useQuery({
    queryKey: queryKeys.premium.entitlement(householdId ?? ''),
    queryFn: () => fetchEntitlement(householdId as string),
    enabled: Boolean(householdId),
  });
}

/**
 * Le foyer a-t-il le premium ? Porté par le foyer : vrai pour les deux
 * parents, quel que soit celui qui a payé. `isLoading` tant que la réponse
 * n'est pas connue, pour ne pas montrer le paywall à un foyer premium le
 * temps du chargement.
 *
 * Ce n'est qu'un confort d'affichage : la vraie barrière est en base
 * (`has_premium()` dans les policies des tables premium).
 */
export function useIsPremium() {
  const { data: household, isLoading: isHouseholdLoading } = useMyHousehold();
  const entitlement = useHouseholdEntitlement();

  return {
    isPremium: Boolean(entitlement.data),
    isLoading:
      isHouseholdLoading || (Boolean(household) && entitlement.isLoading),
  };
}

const POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 1500;

/**
 * Le droit premium arrive par le webhook Stripe, quelques secondes après le
 * paiement : on relit la base jusqu'à le voir apparaître. `false` si le
 * webhook n'est pas passé à temps — le Realtime (`household_entitlements`)
 * mettra l'écran à jour dès qu'il arrivera.
 */
async function waitForEntitlement(
  queryClient: ReturnType<typeof useQueryClient>,
  householdId: string,
): Promise<boolean> {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const entitlement = await fetchEntitlement(householdId);
    if (entitlement) {
      queryClient.setQueryData(
        queryKeys.premium.entitlement(householdId),
        entitlement,
      );
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return false;
}

export type PurchaseOutcome = 'unlocked' | 'pending' | 'canceled';

/**
 * Achat du premium dans l'app (Stripe PaymentSheet, iOS et Android) —
 * parcours retenu le 2026-11-15 (demande explicite). Le serveur crée le
 * paiement pour le foyer de l'appelant ; le premium n'est accordé que par
 * le webhook, une fois le paiement confirmé par Stripe.
 */
export function usePremiumPurchase() {
  const queryClient = useQueryClient();
  const { data: household } = useMyHousehold();

  return useMutation({
    mutationFn: async (): Promise<PurchaseOutcome> => {
      if (!household) throw new Error('Aucun foyer trouvé pour ce compte.');
      const { clientSecret } = await createPaymentSheetIntent();
      const outcome = await payWithPaymentSheet(clientSecret);
      if (outcome === 'canceled') return 'canceled';
      return (await waitForEntitlement(queryClient, household.id))
        ? 'unlocked'
        : 'pending';
    },
  });
}

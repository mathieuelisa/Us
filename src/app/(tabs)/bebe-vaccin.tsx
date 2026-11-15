import { BabyModuleScreen } from '@/components/baby/baby-module-screen';
import { BABY_MODULES } from '@/features/baby/constants';

/**
 * Suivi « vaccins » de « Votre bébé » (demande explicite du 2026-11-15) —
 * voir `BabyModuleScreen` et `BABY_MODULES` : rendu partagé, plus la carte
 * des échéances à venir propre aux vaccins (`VaccinesDueCard`).
 */
export default function BabyVaccinesScreen() {
  return <BabyModuleScreen module={BABY_MODULES.vaccin} />;
}

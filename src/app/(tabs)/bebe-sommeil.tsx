import { BabyModuleScreen } from '@/components/baby/baby-module-screen';
import { BABY_MODULES } from '@/features/baby/constants';

/**
 * Suivi « sommeil » de « Votre bébé » (demande explicite du 2026-11-15) —
 * voir `BabyModuleScreen` et `BABY_MODULES` : rendu partagé, plus la carte
 * « Bébé dort / est réveillé » propre au sommeil (`SleepNowCard`).
 */
export default function BabySleepScreen() {
  return <BabyModuleScreen module={BABY_MODULES.sommeil} />;
}

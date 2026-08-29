import { BabyModuleScreen } from '@/components/baby/baby-module-screen';
import { BABY_MODULES } from '@/features/baby/constants';

/**
 * Suivi « biberon » de « Votre bébé » — voir `BabyModuleScreen` et
 * `BABY_MODULES` : la route existe pour porter la navigation depuis la
 * grille bento de `/bebe`, tout le rendu est partagé.
 */
export default function BabyBottleScreen() {
  return <BabyModuleScreen module={BABY_MODULES.biberon} />;
}

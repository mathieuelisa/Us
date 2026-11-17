import { Platform, Switch, type SwitchProps } from 'react-native';

import { useThemeAccent } from '@/features/settings/hooks';

/**
 * Rail gris de l'interrupteur éteint. Le `Switch` natif laissé par défaut
 * a un rail presque blanc sur nos cartes blanches : seul le rond blanc se
 * voyait, sans qu'on comprenne que c'était un interrupteur (signalé sur
 * « Me rappeler avant l'échéance »).
 */
const OFF_TRACK = '#c3c7cf';
const THUMB = '#ffffff';

/**
 * Interrupteur de l'app : rail gris bien visible éteint, couleur du thème
 * (ou `onColor`) allumé, rond blanc dans les deux cas. À utiliser à la
 * place du `Switch` de React Native, pour que tous les réglages se lisent
 * pareil.
 */
export function ToggleSwitch({
  onColor,
  ...props
}: Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> & {
  /** Couleur du rail allumé ; couleur du thème par défaut. */
  onColor?: string;
}) {
  const accent = useThemeAccent();
  const activeColor = onColor ?? accent;

  return (
    <Switch
      {...props}
      trackColor={{ false: OFF_TRACK, true: activeColor }}
      thumbColor={THUMB}
      ios_backgroundColor={OFF_TRACK}
      // React Native Web colore le rond allumé à part.
      {...(Platform.OS === 'web' ? { activeThumbColor: THUMB } : {})}
    />
  );
}

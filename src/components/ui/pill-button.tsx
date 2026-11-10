import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SparkLines } from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba, lightenHex } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Bouton principal en gélule d'accent : icône + libellé blancs, reflet clair
 * à droite, ombre teintée, petits traits en haut à droite quand il est
 * actif. Né sur le bouton « Enregistrer » du Journal, repris par l'onglet
 * Rendez-vous (demande explicite d'un même style). Désactivé, il pâlit et
 * perd ses traits.
 *
 * `size="compact"` : variante plus basse, pour un bouton posé dans une carte
 * plutôt qu'en bas d'un formulaire (« Ajouter le co-parent » du hub).
 */
export function PillButton({
  label,
  icon,
  onPress,
  isDisabled = false,
  accessibilityLabel,
  size = 'regular',
}: {
  label: string;
  icon?: IoniconName;
  onPress: () => void;
  isDisabled?: boolean;
  accessibilityLabel?: string;
  size?: 'regular' | 'compact';
}) {
  const accent = useThemeAccent();
  const isCompact = size === 'compact';

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={onPress}
        style={{
          opacity: isDisabled ? 0.45 : 1,
          shadowColor: accent,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 4,
        }}
        className={`${isCompact ? 'h-12' : 'h-[60px]'} overflow-hidden rounded-full`}
      >
        <View
          className="flex-1 flex-row items-center justify-center gap-2.5"
          style={{ backgroundColor: accent }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -30,
              top: -20,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: lightenHex(accent, 0.12),
              opacity: 0.6,
            }}
          />
          {icon ? (
            <Ionicons name={icon} size={isCompact ? 18 : 20} color="#ffffff" />
          ) : null}
          <Text
            className={`${isCompact ? 'text-[15px]' : 'text-[17px]'} font-bold text-white`}
          >
            {label}
          </Text>
        </View>
      </Pressable>
      {isDisabled ? null : (
        <SparkLines
          color={hexToRgba(accent, 0.7)}
          style={{ right: -6, top: -20 }}
        />
      )}
    </View>
  );
}

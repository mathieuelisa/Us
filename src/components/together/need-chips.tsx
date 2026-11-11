import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { NEED_ICONS, parseNeedNote } from '@/features/together/constants';
import { hexToRgba } from '@/lib/color';

/**
 * Besoins exprimés par un parent dans Ensemble, montrés à l'autre : les
 * besoins rapides en pastilles à pictogramme, ou le texte libre entre
 * guillemets. Rien si aucun besoin n'a été précisé.
 *
 * `tone="onColor"` : sur un fond coloré (carte rose du hub), pastilles
 * blanches translucides et texte blanc. `tone="light"` : sur une carte
 * claire, pastilles teintées de `color`.
 */
export function NeedChips({
  note,
  tone,
  color,
}: {
  note: string | null | undefined;
  tone: 'onColor' | 'light';
  color: string;
}) {
  const { needs, freeText } = parseNeedNote(note);
  const onColor = tone === 'onColor';
  const textColor = onColor ? '#ffffff' : color;

  if (freeText) {
    return (
      <View
        className="flex-row items-start gap-2 rounded-[16px] px-3 py-2.5"
        style={{
          backgroundColor: onColor
            ? 'rgba(255, 255, 255, 0.18)'
            : hexToRgba(color, 0.08),
        }}
      >
        <Ionicons name="chatbubble-ellipses" size={15} color={textColor} />
        <Text
          className="flex-1 text-[13.5px] italic leading-[19px]"
          style={{ color: textColor }}
        >
          « {freeText} »
        </Text>
      </View>
    );
  }

  if (needs.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2">
      {needs.map((need) => (
        <View
          key={need.value}
          className="flex-row items-center gap-1.5 rounded-full py-1.5 pl-2 pr-3"
          style={{
            backgroundColor: onColor
              ? 'rgba(255, 255, 255, 0.2)'
              : hexToRgba(color, 0.1),
          }}
        >
          <Ionicons
            name={NEED_ICONS[need.value] ?? 'ellipse-outline'}
            size={14}
            color={textColor}
          />
          <Text
            className="text-[12.5px] font-semibold"
            style={{ color: textColor }}
          >
            {need.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

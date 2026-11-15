import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import {
  type BabyEntry,
  formatShortDate,
  getVaccinesDue,
} from '@/features/baby/constants';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

const LATE_RED = '#d14b3a';

/**
 * Échéances de vaccins (demande explicite du 2026-11-15) : vaccins « À
 * faire » et prochains rappels, du plus proche au plus lointain, les
 * retards en rouge. Un appui rouvre l'entrée qui porte l'échéance.
 */
export function VaccinesDueCard({
  entries,
  accent,
  onOpen,
}: {
  entries: BabyEntry[];
  accent: string;
  onOpen: (entry: BabyEntry) => void;
}) {
  const due = getVaccinesDue(entries, todayIso());

  return (
    <View
      className="gap-3 rounded-[28px] p-4"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.95)',
        shadowColor: accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center gap-2.5">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: hexToRgba(accent, 0.14) }}
        >
          <Ionicons name="notifications-outline" size={20} color={accent} />
        </View>
        <Text
          className="flex-1 text-[16px] font-extrabold"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          À venir
        </Text>
      </View>

      {due.length === 0 ? (
        <Text
          className="text-[13px] leading-[18px]"
          style={{ color: GLASS_BODY_COLOR }}
        >
          Aucun vaccin à venir. Notez un vaccin « À faire », ou la date du
          prochain rappel d’un vaccin fait : vous serez prévenus 7 jours avant
          et le jour J.
        </Text>
      ) : (
        <View className="gap-2">
          {due.map((item) => (
            <Pressable
              key={`${item.entry.id}-${item.kind}`}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${
                item.kind === 'booster' ? 'rappel' : 'prévu'
              } le ${formatShortDate(item.date)}${item.isLate ? ', en retard' : ''}`}
              onPress={() => onOpen(item.entry)}
              className="flex-row items-center gap-3 rounded-2xl px-3 py-2.5 active:opacity-70"
              style={{
                backgroundColor: item.isLate
                  ? hexToRgba(LATE_RED, 0.08)
                  : hexToRgba(accent, 0.07),
              }}
            >
              <Ionicons
                name={item.isLate ? 'alert-circle' : 'calendar-outline'}
                size={18}
                color={item.isLate ? LATE_RED : accent}
              />
              <View className="flex-1">
                <Text
                  className="text-[14.5px] font-bold"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  {item.name}
                </Text>
                <Text
                  className="text-[12.5px]"
                  style={{ color: item.isLate ? LATE_RED : GLASS_BODY_COLOR }}
                >
                  {item.kind === 'booster' ? 'Rappel' : 'Prévu'}
                  {item.isLate ? ' en retard depuis le ' : ' le '}
                  {formatShortDate(item.date)}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={GLASS_BODY_COLOR}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

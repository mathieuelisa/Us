import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { BabyEntryFormModal } from '@/components/baby/baby-entry-form-modal';
import type { BabyEntry, BabyModule } from '@/features/baby/constants';
import {
  formatBabyEntryDate,
  formatBabyEntrySummary,
} from '@/features/baby/constants';
import { CARD_SHADOW } from '@/features/hub/constants';
import { useThemeBabyWallpaper } from '@/features/settings/hooks';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écran de détail d'un suivi bébé, ouvert depuis la grille bento de
 * `/bebe`. Structure commune aux 4 modules (décrite dans
 * `BABY_MODULES`) : en-tête avec retour, carte du module, historique,
 * bouton d'ajout ouvrant `BabyEntryFormModal`.
 *
 * Reprend le wallpaper de thème de `/bebe` (`useThemeBabyWallpaper`) pour
 * que le passage de la grille au détail ne change pas de décor.
 *
 * Le retour cible explicitement `/bebe` au lieu de `router.back()` : ces
 * routes vivent dans le navigateur `Tabs`, qui ne les empile pas sur
 * `/bebe` — `back()` remonterait au hub et non à la grille d'où l'on
 * vient.
 *
 * ⚠️ Les entrées sont gardées dans l'état de l'écran : il n'existe ni
 * table Supabase ni policy RLS pour ces suivis (module premium, hors
 * périmètre MVP — DOCS/versions/MVP.md). La saisie fonctionne de bout en
 * bout mais ne survit pas à la fermeture de l'app ; le branchement
 * serveur reste à faire, et ces données touchant la santé de l'enfant,
 * leur policy devra être revue explicitement (cf. CLAUDE.md).
 */
export function BabyModuleScreen({ module }: { module: BabyModule }) {
  const router = useRouter();
  const wallpaper = useThemeBabyWallpaper();
  const [entries, setEntries] = useState<BabyEntry[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);

  function addEntry(entry: Omit<BabyEntry, 'id'>) {
    setEntries((current) => [{ ...entry, id: `${Date.now()}` }, ...current]);
    setIsFormVisible(false);
  }

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground source={wallpaper} resizeMode="cover" className="flex-1">
        <ScrollView
          contentContainerClassName="gap-5 px-6 pb-10 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityLabel="Revenir à Votre bébé"
            accessibilityRole="button"
            hitSlop={12}
            style={CARD_SHADOW}
            onPress={() => router.navigate('/bebe')}
            className="h-9 w-9 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
          </Pressable>

          <View
            style={CARD_SHADOW}
            className="flex-row items-center gap-3.5 rounded-3xl bg-white p-4"
          >
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#1f3d3a]/10">
              <Text className="text-[24px]">{module.emoji}</Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-[19px] font-bold text-[#1a1a1a]">
                {module.title}
              </Text>
              <Text className="text-[12.5px] leading-4 text-[#6b6b6b]">
                {module.subtitle}
              </Text>
            </View>
          </View>

          <View style={CARD_SHADOW} className="gap-3 rounded-3xl bg-white p-4">
            <Text className="text-[11.5px] font-semibold tracking-wide text-[#9a9a9a]">
              {module.sectionTitle.toUpperCase()}
            </Text>

            {entries.length === 0 ? (
              <View className="items-center gap-2 rounded-2xl border border-dashed border-[#d8d8d8] px-4 py-8">
                <Text className="text-[26px]">{module.emoji}</Text>
                <Text className="text-center text-[13.5px] leading-5 text-[#6b6b6b]">
                  {module.emptyState}
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {entries.map((entry) => (
                  <View
                    key={entry.id}
                    className="gap-0.5 rounded-2xl bg-[#f7f9f8] px-3.5 py-3"
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-[14px] font-semibold text-[#1a1a1a]">
                        {formatBabyEntrySummary(module, entry) || module.title}
                      </Text>
                      <Text className="text-[12px] text-[#8a8a8a]">
                        {formatBabyEntryDate(entry)}
                      </Text>
                    </View>
                    {entry.comment ? (
                      <Text className="text-[12.5px] leading-4 text-[#6b6b6b]">
                        {entry.comment}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </View>

          <Pressable
            accessibilityLabel={module.actionLabel}
            accessibilityRole="button"
            onPress={() => setIsFormVisible(true)}
            style={CARD_SHADOW}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#1f3d3a] px-4 py-4 active:opacity-80"
          >
            <Ionicons name="add" size={18} color="#ffffff" />
            <Text className="text-[15.5px] font-semibold text-white">
              {module.actionLabel}
            </Text>
          </Pressable>
        </ScrollView>

        <BabyEntryFormModal
          module={module}
          visible={isFormVisible}
          onSubmit={addEntry}
          onCancel={() => setIsFormVisible(false)}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

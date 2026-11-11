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
import { BlobIllustration } from '@/components/ui/blob-illustration';
import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import type { BabyEntry, BabyModule } from '@/features/baby/constants';
import {
  formatBabyEntryDate,
  formatBabyEntrySummary,
} from '@/features/baby/constants';
import {
  useThemeAccent,
  useThemeBabyWallpaper,
} from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

/** Surface « verre dépoli » des cartes de l'écran. */
const GLASS_SURFACE = {
  backgroundColor: 'rgba(255, 255, 255, 0.92)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.95)',
} as const;

const tintedShadow = (accent: string) =>
  ({
    shadowColor: accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  }) as const;

/**
 * Écran de détail d'un suivi bébé, ouvert depuis la grille bento de
 * `/bebe`. Structure commune aux 4 modules (décrite dans
 * `BABY_MODULES`) : en-tête avec retour, carte du module, historique,
 * bouton d'ajout ouvrant `BabyEntryFormModal`.
 *
 * Habillage d'après une capture de référence (demande explicite) : grand
 * bouton retour, carte d'en-tête à illustration (emoji sur tache
 * d'accent), intitulé de section à icône, historique et état vide en
 * cartes « verre dépoli », bouton d'ajout en `PillButton`, boucle
 * décorative en bas.
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
  const accent = useThemeAccent();
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
          contentContainerClassName="gap-5 px-5 pb-10 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityLabel="Revenir à Votre bébé"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.navigate('/bebe')}
            className="h-12 w-12 items-center justify-center rounded-full bg-white"
            style={tintedShadow(accent)}
          >
            <Ionicons name="chevron-back" size={22} color={GLASS_TITLE_COLOR} />
          </Pressable>

          <View
            className="flex-row items-center gap-4 rounded-[28px] p-4"
            style={[tintedShadow(accent), GLASS_SURFACE]}
          >
            <BlobIllustration accent={accent} size={80}>
              <Text style={{ fontSize: 40 }}>{module.emoji}</Text>
            </BlobIllustration>
            <View className="flex-1 gap-1">
              <Text
                className="text-[25px] font-extrabold leading-[30px]"
                style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.5 }}
              >
                {module.title}
              </Text>
              <Text
                className="text-[13.5px] leading-[18px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {module.subtitle}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center gap-2.5 px-1">
              <Ionicons name="calendar-outline" size={20} color={accent} />
              <Text
                className="text-[12.5px] font-bold"
                style={{ color: '#5b5470', letterSpacing: 1.1 }}
              >
                {module.sectionTitle.toUpperCase()}
              </Text>
            </View>

            {entries.length === 0 ? (
              <View
                className="items-center gap-3 rounded-[28px] px-5 py-7"
                style={[tintedShadow(accent), GLASS_SURFACE]}
              >
                <BlobIllustration accent={accent} size={96}>
                  <Text style={{ fontSize: 48 }}>{module.emoji}</Text>
                </BlobIllustration>
                <Text
                  className="text-center text-[14.5px] leading-5"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  {module.emptyState}
                </Text>
              </View>
            ) : (
              <View className="gap-2.5">
                {entries.map((entry) => (
                  <View
                    key={entry.id}
                    className="flex-row items-center gap-3 rounded-[22px] py-3 pl-3 pr-4"
                    style={[tintedShadow(accent), GLASS_SURFACE]}
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: hexToRgba(accent, 0.1) }}
                    >
                      <Text style={{ fontSize: 22 }}>{module.emoji}</Text>
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text
                        className="text-[15px] font-bold"
                        style={{ color: GLASS_TITLE_COLOR }}
                      >
                        {formatBabyEntrySummary(module, entry) || module.title}
                      </Text>
                      {entry.comment ? (
                        <Text
                          className="text-[12.5px] leading-4"
                          style={{ color: GLASS_BODY_COLOR }}
                        >
                          {entry.comment}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: hexToRgba(accent, 0.1) }}
                    >
                      <Text
                        className="text-[11.5px] font-semibold"
                        style={{ color: accent }}
                      >
                        {formatBabyEntryDate(entry)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <PillButton
            label={module.actionLabel}
            icon="add"
            onPress={() => setIsFormVisible(true)}
          />

          <DashedLoopDoodle color={accent} />
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

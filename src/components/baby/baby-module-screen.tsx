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
import { GrowthChart } from '@/components/baby/growth-chart';
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
  /** Entrée rouverte pour correction ; `null` quand la modale ajoute. */
  const [editingEntry, setEditingEntry] = useState<BabyEntry | null>(null);

  // Dernière valeur de chaque champ, par date de mesure : point de départ
  // des molettes du formulaire. `entries` étant trié du plus récent au plus
  // ancien, on le parcourt à rebours pour que le plus récent l'emporte.
  const lastValues: Record<string, string> = {};
  for (const entry of [...entries].reverse()) {
    Object.assign(lastValues, entry.values);
  }

  /**
   * L'historique reste trié par date (puis heure) décroissante, même quand
   * on saisit après coup une mesure plus ancienne (demande explicite) : elle
   * se range à sa place au lieu de passer en tête. Le tri étant stable et la
   * nouvelle entrée placée devant, elle passe avant celles du même moment.
   */
  function saveEntry(entry: Omit<BabyEntry, 'id'>) {
    const editedId = editingEntry?.id;
    setEntries((current) =>
      (editedId
        ? current.map((item) =>
            item.id === editedId ? { ...entry, id: editedId } : item,
          )
        : [{ ...entry, id: `${Date.now()}` }, ...current]
      ).sort(compareNewestFirst),
    );
    closeForm();
  }

  function openForm(entry: BabyEntry | null) {
    setEditingEntry(entry);
    setIsFormVisible(true);
  }

  function closeForm() {
    setIsFormVisible(false);
    setEditingEntry(null);
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

          {/* Courbe de croissance (demande explicite), au-dessus de
              l'historique, sur le seul suivi « Croissance ». */}
          {module.slug === 'croissance' ? (
            <View
              className="rounded-[28px] px-4 pb-3 pt-4"
              style={[tintedShadow(accent), GLASS_SURFACE]}
            >
              <GrowthChart entries={entries} accent={accent} />
            </View>
          ) : null}

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
                {/* Un appui rouvre la modale préremplie pour corriger une
                    saisie (demande explicite). */}
                {entries.map((entry) => (
                  <Pressable
                    key={entry.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${module.editLabel} du ${formatBabyEntryDate(entry)}`}
                    onPress={() => openForm(entry)}
                    className="flex-row items-center gap-3 rounded-[22px] py-3 pl-3 pr-3 active:opacity-70"
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
                    <Ionicons
                      name="create-outline"
                      size={17}
                      color={GLASS_BODY_COLOR}
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <PillButton
            label={module.actionLabel}
            icon="add"
            onPress={() => openForm(null)}
          />

          <DashedLoopDoodle color={accent} />
        </ScrollView>

        <BabyEntryFormModal
          module={module}
          visible={isFormVisible}
          initialEntry={editingEntry}
          lastValues={lastValues}
          onSubmit={saveEntry}
          onCancel={closeForm}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

function compareNewestFirst(a: BabyEntry, b: BabyEntry): number {
  return (
    b.date.localeCompare(a.date) || (b.time ?? '').localeCompare(a.time ?? '')
  );
}

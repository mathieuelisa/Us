import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { BabyEntryFormModal } from '@/components/baby/baby-entry-form-modal';
import { GrowthChart } from '@/components/baby/growth-chart';
import { useTabBarContentInset } from '@/components/navigation/use-tab-bar-height';
import { BlobIllustration } from '@/components/ui/blob-illustration';
import {
  FeedbackBanner,
  useFeedbackBanner,
} from '@/components/ui/feedback-banner';
import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { PillButton } from '@/components/ui/pill-button';
import type { BabyEntryInput } from '@/features/baby/api';
import type { BabyEntry, BabyModule } from '@/features/baby/constants';
import {
  formatBabyDayLabel,
  formatBabyDayTotal,
  formatBabyEntryDate,
  formatBabyEntrySummary,
  groupBabyEntriesByDay,
} from '@/features/baby/constants';
import {
  useBabyEntries,
  useDeleteBabyEntry,
  useSaveBabyEntry,
} from '@/features/baby/hooks';
import {
  useThemeAccent,
  useThemeBabyWallpaper,
} from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';
import { todayIso } from '@/lib/date';

const SafeAreaView = withUniwind(RNSafeAreaView);

const ROW_LAYOUT = LinearTransition.springify().damping(18).stiffness(170);

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
 * Les entrées sont enregistrées dans `baby_entries` (Supabase), partagées
 * par les deux parents du foyer, qui peuvent toutes les corriger — RLS
 * revue explicitement dans la migration `20261112110000_baby_entries`.
 */
export function BabyModuleScreen({ module }: { module: BabyModule }) {
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const router = useRouter();
  const wallpaper = useThemeBabyWallpaper();
  const accent = useThemeAccent();
  const entriesQuery = useBabyEntries(module.slug);
  const entries = entriesQuery.data ?? [];
  const saveMutation = useSaveBabyEntry(module.slug);
  const deleteMutation = useDeleteBabyEntry(module.slug);
  const { feedback, showFeedback } = useFeedbackBanner();
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
   * Ajout ou correction, puis rechargement de la liste — triée par la base
   * du plus récent au plus ancien, même pour une mesure saisie après coup
   * (demande explicite). La modale reste ouverte en cas d'échec, pour ne
   * pas perdre la saisie.
   */
  async function saveEntry(input: BabyEntryInput) {
    try {
      await saveMutation.mutateAsync({ id: editingEntry?.id ?? null, input });
      closeForm();
      showFeedback(
        'success',
        editingEntry ? 'Modification enregistrée.' : 'Entrée enregistrée.',
      );
    } catch {
      showFeedback('error', 'Enregistrement impossible. Réessayez.');
    }
  }

  /** Suppression confirmée dans la modale (demande explicite). */
  async function deleteEntry() {
    if (!editingEntry) return;
    try {
      await deleteMutation.mutateAsync(editingEntry.id);
      closeForm();
      showFeedback('success', 'Entrée supprimée.');
    } catch {
      showFeedback('error', 'Suppression impossible. Réessayez.');
    }
  }

  function openForm(entry: BabyEntry | null) {
    setEditingEntry(entry);
    setIsFormVisible(true);
  }

  function closeForm() {
    setIsFormVisible(false);
    setEditingEntry(null);
  }

  // Une ligne d'historique. Regroupée par jour, la pastille ne garde que
  // l'heure : le jour est dans l'intitulé du groupe.
  const renderEntry = (entry: BabyEntry) => (
    // Même animation que la suppression d'un contact : la
    // ligne supprimée glisse vers la gauche, les suivantes
    // remontent en douceur.
    <Animated.View
      key={entry.id}
      entering={FadeInDown.duration(260)}
      exiting={FadeOutLeft.duration(320)}
      layout={ROW_LAYOUT}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${module.editLabel} du ${formatBabyEntryDate(entry)}`}
        onPress={() => openForm(entry)}
        className="flex-row items-center gap-3 rounded-[22px] py-3 pl-3 pr-3 active:opacity-70"
        style={[tintedShadow(accent), GLASS_SURFACE]}
      >
        {/* Icône du module sur sa propre tuile (demande
            explicite), à la place de l'émoji sur rond teinté. */}
        <Image
          source={module.image}
          style={{ width: 46, height: 46 }}
          resizeMode="contain"
        />
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
        {module.dailySummary && !entry.time ? null : (
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: hexToRgba(accent, 0.1) }}
          >
            <Text
              className="text-[11.5px] font-semibold"
              style={{ color: accent }}
            >
              {module.dailySummary && entry.time
                ? entry.time.replace(':', 'h')
                : formatBabyEntryDate(entry)}
            </Text>
          </View>
        )}
        <Ionicons name="create-outline" size={17} color={GLASS_BODY_COLOR} />
      </Pressable>
    </Animated.View>
  );

  const today = todayIso();

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground source={wallpaper} resizeMode="cover" className="flex-1">
        <ScrollView
          contentContainerClassName="gap-5 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: tabBarInset }}
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
            <BlobIllustration accent={accent} size={80} image={module.image} />
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

            {entriesQuery.isPending ? null : entries.length === 0 ? (
              <View
                className="items-center gap-3 rounded-[28px] px-5 py-7"
                style={[tintedShadow(accent), GLASS_SURFACE]}
              >
                <BlobIllustration
                  accent={accent}
                  size={96}
                  image={module.image}
                />
                <Text
                  className="text-center text-[14.5px] leading-5"
                  style={{ color: GLASS_TITLE_COLOR }}
                >
                  {module.emptyState}
                </Text>
              </View>
            ) : (
              <View className={module.dailySummary ? 'gap-5' : 'gap-2.5'}>
                {/* Un appui rouvre la modale préremplie pour corriger une
                    saisie (demande explicite). Biberons, tétées et soins
                    sont regroupés par jour avec leur total (demande
                    explicite). */}
                {module.dailySummary
                  ? groupBabyEntriesByDay(entries).map((group) => (
                      <Animated.View
                        key={group.date}
                        entering={FadeInDown.duration(260)}
                        layout={ROW_LAYOUT}
                        className="gap-2.5"
                      >
                        <View className="flex-row items-center justify-between gap-2 px-1">
                          <Text
                            className="text-[15px] font-extrabold"
                            style={{
                              color: GLASS_TITLE_COLOR,
                              letterSpacing: -0.2,
                            }}
                          >
                            {formatBabyDayLabel(group.date, today)}
                          </Text>
                          <View
                            className="rounded-full px-2.5 py-1"
                            style={{ backgroundColor: hexToRgba(accent, 0.1) }}
                          >
                            <Text
                              className="text-[12px] font-bold"
                              style={{ color: accent }}
                            >
                              {formatBabyDayTotal(module, group.entries)}
                            </Text>
                          </View>
                        </View>
                        {group.entries.map(renderEntry)}
                      </Animated.View>
                    ))
                  : entries.map(renderEntry)}
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
          isSaving={saveMutation.isPending}
          onDelete={deleteEntry}
          isDeleting={deleteMutation.isPending}
          onSubmit={saveEntry}
          onCancel={closeForm}
        />

        <FeedbackBanner
          message={feedback?.message ?? null}
          tone={feedback?.tone}
          accent={accent}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import { useAtomValue } from 'jotai';
import type { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';
import { useTabBarContentInset } from '@/components/navigation/use-tab-bar-height';
import { WeekSymptomsCard } from '@/components/partner/week-symptoms-card';
import { NeedChips } from '@/components/together/need-chips';
import { WeekMoodDays } from '@/components/together/week-mood-strip';
import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { usePullToRefresh } from '@/components/ui/use-pull-to-refresh';
import { getWeeksOfAmenorrhea } from '@/features/health/constants';
import { useBabySize, useWeekSymptomsFor } from '@/features/health/hooks';
import { useMyHousehold } from '@/features/household/hooks';
import { getPartnerUserId, type HubSummary } from '@/features/hub/api';
import { getMoodImage, MOOD_PRESENTATION } from '@/features/hub/constants';
import { useHubSummary } from '@/features/hub/hooks';
import {
  getRelationTipOfTheDay,
  getSelfTipOfTheDay,
  PARTNER_PINK,
  relationTipLabel,
} from '@/features/partner/constants';
import { getCurrentWeekIsoDates } from '@/features/together/api';
import { useWeekCheckinsFor } from '@/features/together/hooks';
import { useLocale } from '@/i18n/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';
import { sessionAtom } from '@/lib/atoms/session';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const PINK = PARTNER_PINK;
const HEADER_IMAGE = require('@/assets/images/Father_feelings_mother.png');
/**
 * Deux cœurs entrelacés de la seconde astuce (compagnon, compagne ou
 * couple — illustration fournie, avec sa tuile, demande explicite), à la
 * place de l'émoji 💞.
 */
const COPARENT_TIP_ICON = require('@/assets/images/Icon_astuce_coparent.png');

const PINK_SHADOW = {
  shadowColor: PINK.accent,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 4,
} as const;

/** Grandes taches roses floues aux coins de l'écran — fond décoratif. */
function PinkBackdrop() {
  const blob = (style: object) => (
    <View
      style={[
        {
          position: 'absolute',
          borderRadius: 999,
          backgroundColor: PINK.blob,
          opacity: 0.55,
        },
        style,
      ]}
    />
  );

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
    >
      {blob({ width: 300, height: 260, top: -150, left: -140 })}
      {blob({ width: 220, height: 260, top: -60, right: -150 })}
      {blob({ width: 360, height: 220, bottom: -120, left: -120 })}
      {blob({ width: 240, height: 260, bottom: 40, right: -170 })}
    </View>
  );
}

/** Carte blanche translucide aux grands rayons, ombre rose. */
function PinkCard({ children }: { children: ReactNode }) {
  return (
    <View
      style={[
        PINK_SHADOW,
        {
          borderRadius: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.95)',
        },
      ]}
      className="flex-row items-center gap-4 px-4 py-4"
    >
      {children}
    </View>
  );
}

/**
 * Tuile d'illustration : tache rose aux coins inégaux plutôt qu'un carré,
 * pour l'effet « dessiné » de la capture de référence.
 */
function IllustrationTile({
  emoji,
  image,
}: {
  emoji: string;
  /** Illustration qui a déjà sa tuile : affichée seule, sans la tache. */
  image?: ImageSourcePropType;
}) {
  if (image) {
    return (
      <Image
        source={image}
        style={{ width: 68, height: 68 }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View
      className="h-[68px] w-[68px] items-center justify-center"
      style={{
        backgroundColor: PINK.soft,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 24,
        borderBottomRightRadius: 32,
        borderBottomLeftRadius: 22,
      }}
    >
      <Text style={{ fontSize: 34 }}>{emoji}</Text>
    </View>
  );
}

/** Intitulé de section : icône rose, libellé espacé, filet jusqu'au bord. */
function SectionHeading({ icon, label }: { icon: IoniconName; label: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <Ionicons name={icon} size={22} color={PINK.accent} />
      <Text
        className="text-[12.5px] font-bold"
        style={{ color: PINK.heading, letterSpacing: 1.1 }}
      >
        {label}
      </Text>
      <View className="h-px flex-1" style={{ backgroundColor: PINK.line }} />
    </View>
  );
}

function TipCard({
  emoji,
  image,
  recipient,
  tip,
}: {
  emoji: string;
  image?: ImageSourcePropType;
  recipient: string;
  tip: string;
}) {
  return (
    <PinkCard>
      <IllustrationTile emoji={emoji} image={image} />
      <View className="flex-1 items-start gap-2">
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: PINK.tag }}
        >
          <Text
            className="text-[12px] font-semibold"
            style={{ color: PINK.tagText }}
          >
            {recipient}
          </Text>
        </View>
        {/* Graisse normale (demande explicite) : le libellé au-dessus
            porte déjà l'accent, le conseil se lit comme une phrase. */}
        <Text
          className="text-[15px] leading-5"
          style={{ color: GLASS_TITLE_COLOR }}
        >
          {tip}
        </Text>
      </View>
    </PinkCard>
  );
}

/**
 * État du jour de l'autre parent : son ourson d'humeur sur une tache rose,
 * une phrase qualitative (« Camille semble au top »), puis ses besoins du
 * jour en pastilles — ou un état vide tant qu'il ou elle n'a rien noté.
 */
function PartnerStateCard({
  partnerName,
  partnerPronoun,
  partnerMood,
}: {
  partnerName: string | null;
  partnerPronoun: string | null;
  partnerMood: HubSummary['partnerMood'];
}) {
  const { t } = useTranslation();
  const who = partnerName || t('partner.yourPartner');
  const mood = partnerMood ? MOOD_PRESENTATION[partnerMood.mood] : null;
  const moodImage = partnerMood
    ? getMoodImage(partnerMood.mood, partnerPronoun)
    : null;

  return (
    <View
      style={[
        PINK_SHADOW,
        {
          borderRadius: 28,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.95)',
        },
      ]}
      className="gap-4 px-4 py-4"
    >
      <View className="flex-row items-center gap-4">
        <View
          className="h-[76px] w-[76px] items-center justify-center overflow-hidden"
          style={{
            backgroundColor: PINK.soft,
            borderTopLeftRadius: 34,
            borderTopRightRadius: 26,
            borderBottomRightRadius: 36,
            borderBottomLeftRadius: 24,
          }}
        >
          {moodImage ? (
            <Image
              source={moodImage}
              style={{ width: 66, height: 66 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 32 }}>🌱</Text>
          )}
        </View>

        <View className="flex-1 items-start gap-1.5">
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: PINK.tag }}
          >
            <Text
              className="text-[12px] font-semibold"
              style={{ color: PINK.tagText }}
            >
              {mood ? t(mood.labelKey) : t('common.today')}
            </Text>
          </View>
          <Text
            className="text-[16px] font-bold leading-[21px]"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {mood ? `${who} ${t(mood.phraseKey)}` : t('partner.noNewsYet')}
          </Text>
          {mood ? null : (
            <Text
              className="text-[13px] leading-[18px]"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {t('partner.moodWillAppear', { name: who })}
            </Text>
          )}
        </View>
      </View>

      {mood ? (
        <View className="gap-2">
          <Text
            className="text-[11.5px] font-bold"
            style={{ color: PINK.heading, letterSpacing: 1 }}
          >
            {t('partner.needsToday')}
          </Text>
          {partnerMood?.needNote?.trim() ? (
            <NeedChips
              note={partnerMood.needNote}
              tone="light"
              color={PINK.accent}
            />
          ) : (
            <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
              {t('partner.noNeeds')}
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Section « Mon partenaire » — bloc indépendant ouvert depuis le hub, pas un
 * 4e pilier (CONCEPT.md).
 *
 * Habillage d'après une capture de référence (demande explicite) : grand
 * titre souligné, illustration en haut à droite, intitulés de section à
 * icône et filet, cartes blanches translucides à tuile d'illustration.
 * **Toujours rose**, quel que soit le thème choisi en Réglages — exception
 * voulue, cf. `PARTNER_PINK`.
 *
 * ⚠️ La capture montre des chevrons sur les cartes ; ils ne sont pas repris
 * tant qu'aucune destination n'est définie pour ces cartes (un chevron
 * promettrait une navigation qui n'existe pas).
 *
 * Section « Son état aujourd'hui » (demande explicite) : l'humeur du jour
 * de l'autre parent (son ourson) et les besoins qu'il ou elle a précisés
 * dans Ensemble — pour que le co-parent sache où en est la mère, et
 * réciproquement. Lecture permise par la RLS de `mood_checkins` (membres du
 * foyer).
 *
 * ⚠️ Vue de la personne enceinte pour l'instant (demande explicite). Deux
 * blocs propres au co-parent restent donc à faire : la reprise de ses
 * rendez-vous partagés, et l'accès **en lecture seule** aux symptômes du
 * Journal — sa seule porte d'entrée vers cette donnée de santé.
 */
export default function PartnerScreen() {
  const { t } = useTranslation();
  const locale = useLocale();
  // Tirer vers le bas recharge les données affichées.
  const refresh = usePullToRefresh();
  // Place de la barre du bas, qui flotte au-dessus du contenu.
  const tabBarInset = useTabBarContentInset();
  const router = useRouter();
  const session = useAtomValue(sessionAtom);
  const { data: household } = useMyHousehold();
  const { data: summary } = useHubSummary(household);
  const role = useAtomValue(currentRoleAtom) ?? 'pregnant';

  const partnerUserId =
    household && session?.user.id
      ? getPartnerUserId(household, session.user.id)
      : null;

  const weekDates = getCurrentWeekIsoDates();
  const { data: partnerCheckins = {} } = useWeekCheckinsFor(
    household,
    partnerUserId,
  );

  // Symptômes de la semaine (demande explicite) : seulement côté co-parent,
  // qui lit ceux de la personne enceinte. Elle a les siens dans le Journal.
  const canSeeSymptoms = role === 'partner' && Boolean(partnerUserId);
  const { data: partnerSymptoms = {} } = useWeekSymptomsFor(
    household,
    canSeeSymptoms ? partnerUserId : null,
    weekDates,
  );

  const weeks = getWeeksOfAmenorrhea(household?.due_date ?? null);
  const { data: babySize, isSuccess: isBabySizeLoaded } = useBabySize(weeks);
  // Semaine connue mais sans taille en base : avant la première ligne
  // (8 SA, la framboise).
  const isBeforeFirstSize =
    weeks !== null && isBabySizeLoaded && babySize === null;

  const partnerName = summary?.partnerFirstName?.trim();
  const myTip = getSelfTipOfTheDay(role);
  const relationTip = getRelationTipOfTheDay(role);

  // Espace « Seul·e » (demande explicite) : pas d'autre parent. La page
  // devient « Cette semaine » — taille du bébé et astuce pour soi, sans
  // tendance d'humeur ni astuce pour le couple.
  const isSolo = household?.accompaniment_type === 'seul';

  const notJoinedText = partnerName
    ? t('partner.notJoinedNamed', { name: partnerName })
    : t('partner.notJoined');

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: PINK.background }}
    >
      <PinkBackdrop />

      <ScrollView
        refreshControl={refresh}
        contentContainerClassName="gap-7 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Illustration posée en haut à droite, derrière le titre, du
              niveau du bouton retour jusqu'au sous-titre. */}
          <View
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, right: -10 }}
          >
            <View
              style={{
                position: 'absolute',
                width: 130,
                height: 130,
                borderRadius: 65,
                backgroundColor: hexToRgba(PINK.accent, 0.1),
                top: 30,
                left: 14,
              }}
            />
            <Image
              source={HEADER_IMAGE}
              style={{ width: 150, height: 170 }}
              resizeMode="contain"
            />
            <Ionicons
              name="heart-outline"
              size={30}
              color={hexToRgba(PINK.accent, 0.7)}
              style={{
                position: 'absolute',
                top: 6,
                left: -18,
                transform: [{ rotate: '-12deg' }],
              }}
            />
            <Ionicons
              name="heart"
              size={13}
              color={hexToRgba(PINK.accent, 0.45)}
              style={{ position: 'absolute', top: 44, left: -4 }}
            />
          </View>

          {router.canGoBack() ? (
            <Pressable
              accessibilityLabel={t('common.goBack')}
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => router.back()}
              style={PINK_SHADOW}
              className="h-12 w-12 items-center justify-center rounded-full bg-white"
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={GLASS_TITLE_COLOR}
              />
            </Pressable>
          ) : null}

          <View className="mt-7 gap-2" style={{ maxWidth: '62%' }}>
            <Text
              className="text-[30px] font-extrabold leading-9"
              style={{ color: GLASS_TITLE_COLOR, letterSpacing: -0.6 }}
            >
              {isSolo
                ? t('partner.thisWeek')
                : partnerName
                  ? t('partner.withName', { name: partnerName })
                  : t('partner.title')}
            </Text>
            <Svg width={140} height={12} viewBox="0 0 140 12">
              <Path
                d="M4 9 C 40 3, 96 1.5, 136 5"
                stroke={hexToRgba(PINK.accent, 0.5)}
                strokeWidth={3.5}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            {partnerUserId || isSolo ? null : (
              <Text
                className="mt-2 text-[15px] leading-[22px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {notJoinedText}
              </Text>
            )}
          </View>
        </View>

        {partnerUserId ? (
          <View className="gap-3.5">
            <SectionHeading
              icon="sunny-outline"
              label={t('partner.stateToday')}
            />
            <PartnerStateCard
              partnerName={partnerName ?? null}
              partnerPronoun={summary?.partnerPronoun ?? null}
              partnerMood={summary?.partnerMood ?? null}
            />
          </View>
        ) : null}

        {partnerUserId ? (
          <View className="gap-3.5">
            <SectionHeading
              icon="happy-outline"
              label={t('partner.moodThisWeek')}
            />
            <View
              style={[
                PINK_SHADOW,
                {
                  borderRadius: 28,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              ]}
              className="px-4 py-4"
            >
              <View className="pt-4">
                <WeekMoodDays
                  weekDates={weekDates}
                  checkinsByDate={partnerCheckins}
                  pronoun={summary?.partnerPronoun ?? null}
                  accent={PINK.accent}
                />
              </View>
            </View>
          </View>
        ) : null}

        {canSeeSymptoms && !isSolo ? (
          <View className="gap-3.5">
            <SectionHeading
              icon="pulse-outline"
              label={t('partner.symptomsThisWeek')}
            />
            <WeekSymptomsCard
              weekDates={weekDates}
              symptomsByDate={partnerSymptoms}
              partnerName={partnerName ?? null}
            />
          </View>
        ) : null}

        <View className="gap-3.5">
          <SectionHeading
            icon="heart-outline"
            label={t('partner.babyThisWeek')}
          />
          <PinkCard>
            {/* Fruit ou légume de la semaine (demande explicite) : la taille
                se lit d'un coup d'œil. Avant 8 SA, la table des tailles n'a
                pas de ligne (la première est la framboise) : une pousse et
                « Plus petit qu'une framboise » plutôt que « Taille bientôt
                disponible » (demande explicite d'un meilleur message). */}
            <IllustrationTile
              emoji={babySize?.emoji ?? (isBeforeFirstSize ? '🌱' : '🍼')}
            />
            <View className="flex-1 gap-1">
              {babySize?.length_cm ? (
                <View
                  className="self-start rounded-full px-2.5 py-1"
                  style={{ backgroundColor: PINK.tag }}
                >
                  <Text
                    className="text-[12px] font-semibold"
                    style={{ color: PINK.tagText }}
                  >
                    {t('partner.aboutCm', {
                      size: babySize.length_cm.toLocaleString(locale),
                    })}
                  </Text>
                </View>
              ) : null}
              <Text
                className="text-[16px] font-bold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {babySize?.fruit_label ??
                  (isBeforeFirstSize
                    ? t('partner.smallerThanRaspberry')
                    : t('partner.sizeSoon'))}
              </Text>
              <Text
                className="text-[13px] leading-[18px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {weeks === null
                  ? t('partner.enterDueDate')
                  : isBeforeFirstSize
                    ? t('partner.comparisonFrom8', {
                        weeks: formatWeeks(weeks, t),
                      })
                    : formatWeeks(weeks, t)}
              </Text>
            </View>
          </PinkCard>
        </View>

        {/* Deux conseils pour la personne connectée (demande explicite) :
            l'un pour elle-même, l'autre au sujet de son compagnon ou de sa
            compagne, ou du couple — voir `getRelationTipOfTheDay`. */}
        {myTip || (relationTip && !isSolo) ? (
          <View className="gap-3.5">
            <SectionHeading
              icon="calendar-outline"
              label={t('partner.tipsToday')}
            />
            {myTip ? (
              <TipCard emoji="💡" recipient={t('partner.forYou')} tip={myTip} />
            ) : null}
            {relationTip && !isSolo ? (
              <TipCard
                emoji="💞"
                image={COPARENT_TIP_ICON}
                recipient={t(relationTipLabel(relationTip, role))}
                tip={relationTip.text}
              />
            ) : null}
          </View>
        ) : null}

        <DashedLoopDoodle color={PINK.accent} />
      </ScrollView>
    </SafeAreaView>
  );
}

/** « 1 semaine d'aménorrhée », « 12 semaines d'aménorrhée ». */
function formatWeeks(weeks: number, t: TFunction): string {
  return t('partner.weeks', { count: weeks });
}

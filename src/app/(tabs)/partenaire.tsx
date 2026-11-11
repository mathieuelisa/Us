import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import type { ComponentProps, ReactNode } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { withUniwind } from 'uniwind';

import { NeedChips } from '@/components/together/need-chips';
import { WeekMoodDays } from '@/components/together/week-mood-strip';
import {
  DashedLoopDoodle,
  GLASS_BODY_COLOR,
  GLASS_TITLE_COLOR,
} from '@/components/ui/glass-card';
import { getWeeksOfAmenorrhea } from '@/features/health/constants';
import { useBabySize } from '@/features/health/hooks';
import { useMyHousehold } from '@/features/household/hooks';
import { getPartnerUserId, type HubSummary } from '@/features/hub/api';
import { MOOD_PRESENTATION } from '@/features/hub/constants';
import { useHubSummary } from '@/features/hub/hooks';
import { getTipOfTheDay, PARTNER_PINK } from '@/features/partner/constants';
import { getCurrentWeekIsoDates } from '@/features/together/api';
import { useWeekCheckinsFor } from '@/features/together/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';
import { sessionAtom } from '@/lib/atoms/session';
import { hexToRgba } from '@/lib/color';

const SafeAreaView = withUniwind(RNSafeAreaView);

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const PINK = PARTNER_PINK;
const HEADER_IMAGE = require('@/assets/images/Father_feelings_mother.png');

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
function IllustrationTile({ emoji }: { emoji: string }) {
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
  recipient,
  tip,
}: {
  emoji: string;
  recipient: string;
  tip: string;
}) {
  return (
    <PinkCard>
      <IllustrationTile emoji={emoji} />
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
        <Text
          className="text-[15px] font-semibold leading-5"
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
  partnerMood,
}: {
  partnerName: string | null;
  partnerMood: HubSummary['partnerMood'];
}) {
  const who = partnerName || 'Votre partenaire';
  const mood = partnerMood ? MOOD_PRESENTATION[partnerMood.mood] : null;

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
          {mood ? (
            <Image
              source={mood.imgUrl}
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
              {mood ? mood.label : 'Aujourd’hui'}
            </Text>
          </View>
          <Text
            className="text-[16px] font-bold leading-[21px]"
            style={{ color: GLASS_TITLE_COLOR }}
          >
            {mood ? `${who} ${mood.phrase}` : 'Pas encore de nouvelles'}
          </Text>
          {mood ? null : (
            <Text
              className="text-[13px] leading-[18px]"
              style={{ color: GLASS_BODY_COLOR }}
            >
              {`Son humeur apparaîtra ici dès que ${who} l’aura notée dans Ensemble.`}
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
            SES BESOINS DU JOUR
          </Text>
          {partnerMood?.needNote?.trim() ? (
            <NeedChips
              note={partnerMood.needNote}
              tone="light"
              color={PINK.accent}
            />
          ) : (
            <Text className="text-[13px]" style={{ color: GLASS_BODY_COLOR }}>
              Aucun besoin particulier précisé aujourd’hui.
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

  const weeks = getWeeksOfAmenorrhea(household?.due_date ?? null);
  const { data: babySize } = useBabySize(weeks);

  const partnerName = summary?.partnerFirstName?.trim();
  const otherRole = role === 'pregnant' ? 'partner' : 'pregnant';
  const myTip = getTipOfTheDay(role);
  const partnerTip = getTipOfTheDay(otherRole);

  const notJoinedText = partnerName
    ? `${partnerName} n’a pas encore rejoint votre espace. Sa tendance d’humeur apparaîtra ici dès qu’il ou elle aura créé son compte.`
    : 'Le co-parent n’a pas encore rejoint votre espace.';

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: PINK.background }}
    >
      <PinkBackdrop />

      <ScrollView
        contentContainerClassName="gap-7 px-6 pb-6 pt-4"
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
              accessibilityLabel="Revenir en arrière"
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
              {partnerName ? `Avec ${partnerName}` : 'Mon partenaire'}
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
            {partnerUserId ? null : (
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
            <SectionHeading icon="sunny-outline" label="SON ÉTAT AUJOURD’HUI" />
            <PartnerStateCard
              partnerName={partnerName ?? null}
              partnerMood={summary?.partnerMood ?? null}
            />
          </View>
        ) : null}

        {partnerUserId ? (
          <View className="gap-3.5">
            <SectionHeading
              icon="happy-outline"
              label="SON HUMEUR CETTE SEMAINE"
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
                  accent={PINK.accent}
                />
              </View>
            </View>
          </View>
        ) : null}

        <View className="gap-3.5">
          <SectionHeading
            icon="heart-outline"
            label="VOTRE BÉBÉ CETTE SEMAINE"
          />
          <PinkCard>
            <IllustrationTile emoji="🍼" />
            <View className="flex-1 gap-1">
              <Text
                className="text-[16px] font-bold"
                style={{ color: GLASS_TITLE_COLOR }}
              >
                {babySize?.fruit_label ?? 'Taille bientôt disponible'}
              </Text>
              <Text
                className="text-[13px] leading-[18px]"
                style={{ color: GLASS_BODY_COLOR }}
              >
                {weeks === null
                  ? 'Renseignez la date de terme pour suivre la croissance.'
                  : `${weeks} semaines d’aménorrhée${
                      babySize?.length_cm ? ` · ${babySize.length_cm} cm` : ''
                    }`}
              </Text>
            </View>
          </PinkCard>
        </View>

        {/* Les deux astuces sont visibles par les deux parents (CONCEPT.md :
            « une carte pour la femme, une carte pour le co-parent — partagé
            entre les deux »), d'où l'étiquetage explicite du destinataire. */}
        {myTip || partnerTip ? (
          <View className="gap-3.5">
            <SectionHeading icon="calendar-outline" label="ASTUCES DU JOUR" />
            {myTip ? (
              <TipCard emoji="💡" recipient="Pour vous" tip={myTip} />
            ) : null}
            {partnerTip ? (
              <TipCard
                emoji="💞"
                recipient={
                  partnerName ? `Pour ${partnerName}` : 'Pour le co-parent'
                }
                tip={partnerTip}
              />
            ) : null}
          </View>
        ) : null}

        <DashedLoopDoodle color={PINK.accent} />
      </ScrollView>
    </SafeAreaView>
  );
}

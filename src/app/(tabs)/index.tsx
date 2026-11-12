import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { HealthTodayCard } from '@/components/hub/health-today-card';
import { HowItWorksModal } from '@/components/hub/how-it-works-modal';
import { PillarCard } from '@/components/hub/pillar-card';
import { PremiumTeaserCard } from '@/components/hub/premium-teaser-card';
import { ShareInviteCard } from '@/components/hub/share-invite-card';
import { NeedChips } from '@/components/together/need-chips';
import {
  SparkLines,
  WAVE_LILAC,
  WAVE_MINT,
  WAVE_PEACH,
  WAVE_PINK,
} from '@/components/ui/glass-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useAppointments } from '@/features/health/hooks';
import { useMyHousehold } from '@/features/household/hooks';
import {
  CARD_SHADOW,
  formatAppointmentDate,
  formatAppointmentDayMonth,
  formatAppointmentTime,
  MOOD_PRESENTATION,
} from '@/features/hub/constants';
import { useHubSummary } from '@/features/hub/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { useThemeAccent, useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassAtom, devBypassFirstNameAtom } from '@/lib/atoms/dev-bypass';
import { currentRoleAtom } from '@/lib/atoms/role';
import { darkenHex, hexToRgba, lightenHex } from '@/lib/color';
import { shiftIsoDate, todayIso } from '@/lib/date';

const SafeAreaView = withUniwind(RNSafeAreaView);

/** Presse-papiers coché de la carte Démarches (illustration fournie, avec sa tuile). */
const DEMARCHES_ICON = require('@/assets/images/Icon_demarches.png');
/** Bulles de discussion de la carte Ensemble (illustration fournie, avec sa tuile). */
const ENSEMBLE_ICON = require('@/assets/images/Icon_ensemble.png');
/** Stéthoscope de la carte Suivi santé (illustration fournie, avec sa tuile). */
const SANTE_ICON = require('@/assets/images/Icon_sante.png');
/** Valise de naissance de la carte Organisation (illustration fournie, avec sa tuile). */
const ORGANISATION_ICON = require('@/assets/images/Icon_organisation.png');
/** Deux cœurs de la carte « Avec votre co-parent » (illustration fournie, préparée ronde). */
const COPARENT_ICON = require('@/assets/images/Icon_coparent.png');

/**
 * ⚠️ TEMPORAIRE — exemples affichés **en mode contournement DEV
 * uniquement** (pas de foyer, donc jamais de rendez-vous réel), pour
 * visualiser la section « Nos prochains rendez-vous ». Un vrai foyer sans
 * rendez-vous voit l'état vide : lui montrer de faux rendez-vous serait
 * trompeur (dette n°48). À retirer avec le mode contournement.
 */
const MOCK_APPOINTMENTS = [
  {
    id: 'mock-1',
    title: 'Échographie T3',
    date: shiftIsoDate(todayIso(), 6),
    time: '10:30',
    address: 'Maternité des Lilas',
  },
  {
    id: 'mock-2',
    title: 'Rendez-vous sage-femme',
    date: shiftIsoDate(todayIso(), 13),
    time: '14:00',
    address: null,
  },
  {
    id: 'mock-3',
    title: 'Cours de préparation à la naissance',
    date: shiftIsoDate(todayIso(), 20),
    time: '18:30',
    address: 'Cabinet Dr Martin',
  },
];

/**
 * Écran 2b / 3c / 3d — le hub.
 *
 * Un seul composant pour les deux rôles : ce qui change (visibilité du
 * bouton « J'ai accouché », contenu du bloc partenaire) est dérivé du rôle
 * courant, jamais dupliqué en deux écrans.
 *
 * ⚠️ Écart avec les maquettes : 3c **et** 3d affichent « J'ai accouché »,
 * alors que CONCEPT.md le réserve à la femme enceinte. CLAUDE.md tranche en
 * faveur de CONCEPT.md — le bouton n'apparaît donc que pour elle.
 *
 * Le **fond**, en revanche, n'est plus dérivé du rôle mais du thème
 * personnel choisi en Réglages (Phase 1.7) — pastel de la couleur d'accent
 * active (`useThemeBackground`), cohérent avec le fait que le thème est
 * propre à chaque compte, pas partagé. Même mécanisme sur les autres
 * écrans (`sante.tsx`, `demarches.tsx`, `ensemble.tsx`, `partenaire.tsx`).
 */
export default function HubScreen() {
  const { data: profile } = useMyProfile();
  const { data: household } = useMyHousehold();
  const { data: summary } = useHubSummary(household);
  const { data: appointments = [] } = useAppointments(household);
  const backgroundColor = useThemeBackground();
  const accent = useThemeAccent();

  // RLS filtre déjà les rendez-vous non partagés pour le co-parent — rien à
  // refaire ici (cf. src/features/health/api.ts). Déjà triés par date/heure
  // croissantes côté requête, il suffit de ne garder que l'avenir.
  const today = todayIso();
  const upcomingAppointments = appointments
    .filter((appointment) => appointment.appointment_date >= today)
    .slice(0, 3);

  // Exemples fictifs en mode contournement DEV seulement — voir
  // `MOCK_APPOINTMENTS`.
  const isDevBypass = useAtomValue(devBypassAtom) !== 'off';
  const displayedAppointments =
    upcomingAppointments.length > 0
      ? upcomingAppointments.map((appointment) => ({
          id: appointment.id,
          title: appointment.title,
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          address: appointment.address,
        }))
      : isDevBypass
        ? MOCK_APPOINTMENTS
        : [];

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts. Le sien, jamais le
  // prénom du co-parent : c'est le seul champ que ce contournement propage.
  const devBypassFirstName = useAtomValue(devBypassFirstNameAtom);
  const greetingName = profile?.first_name || devBypassFirstName || null;

  // Le rôle n'est pas encore résolu au tout premier rendu ; la vue « femme
  // enceinte » est le défaut, c'est elle qui crée le foyer.
  const role = useAtomValue(currentRoleAtom) ?? 'pregnant';
  const isPregnant = role === 'pregnant';

  const partnerName = summary?.partnerFirstName?.trim();
  const hasPartnerJoined = Boolean(household?.partner_user_id);
  const partnerMood = hasPartnerJoined ? (summary?.partnerMood ?? null) : null;
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  // Tant que le résumé n'est pas chargé, on affiche le libellé neutre de la
  // section plutôt qu'un indicateur de chargement : il s'afficherait dans
  // tous les cas, et resterait figé si la requête ne peut pas aboutir.
  // Jamais de chiffre inventé en repli.
  const proceduresState = summary
    ? summary.proceduresTodo === 0
      ? 'Tout est à jour'
      : `${summary.proceduresTodo} en attente`
    : 'Vos démarches administratives';

  const togetherState = summary?.hasCheckedInToday
    ? 'Humeur partagée aujourd’hui'
    : 'Check-in du jour';

  const healthState = summary?.nextAppointment
    ? `Prochain rendez-vous le ${formatAppointmentDate(summary.nextAppointment.date)}`
    : 'Journal du jour';

  const organisationState = summary?.checklistProgress
    ? summary.checklistProgress.total === 0
      ? 'Vos listes avant le grand jour'
      : summary.checklistProgress.checked === summary.checklistProgress.total
        ? 'Tout est prêt'
        : `${summary.checklistProgress.checked} sur ${summary.checklistProgress.total} complétés`
    : 'Valises de naissance et jeux des prénoms';

  return (
    <SafeAreaView
      className="flex-1 overflow-hidden"
      style={{ backgroundColor }}
    >
      <ScreenCornerShapes />

      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-[26px] font-bold text-[#1a1a1a]">
            {greetingName ? `Bonjour ${greetingName}` : 'Bonjour'}
          </Text>

          {/* Gélule d'accent avec cœur, reflet et petits traits, d'après une
              capture de référence (demande explicite) — remplace l'or
              (`PREMIUM_GOLD_ON_LIGHT`) choisi auparavant pour détacher ce
              bouton du titre : la taille, l'ombre teintée et les traits
              suffisent désormais à en faire l'action phare du hub, sans
              emprunter la couleur du premium. */}
          {isPregnant ? (
            <View>
              <SparkLines
                color={hexToRgba(accent, 0.6)}
                style={{
                  left: -20,
                  top: -14,
                  transform: [{ rotate: '-70deg' }, { scale: 0.85 }],
                }}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/naissance')}
                className="h-11 flex-row items-center gap-2 overflow-hidden rounded-full pl-3.5 pr-4 active:opacity-85"
                style={{
                  backgroundColor: accent,
                  shadowColor: accent,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 14,
                  elevation: 6,
                }}
              >
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    right: -22,
                    top: -18,
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: lightenHex(accent, 0.12),
                    opacity: 0.6,
                  }}
                />
                <Ionicons name="heart" size={17} color="#ffffff" />
                <Text className="text-[14px] font-bold text-white">
                  J’ai accouché
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* L'humeur et les besoins du jour de l'autre parent vivent dans la
            carte « Mon partenaire » plus bas (demande explicite) ; ici, seule
            l'invitation tant que le co-parent n'a pas rejoint. */}
        {hasPartnerJoined ? null : (
          <ShareInviteCard
            onAddPartner={() => router.push('/partenaire')}
            onHowItWorks={() => setIsHowItWorksOpen(true)}
          />
        )}

        {/* État de santé du jour + astuce, juste avant les sections
            (demande explicite) — visible des deux parents. */}
        <HealthTodayCard
          household={household}
          role={role}
          partnerName={partnerName ?? null}
          pregnantMood={summary?.pregnantMood ?? null}
        />

        <View className="gap-2">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            VOS SECTIONS
          </Text>
          <View className="gap-3">
            <PillarCard
              id="demarches"
              emoji="📋"
              image={DEMARCHES_ICON}
              imageFillsTile
              title="Démarches"
              state={proceduresState}
              waveColor={WAVE_PEACH}
              onPress={() => router.push('/demarches')}
            />
            <PillarCard
              id="ensemble"
              emoji="💬"
              image={ENSEMBLE_ICON}
              imageFillsTile
              title="Ensemble"
              state={togetherState}
              waveColor={WAVE_PINK}
              onPress={() => router.push('/ensemble')}
            />
            <PillarCard
              id="sante"
              emoji="🩺"
              image={SANTE_ICON}
              imageFillsTile
              title="Suivi santé"
              state={healthState}
              waveColor={WAVE_MINT}
              onPress={() => router.push('/sante')}
            />
          </View>

          {/* Hors du bloc des 3 piliers (CONCEPT.md : poids visuel égal
              réservé à Démarches/Ensemble/Suivi santé) — nouvelle section,
              pas un 4e pilier, demande explicite placée juste en dessous. */}
          <View className="mt-1">
            <PillarCard
              id="organisation"
              emoji="🧳"
              image={ORGANISATION_ICON}
              imageFillsTile
              title="Organisation & Préparation"
              state={organisationState}
              waveColor={WAVE_LILAC}
              onPress={() => router.push('/organisation')}
            />
          </View>

          {/* Traitement visuel distinct : « Votre bébé » n'est pas un 4e
              pilier, c'est le module premium, verrouillé hors MVP — même
              carte teaser sobre que « Le match des prénoms »
              (PremiumTeaserCard), pour un langage visuel cohérent. */}
          <View className="mt-1">
            <PremiumTeaserCard
              icon={
                <Image
                  source={require('@/assets/images/Baby_head.png')}
                  className="h-7 w-6"
                  resizeMode="contain"
                />
              }
              title="Votre bébé"
              subtitle="Courbe de croissance"
              onPress={() => router.push('/bebe')}
            />
          </View>
        </View>

        {/* Toujours affiché, même avant l'arrivée du co-parent : la
            maquette 2b ne montrait ce bloc qu'une fois l'espace partagé,
            mais depuis la Phase 1.5 cet écran porte aussi la taille du bébé
            et les astuces du jour — le masquer les rendrait inatteignables.
            Seul le sous-titre s'adapte. */}
        <View className="gap-2">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            MON PARTENAIRE
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/partenaire')}
            style={CARD_SHADOW}
            className="overflow-hidden rounded-2xl bg-[#cf6d8c] px-4 py-4"
          >
            {/* Deux formes plutôt qu'une seule (contrairement à
                PremiumTeaserCard) : le duo évoque « à deux », cohérent avec
                le sujet de la carte. */}
            <View
              pointerEvents="none"
              className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/15"
            />
            <View
              pointerEvents="none"
              className="absolute -bottom-10 -left-6 h-20 w-20 rounded-full bg-white/10"
            />

            <View className="flex-1 gap-3">
              <View className="flex-row items-center gap-3.5">
                {partnerMood ? (
                  <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/25">
                    <Image
                      source={MOOD_PRESENTATION[partnerMood.mood].imgUrl}
                      style={{ width: 44, height: 44 }}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  // Icône 3D des deux cœurs (fournie par l'utilisateur,
                  // demande explicite) à la place de l'émoji 💕. Image
                  // préparée ronde, cœurs réduits au centre (demandes
                  // explicites) : affichée telle quelle.
                  <Image
                    source={COPARENT_ICON}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                )}

                <View className="flex-1 gap-0.5">
                  <Text className="text-[16px] font-semibold text-white">
                    {partnerName
                      ? `Avec ${partnerName}`
                      : 'Avec votre co-parent'}
                  </Text>
                  <Text className="text-[13px] text-white/80">
                    {!hasPartnerJoined
                      ? 'Taille du bébé et astuces du jour'
                      : partnerMood
                        ? `${MOOD_PRESENTATION[partnerMood.mood].label} aujourd’hui`
                        : 'Pas encore de nouvelles aujourd’hui'}
                  </Text>
                </View>
                <Text className="text-[20px] text-white/60">›</Text>
              </View>

              {hasPartnerJoined && partnerMood?.needNote ? (
                <View className="gap-1.5">
                  <Text className="text-[11px] font-bold tracking-wide text-white/75">
                    SES BESOINS DU JOUR
                  </Text>
                  <NeedChips
                    note={partnerMood.needNote}
                    tone="onColor"
                    color="#ffffff"
                  />
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>

        <View className="gap-2">
          {/* Seul intitulé de section aligné à droite (demande explicite),
              pour détacher les rendez-vous des sections qui le précèdent. */}
          <Text className="text-right text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            NOS PROCHAINS RENDEZ-VOUS
          </Text>

          <View className="gap-2">
            {displayedAppointments.length === 0 ? (
              <Text className="text-right text-[13px] text-[#9a9a9a]">
                Aucun rendez-vous à venir.
              </Text>
            ) : null}
            {displayedAppointments.map((appointment) => {
              const { weekday, day, month } = formatAppointmentDayMonth(
                appointment.date,
              );
              const time = formatAppointmentTime(appointment.time);
              const subtitle = [appointment.address, time]
                .filter(Boolean)
                .join(' · ');

              return (
                <Pressable
                  key={appointment.id}
                  accessibilityRole="button"
                  onPress={() => router.push('/sante?tab=appointments')}
                  style={CARD_SHADOW}
                  className="flex-row items-center justify-between gap-3 rounded-2xl border border-[#e0e0e0] bg-white px-4 py-5"
                >
                  <View className="flex-1 gap-0.5">
                    <Text className="text-[16px] font-semibold text-[#1a1a1a]">
                      {appointment.title}
                    </Text>
                    {subtitle ? (
                      <Text className="text-[13px] text-[#6b6b6b]">
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>
                  {/* Pavé date teinté du fond d'écran (demande explicite) :
                      même famille de couleur que la page, chiffres en
                      accent — il suit le thème choisi. */}
                  <View
                    className="h-[72px] w-[68px] items-center justify-center rounded-[20px]"
                    style={{
                      backgroundColor: darkenHex(backgroundColor, 0.04),
                    }}
                  >
                    <Text
                      className="text-[12.5px] font-medium leading-4"
                      style={{ color: accent }}
                    >
                      {capitalize(weekday)}
                    </Text>
                    <Text
                      className="text-[24px] font-extrabold leading-7"
                      style={{ color: accent }}
                    >
                      {day}
                    </Text>
                    <Text
                      className="text-[12.5px] font-medium leading-4"
                      style={{ color: accent }}
                    >
                      {month}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <HowItWorksModal
        visible={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />
    </SafeAreaView>
  );
}

/** « lun. » → « Lun. » */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

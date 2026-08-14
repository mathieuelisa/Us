import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { HowItWorksModal } from '@/components/hub/how-it-works-modal';
import { PillarCard } from '@/components/hub/pillar-card';
import { PremiumTeaserCard } from '@/components/hub/premium-teaser-card';
import { ScreenCornerShapes } from '@/components/ui/screen-corner-shapes';
import { useAppointments } from '@/features/health/hooks';
import { useMyHousehold } from '@/features/household/hooks';
import {
  CARD_SHADOW,
  formatAppointmentDate,
  formatAppointmentDayMonth,
  formatAppointmentTime,
  MOOD_PRESENTATION,
  PREMIUM_GOLD_ON_LIGHT,
} from '@/features/hub/constants';
import { useHubSummary } from '@/features/hub/hooks';
import { useMyProfile } from '@/features/profile/hooks';
import { useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassFirstNameAtom } from '@/lib/atoms/dev-bypass';
import { currentRoleAtom } from '@/lib/atoms/role';
import { shiftIsoDate, todayIso } from '@/lib/date';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * ⚠️ TEMPORAIRE — aucun rendez-vous réel tant que l'onboarding ne permet
 * pas encore d'en créer facilement. Sert uniquement à visualiser le rendu
 * de la section « Nos rendez-vous » ; à retirer dès que des rendez-vous
 * réels existent (l'état vide légitime redeviendra alors visible).
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

  // RLS filtre déjà les rendez-vous non partagés pour le co-parent — rien à
  // refaire ici (cf. src/features/health/api.ts). Déjà triés par date/heure
  // croissantes côté requête, il suffit de ne garder que l'avenir.
  const today = todayIso();
  const upcomingAppointments = appointments
    .filter((appointment) => appointment.appointment_date >= today)
    .slice(0, 3);

  // Tant qu'aucun rendez-vous réel n'existe, on affiche des exemples
  // fictifs plutôt qu'un état vide — voir `MOCK_APPOINTMENTS`.
  const displayedAppointments =
    upcomingAppointments.length > 0
      ? upcomingAppointments.map((appointment) => ({
          id: appointment.id,
          title: appointment.title,
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          address: appointment.address,
        }))
      : MOCK_APPOINTMENTS;

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

          {isPregnant ? (
            <Pressable
              accessibilityRole="button"
              style={CARD_SHADOW}
              onPress={() => router.push('/naissance')}
              className="rounded-full bg-accent px-3.5 py-2"
            >
              <Text className="text-[13px] font-medium text-accent-foreground">
                J’ai accouché
              </Text>
            </Pressable>
          ) : null}
        </View>

        {hasPartnerJoined ? (
          <View className="gap-2">
            <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
              HUMEUR DU JOUR
            </Text>
            <View className="flex-row items-center gap-3.5 rounded-2xl bg-white px-4 py-4">
              <Text className="text-[28px]">
                {summary?.partnerMood
                  ? MOOD_PRESENTATION[summary.partnerMood.mood].emoji
                  : '🌱'}
              </Text>
              <View className="flex-1 gap-0.5">
                <Text className="text-[15px] font-medium text-[#1a1a1a]">
                  {partnerName
                    ? `${partnerName} aujourd’hui`
                    : 'Votre co-parent aujourd’hui'}
                </Text>
                <Text className="text-[13px] text-[#6b6b6b]">
                  {summary?.partnerMood
                    ? summary.partnerMood.needNote?.trim() ||
                      `${partnerName ?? 'Votre co-parent'} ${MOOD_PRESENTATION[summary.partnerMood.mood].phrase}`
                    : 'Pas encore de nouvelles aujourd’hui'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={CARD_SHADOW}
            className="gap-3 rounded-2xl bg-white px-4 py-4"
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-[15px] font-semibold text-[#1a1a1a]">
                  Partager vos infos à deux
                </Text>
                <Text className="text-[13px] leading-5 text-[#6b6b6b]">
                  Ajouter le co-parent ou un proche, tout se synchronisera en
                  temps réel.
                </Text>
              </View>
              {/* Repli emoji — remplacé par une image plus tard. */}
              <Text className="text-[28px]">🤝</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/partenaire')}
              className="items-center rounded-full bg-accent py-2.5"
            >
              <Text className="text-[14px] font-medium text-accent-foreground">
                Ajouter le co-parent
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setIsHowItWorksOpen(true)}
              className="items-center py-1"
            >
              <Text className="text-[13px] font-medium text-accent">
                Comment ça marche ?
              </Text>
            </Pressable>
          </View>
        )}

        <View className="gap-2">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            VOS SECTIONS
          </Text>
          <View className="gap-2.5">
            <PillarCard
              emoji="📋"
              title="Démarches"
              state={proceduresState}
              onPress={() => router.push('/demarches')}
            />
            <PillarCard
              emoji="💬"
              title="Ensemble"
              state={togetherState}
              onPress={() => router.push('/ensemble')}
            />
            <PillarCard
              emoji="🩺"
              title="Suivi santé"
              state={healthState}
              onPress={() => router.push('/sante')}
            />
          </View>

          {/* Hors du bloc des 3 piliers (CONCEPT.md : poids visuel égal
              réservé à Démarches/Ensemble/Suivi santé) — nouvelle section,
              pas un 4e pilier, demande explicite placée juste en dessous. */}
          <View className="mt-1">
            <PillarCard
              emoji="🧳"
              title="Organisation & Préparation"
              state={organisationState}
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
            className="flex-row items-center gap-3.5 overflow-hidden rounded-2xl bg-[#cf6d8c] px-4 py-4"
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

            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Text className="text-[20px]">💕</Text>
            </View>

            <View className="flex-1 gap-0.5">
              <Text className="text-[16px] font-semibold text-white">
                {partnerName ? `Avec ${partnerName}` : 'Avec votre co-parent'}
              </Text>
              <Text className="text-[13px] text-white/75">
                {hasPartnerJoined
                  ? 'Voir son état cette semaine'
                  : 'Taille du bébé et astuces du jour'}
              </Text>
            </View>
            <Text className="text-[20px] text-white/60">›</Text>
          </Pressable>
        </View>

        <View className="gap-2">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            NOS RENDEZ-VOUS
          </Text>

          <View className="gap-2">
            {displayedAppointments.map((appointment) => {
              const { day, month } = formatAppointmentDayMonth(
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
                  <View className="items-end">
                    <Text
                      className="text-[26px] font-bold leading-7"
                      style={{ color: PREMIUM_GOLD_ON_LIGHT }}
                    >
                      {day}
                    </Text>
                    <Text className="text-[12px] text-[#6b6b6b]">{month}</Text>
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

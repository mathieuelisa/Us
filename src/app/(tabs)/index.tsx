import { router } from 'expo-router';
import { useAtomValue } from 'jotai';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { PillarCard } from '@/components/hub/pillar-card';
import { useMyHousehold } from '@/features/household/hooks';
import {
  formatAppointmentDate,
  MOOD_PRESENTATION,
  ROLE_BACKGROUND,
} from '@/features/hub/constants';
import { useHubSummary } from '@/features/hub/hooks';
import { useMyProfile } from '@/features/profile/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassFirstNameAtom } from '@/lib/atoms/dev-bypass';
import { currentRoleAtom } from '@/lib/atoms/role';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écran 2b / 3c / 3d — le hub.
 *
 * Un seul composant pour les deux rôles : ce qui change (fond, visibilité
 * du bouton « J'ai accouché », contenu du bloc partenaire) est dérivé du
 * rôle courant, jamais dupliqué en deux écrans.
 *
 * ⚠️ Écart avec les maquettes : 3c **et** 3d affichent « J'ai accouché »,
 * alors que CONCEPT.md le réserve à la femme enceinte. CLAUDE.md tranche en
 * faveur de CONCEPT.md — le bouton n'apparaît donc que pour elle.
 */
export default function HubScreen() {
  const { data: profile } = useMyProfile();
  const { data: household } = useMyHousehold();
  const { data: summary } = useHubSummary(household);

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

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: ROLE_BACKGROUND[role] }}
    >
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
            <View className="flex-row items-center gap-3.5 rounded-[16px] bg-white px-4 py-4">
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
          <View className="gap-3 rounded-[16px] bg-white px-4 py-4">
            <Text className="text-[15px] leading-5 text-[#1a1a1a]">
              {partnerName
                ? `Inviter ${partnerName} à rejoindre votre espace ?`
                : 'Inviter le co-parent à rejoindre votre espace ?'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/partenaire')}
              className="items-center rounded-full bg-accent py-2.5"
            >
              <Text className="text-[14px] font-medium text-accent-foreground">
                Inviter
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

          {/* Traitement visuel distinct : « Votre bébé » n'est pas un 4e
              pilier, c'est le module premium, verrouillé hors MVP. */}
          <View className="mt-1 flex-row items-center gap-3.5 rounded-[16px] bg-[#1a1a1a] px-4 py-4">
            <Text className="text-[20px]">👶</Text>
            <View className="flex-1 gap-0.5">
              <Text className="text-[16px] font-semibold text-white">
                Votre bébé
              </Text>
              <Text className="text-[13px] text-[#b0b0b0]">
                Courbe de croissance
              </Text>
            </View>
            <View className="rounded-full bg-[#e8c874] px-2.5 py-1">
              <Text className="text-[10px] font-bold text-[#1a1a1a]">
                PREMIUM
              </Text>
            </View>
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
            className="flex-row items-center gap-3.5 rounded-[16px] border border-[#e0e0e0] bg-white px-4 py-4"
          >
            <Text className="text-[20px]">💕</Text>
            <View className="flex-1 gap-0.5">
              <Text className="text-[16px] font-semibold text-[#1a1a1a]">
                {partnerName ? `Avec ${partnerName}` : 'Avec votre co-parent'}
              </Text>
              <Text className="text-[13px] text-[#6b6b6b]">
                {hasPartnerJoined
                  ? 'Voir son état cette semaine'
                  : 'Taille du bébé et astuces du jour'}
              </Text>
            </View>
            <Text className="text-[20px] text-[#c0c0c0]">›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

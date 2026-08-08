import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { WeekMoodStrip } from '@/components/together/week-mood-strip';
import { getWeeksOfAmenorrhea } from '@/features/health/constants';
import { useBabySize } from '@/features/health/hooks';
import { useMyHousehold } from '@/features/household/hooks';
import { getPartnerUserId } from '@/features/hub/api';
import { useHubSummary } from '@/features/hub/hooks';
import { getTipOfTheDay } from '@/features/partner/constants';
import { useThemeBackground } from '@/features/settings/hooks';
import { getCurrentWeekIsoDates } from '@/features/together/api';
import { useWeekCheckinsFor } from '@/features/together/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';
import { sessionAtom } from '@/lib/atoms/session';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Section « Mon partenaire » — bloc indépendant ouvert depuis le hub, pas un
 * 4e pilier (CONCEPT.md).
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
  const backgroundColor = useThemeBackground();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView
        contentContainerClassName="gap-6 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {router.canGoBack() ? (
          <Pressable
            accessibilityLabel="Revenir en arrière"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-white"
          >
            <Text className="text-[17px] leading-[20px] text-[#1a1a1a]">‹</Text>
          </Pressable>
        ) : null}

        <Text className="text-[26px] font-bold text-[#1a1a1a]">
          {partnerName ? `Avec ${partnerName}` : 'Mon partenaire'}
        </Text>

        {partnerUserId ? (
          <View className="gap-3">
            <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
              SON HUMEUR CETTE SEMAINE
            </Text>
            <View className="rounded-[16px] bg-white px-4 py-4">
              <WeekMoodStrip
                weekDates={weekDates}
                checkinsByDate={partnerCheckins}
              />
            </View>
          </View>
        ) : (
          <View className="rounded-[16px] bg-white px-4 py-4">
            <Text className="text-[14px] leading-5 text-[#6b6b6b]">
              {partnerName
                ? `${partnerName} n’a pas encore rejoint votre espace. Sa tendance d’humeur apparaîtra ici dès qu’il ou elle aura créé son compte.`
                : 'Le co-parent n’a pas encore rejoint votre espace.'}
            </Text>
          </View>
        )}

        <View className="gap-3">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            VOTRE BÉBÉ CETTE SEMAINE
          </Text>
          <View className="flex-row items-center gap-3.5 rounded-[16px] bg-white px-4 py-4">
            <Text className="text-[28px]">🍼</Text>
            <View className="flex-1 gap-0.5">
              <Text className="text-[15px] font-medium text-[#1a1a1a]">
                {babySize?.fruit_label ?? 'Taille bientôt disponible'}
              </Text>
              <Text className="text-[13px] text-[#6b6b6b]">
                {weeks === null
                  ? 'Renseignez la date de terme pour suivre la croissance.'
                  : `${weeks} semaines d’aménorrhée${
                      babySize?.length_cm ? ` · ${babySize.length_cm} cm` : ''
                    }`}
              </Text>
            </View>
          </View>
        </View>

        {/* Les deux astuces sont visibles par les deux parents (CONCEPT.md :
            « une carte pour la femme, une carte pour le co-parent — partagé
            entre les deux »), d'où l'étiquetage explicite du destinataire. */}
        <View className="gap-3">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            ASTUCES DU JOUR
          </Text>

          {myTip ? (
            <View className="gap-1 rounded-[16px] bg-white px-4 py-4">
              <Text className="text-[11.5px] font-medium text-accent">
                Pour vous
              </Text>
              <Text className="text-[14px] leading-5 text-[#1a1a1a]">
                {myTip}
              </Text>
            </View>
          ) : null}

          {partnerTip ? (
            <View className="gap-1 rounded-[16px] border border-[#e8e8e8] bg-white px-4 py-4">
              <Text className="text-[11.5px] font-medium text-[#8a8a8a]">
                {partnerName ? `Pour ${partnerName}` : 'Pour le co-parent'}
              </Text>
              <Text className="text-[14px] leading-5 text-[#1a1a1a]">
                {partnerTip}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

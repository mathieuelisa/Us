import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { StatusBadge } from '@/components/procedures/status-badge';
import { StatusSelector } from '@/components/procedures/status-selector';
import { useMyHousehold } from '@/features/household/hooks';
import { ROLE_BACKGROUND } from '@/features/hub/constants';
import { formatDeadlineLabel } from '@/features/procedures/constants';
import {
  useProcedures,
  useUpdateProcedureReminder,
  useUpdateProcedureStatus,
} from '@/features/procedures/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écrans 5a/5b — pilier Démarches. Liste et détail dans un seul écran, avec
 * l'affichage basculé par état local plutôt que par une route imbriquée —
 * même parti pris que le pilier Suivi santé (`sante.tsx`).
 *
 * Le référentiel des 6 démarches (`procedure_templates`) est partagé par
 * tout le foyer, modifiable par les deux parents : pas de règle de
 * visibilité par rôle ici, contrairement aux piliers Ensemble et Suivi
 * santé.
 */
export default function ProceduresScreen() {
  const router = useRouter();
  const { data: household } = useMyHousehold();
  const role = useAtomValue(currentRoleAtom) ?? 'pregnant';

  const { data: procedures = [] } = useProcedures(household);
  const updateStatus = useUpdateProcedureStatus(household);
  const updateReminder = useUpdateProcedureReminder(household);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = procedures.find(
    (procedure) => procedure.householdProcedureId === selectedId,
  );

  const completedCount = procedures.filter((p) => p.status === 'fait').length;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: ROLE_BACKGROUND[role] }}
    >
      <ScrollView
        contentContainerClassName="gap-5 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Revenir en arrière"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => (selected ? setSelectedId(null) : router.back())}
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <Text className="text-[17px] leading-[20px] text-[#1a1a1a]">‹</Text>
        </Pressable>

        {selected ? (
          <ProcedureDetail
            procedure={selected}
            birthDate={household?.birth_date ?? null}
            onChangeStatus={(status) =>
              updateStatus.mutate({
                householdProcedureId: selected.householdProcedureId,
                status,
              })
            }
            onToggleReminder={(reminderEnabled) =>
              updateReminder.mutate({
                householdProcedureId: selected.householdProcedureId,
                reminderEnabled,
              })
            }
          />
        ) : (
          <>
            <View className="gap-1">
              <Text className="text-[26px] font-bold text-[#1a1a1a]">
                Démarches
              </Text>
              <Text className="text-[13px] text-[#6b6b6b]">
                {completedCount} sur {procedures.length || 6} complétées
              </Text>
            </View>

            <View className="gap-2.5">
              {procedures.map((procedure) => {
                const deadline = formatDeadlineLabel(
                  procedure.deadline_days_after_birth,
                  household?.birth_date ?? null,
                );
                return (
                  <Pressable
                    key={procedure.householdProcedureId}
                    accessibilityRole="button"
                    onPress={() =>
                      setSelectedId(procedure.householdProcedureId)
                    }
                    className="flex-row items-center gap-3 rounded-[16px] bg-white px-4 py-3.5"
                  >
                    <View className="flex-1 gap-0.5">
                      <Text className="text-[15px] font-medium text-[#1a1a1a]">
                        {procedure.title}
                      </Text>
                      <Text className="text-[13px] text-[#6b6b6b]">
                        {deadline ?? procedure.description}
                      </Text>
                    </View>
                    <StatusBadge status={procedure.status} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProcedureDetail({
  procedure,
  birthDate,
  onChangeStatus,
  onToggleReminder,
}: {
  procedure: {
    title: string;
    description: string | null;
    documents: string[];
    official_link: string | null;
    deadline_days_after_birth: number | null;
    status: string;
    reminderEnabled: boolean;
  };
  birthDate: string | null;
  onChangeStatus: (status: 'a_faire' | 'en_cours' | 'fait') => void;
  onToggleReminder: (reminderEnabled: boolean) => void;
}) {
  const deadline = formatDeadlineLabel(
    procedure.deadline_days_after_birth,
    birthDate,
  );

  return (
    <View className="gap-5">
      <View className="gap-1">
        <Text className="text-[24px] font-bold text-[#1a1a1a]">
          {procedure.title}
        </Text>
        {deadline ? (
          <Text className="text-[13px] font-medium text-accent">
            {deadline}
          </Text>
        ) : null}
      </View>

      {procedure.description ? (
        <Text className="text-[14px] leading-5 text-[#6b6b6b]">
          {procedure.description}
        </Text>
      ) : null}

      <View className="gap-2.5">
        <Text className="text-[13px] font-medium text-[#1a1a1a]">Statut</Text>
        <StatusSelector status={procedure.status} onChange={onChangeStatus} />
      </View>

      {procedure.documents.length > 0 ? (
        <View className="gap-2.5">
          <Text className="text-[13px] font-medium text-[#1a1a1a]">
            Documents à fournir
          </Text>
          <View className="gap-2 rounded-[16px] bg-white px-4 py-3.5">
            {procedure.documents.map((document) => (
              <View key={document} className="flex-row items-start gap-2">
                <Text className="text-[13px] text-accent">•</Text>
                <Text className="flex-1 text-[14px] text-[#1a1a1a]">
                  {document}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="flex-row items-center justify-between gap-3 rounded-[12px] bg-white px-3.5 py-3">
        <Text className="flex-1 text-[14px] text-[#1a1a1a]">
          Me rappeler avant l’échéance
        </Text>
        <Switch
          value={procedure.reminderEnabled}
          onValueChange={onToggleReminder}
          trackColor={{ true: '#2D5E5A' }}
        />
      </View>

      {/* Pas d'explication de procédure dans l'app (CONCEPT.md) : juste le
          lien vers le téléservice officiel. Absent pour la mutuelle — c'est
          un assureur privé propre à chaque foyer, aucun lien officiel
          générique n'existe. */}
      {procedure.official_link ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => Linking.openURL(procedure.official_link as string)}
          className="items-center rounded-full bg-accent py-3.5"
        >
          <Text className="text-[15px] font-medium text-accent-foreground">
            Accéder au téléservice officiel ↗
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

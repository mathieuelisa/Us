import { Ionicons } from '@expo/vector-icons';
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
import { CARD_SHADOW } from '@/features/hub/constants';
import {
  formatDeadlineLabel,
  getProcedureIconStyle,
} from '@/features/procedures/constants';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { DEV_PROCEDURES_FIXTURE } from '@/features/procedures/dev-fixture';
import {
  useProcedures,
  useUpdateProcedureReminder,
  useUpdateProcedureStatus,
} from '@/features/procedures/hooks';
import { useThemeBackground } from '@/features/settings/hooks';
// ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts
import { devBypassAtom } from '@/lib/atoms/dev-bypass';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écrans 5a/5b — pilier Démarches. Liste et détail dans un seul écran, avec
 * l'affichage basculé par état local plutôt que par une route imbriquée —
 * même parti pris que le pilier Suivi santé (`sante.tsx`).
 *
 * Le référentiel des 8 démarches (`procedure_templates`) est partagé par
 * tout le foyer, modifiable par les deux parents : pas de règle de
 * visibilité par rôle ici, contrairement aux piliers Ensemble et Suivi
 * santé. Étendu de 6 à 8 sur demande explicite (Assurance habitation,
 * Administration fiscale) — écart assumé avec CONCEPT.md, qui n'en liste
 * que 6.
 */
export default function ProceduresScreen() {
  const router = useRouter();
  const { data: household } = useMyHousehold();

  const { data: remoteProcedures = [] } = useProcedures(household);
  const updateStatus = useUpdateProcedureStatus(household);
  const updateReminder = useUpdateProcedureReminder(household);

  // ⚠️ TEMPORAIRE — voir src/lib/atoms/dev-bypass.ts. Sans foyer réel,
  // remoteProcedures reste toujours vide (la requête est désactivée) : cet
  // écran ne montrerait jamais rien à explorer. Les modifications de statut
  // et de rappel restent locales, elles n'écrivent jamais dans Supabase.
  const isDevBypass = useAtomValue(devBypassAtom) !== 'off';
  const [devProcedures, setDevProcedures] = useState(DEV_PROCEDURES_FIXTURE);
  const procedures = isDevBypass ? devProcedures : remoteProcedures;

  const changeStatus = (
    householdProcedureId: string,
    status: 'a_faire' | 'en_cours' | 'fait',
  ) => {
    if (isDevBypass) {
      setDevProcedures((current) =>
        current.map((procedure) =>
          procedure.householdProcedureId === householdProcedureId
            ? { ...procedure, status }
            : procedure,
        ),
      );
      return;
    }
    updateStatus.mutate({ householdProcedureId, status });
  };

  const toggleReminder = (
    householdProcedureId: string,
    reminderEnabled: boolean,
  ) => {
    if (isDevBypass) {
      setDevProcedures((current) =>
        current.map((procedure) =>
          procedure.householdProcedureId === householdProcedureId
            ? { ...procedure, reminderEnabled }
            : procedure,
        ),
      );
      return;
    }
    updateReminder.mutate({ householdProcedureId, reminderEnabled });
  };

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = procedures.find(
    (procedure) => procedure.householdProcedureId === selectedId,
  );

  const completedCount = procedures.filter((p) => p.status === 'fait').length;
  const backgroundColor = useThemeBackground();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView
        contentContainerClassName="gap-5 px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityLabel="Revenir en arrière"
          accessibilityRole="button"
          hitSlop={12}
          style={CARD_SHADOW}
          onPress={() => (selected ? setSelectedId(null) : router.back())}
          className="h-9 w-9 items-center justify-center rounded-full bg-white"
        >
          <Text className="text-[17px] leading-5 text-[#1a1a1a]">‹</Text>
        </Pressable>

        {selected ? (
          <ProcedureDetail
            procedure={selected}
            birthDate={household?.birth_date ?? null}
            onChangeStatus={(status) =>
              changeStatus(selected.householdProcedureId, status)
            }
            onToggleReminder={(reminderEnabled) =>
              toggleReminder(selected.householdProcedureId, reminderEnabled)
            }
          />
        ) : (
          <>
            <View className="gap-1">
              <Text className="text-[26px] font-bold text-[#1a1a1a]">
                Démarches
              </Text>
              <Text className="text-[13px] text-[#6b6b6b]">
                {completedCount} sur {procedures.length || 8} complétées
              </Text>
            </View>

            <View className="gap-2.5">
              {procedures.map((procedure) => {
                const deadline = formatDeadlineLabel(
                  procedure.deadline_days_after_birth,
                  household?.birth_date ?? null,
                );
                const iconStyle = getProcedureIconStyle(procedure.slug);
                return (
                  <Pressable
                    key={procedure.householdProcedureId}
                    accessibilityRole="button"
                    style={CARD_SHADOW}
                    onPress={() =>
                      setSelectedId(procedure.householdProcedureId)
                    }
                    className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3.5"
                  >
                    <View
                      style={{ backgroundColor: iconStyle.bg }}
                      className="h-11 w-11 items-center justify-center rounded-full"
                    >
                      <Ionicons
                        name={iconStyle.icon}
                        size={20}
                        color={iconStyle.color}
                      />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-[15px] font-medium text-[#1a1a1a]">
                          {procedure.title}
                        </Text>
                        {procedure.reminderEnabled ? (
                          <View
                            accessibilityLabel="Rappel activé avant l’échéance"
                            className="h-4 w-4 items-center justify-center rounded-full bg-accent/15"
                          >
                            <Ionicons
                              name="notifications"
                              size={10}
                              color="#2D5E5A"
                            />
                          </View>
                        ) : null}
                      </View>
                      <Text className="text-[13px] text-[#6b6b6b]">
                        {deadline}
                      </Text>
                    </View>
                    <StatusBadge
                      status={procedure.status}
                      todoColor={{ bg: iconStyle.bg, text: iconStyle.color }}
                    />
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
          <View className="gap-2 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
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

      <View className="flex-row items-center justify-between gap-3 shadow-sm rounded-xl bg-white px-3.5 py-3">
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

import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { AppointmentsTab } from '@/components/health/appointments-tab';
import { ContactsTab } from '@/components/health/contacts-tab';
import { ExercisesTab } from '@/components/health/exercises-tab';
import { JournalTab } from '@/components/health/journal-tab';
import { SegmentedTabs } from '@/components/health/segmented-tabs';
import { useMyHousehold } from '@/features/household/hooks';
import { useThemeBackground } from '@/features/settings/hooks';
import { currentRoleAtom } from '@/lib/atoms/role';

const SafeAreaView = withUniwind(RNSafeAreaView);

type HealthTab = 'journal' | 'appointments' | 'contacts' | 'exercises';

/**
 * Écrans 4a/4b/4c/4f — pilier Suivi santé.
 *
 * ⚠️ Vue de la personne enceinte pour l'instant (demande explicite) ; la
 * vue du co-parent viendra dans une passe dédiée. La règle de visibilité la
 * plus sensible est toutefois **déjà appliquée** : l'onglet Journal
 * n'existe pas pour le co-parent — il est retiré de la liste, pas grisé.
 * C'est une donnée de santé, cette règle ne se rajoute pas « plus tard ».
 */
export default function HealthScreen() {
  const router = useRouter();
  const { data: household } = useMyHousehold();
  const role = useAtomValue(currentRoleAtom) ?? 'pregnant';
  const isPregnant = role === 'pregnant';

  const tabs = useMemo(() => {
    const journalTab = { value: 'journal' as const, label: 'Journal' };
    const sharedTabs = [
      { value: 'appointments' as const, label: 'Rendez-vous' },
      { value: 'contacts' as const, label: 'Contacts' },
      { value: 'exercises' as const, label: 'Exercices' },
    ];
    return isPregnant ? [journalTab, ...sharedTabs] : sharedTabs;
  }, [isPregnant]);

  const [activeTab, setActiveTab] = useState<HealthTab>(
    isPregnant ? 'journal' : 'appointments',
  );
  const [isAddingContact, setIsAddingContact] = useState(false);
  const backgroundColor = useThemeBackground();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView
        contentContainerClassName={`gap-5 px-6 pt-4 ${
          activeTab === 'contacts' ? 'pb-28' : 'pb-10'
        }`}
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
          Suivi santé
        </Text>

        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <View>
          {activeTab === 'journal' && isPregnant ? (
            <JournalTab household={household} />
          ) : null}
          {activeTab === 'appointments' ? (
            <AppointmentsTab household={household} isPregnant={isPregnant} />
          ) : null}
          {activeTab === 'contacts' ? (
            <ContactsTab
              household={household}
              isAdding={isAddingContact}
              onIsAddingChange={setIsAddingContact}
            />
          ) : null}
          {activeTab === 'exercises' ? (
            <ExercisesTab household={household} />
          ) : null}
        </View>
      </ScrollView>

      {activeTab === 'contacts' && !isAddingContact ? (
        <Pressable
          accessibilityLabel="Ajouter un contact"
          accessibilityRole="button"
          onPress={() => setIsAddingContact(true)}
          className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-accent shadow-lg"
        >
          <Text className="text-[26px] font-medium leading-7 text-accent-foreground">
            +
          </Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

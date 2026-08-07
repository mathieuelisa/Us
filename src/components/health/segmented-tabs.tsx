import { Pressable, ScrollView, Text } from 'react-native';

/**
 * Onglets internes du pilier Suivi santé. Les entrées sont fournies par
 * l'appelant plutôt que codées en dur : l'onglet Journal ne doit pas exister
 * du tout pour le co-parent — pas seulement être grisé (règle de visibilité
 * stricte, CONCEPT.md).
 */
export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { value: T; label: string }[];
  activeTab: T;
  onChange: (value: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.value)}
            className={`rounded-full px-3.5 py-2 ${
              isActive ? 'bg-accent' : 'bg-white'
            }`}
          >
            <Text
              className={`text-[13px] ${
                isActive
                  ? 'font-medium text-accent-foreground'
                  : 'text-[#6b6b6b]'
              }`}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { GLASS_BODY_COLOR } from '@/components/ui/glass-card';
import { useThemeAccent } from '@/features/settings/hooks';
import { hexToRgba } from '@/lib/color';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Onglets internes du pilier Suivi santé. Les entrées sont fournies par
 * l'appelant plutôt que codées en dur : l'onglet Journal ne doit pas exister
 * du tout pour le co-parent — pas seulement être grisé (règle de visibilité
 * stricte, CONCEPT.md).
 *
 * Icône facultative devant chaque libellé (capture de référence de l'onglet
 * Exercices) ; l'onglet actif passe en gélule d'accent, texte et icône
 * blancs. Avec les icônes, la rangée dépasse la largeur d'un téléphone :
 * elle défile d'elle-même pour garder l'onglet actif entièrement visible.
 */
export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: { value: T; label: string; icon?: IoniconName }[];
  activeTab: T;
  onChange: (value: T) => void;
}) {
  const accent = useThemeAccent();
  const scrollRef = useRef<ScrollView>(null);
  const viewportWidthRef = useRef(0);
  const layoutsRef = useRef(new Map<T, { x: number; width: number }>());

  const revealTab = (value: T) => {
    const layout = layoutsRef.current.get(value);
    if (!layout || !viewportWidthRef.current) return;
    scrollRef.current?.scrollTo({
      x: Math.max(
        layout.x + layout.width / 2 - viewportWidthRef.current / 2,
        0,
      ),
      animated: true,
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: `revealTab` ne lit que des refs ; le recréer à chaque rendu ne doit pas relancer l'effet.
  useEffect(() => {
    revealTab(activeTab);
  }, [activeTab]);

  return (
    <ScrollView
      ref={scrollRef}
      onLayout={(event) => {
        viewportWidthRef.current = event.nativeEvent.layout.width;
        revealTab(activeTab);
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 py-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        const color = isActive ? '#ffffff' : GLASS_BODY_COLOR;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.value)}
            onLayout={(event) => {
              layoutsRef.current.set(tab.value, {
                x: event.nativeEvent.layout.x,
                width: event.nativeEvent.layout.width,
              });
              if (isActive) revealTab(tab.value);
            }}
            className="flex-row items-center gap-1.5 rounded-full px-3.5 py-2"
            style={
              isActive
                ? {
                    backgroundColor: accent,
                    shadowColor: accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.22,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                : {
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    borderWidth: 1,
                    borderColor: hexToRgba(accent, 0.08),
                  }
            }
          >
            {tab.icon ? (
              <Ionicons name={tab.icon} size={15} color={color} />
            ) : null}
            <Text
              className="text-[13px]"
              style={{ color, fontWeight: isActive ? '700' : '500' }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { Uniwind, useUniwind, withUniwind } from 'uniwind';

import { OutlineButton } from '@/components/outline-button';
import { useUpdateMyTheme } from '@/features/profile/hooks';
import {
  resolveThemeId,
  THEME_OPTIONS,
  type ThemeId,
} from '@/features/settings/constants';
import { sessionAtom } from '@/lib/atoms/session';
import { supabase } from '@/lib/supabase/client';

const SafeAreaView = withUniwind(RNSafeAreaView);

/**
 * Écran 10a — Réglages. Périmètre strict du plan d'action §1.7 : personnels
 * et non partagés (déjà garanti par la RLS `profiles_update_own`, juste
 * rappelé ici), 3-4 thèmes visuels prédéfinis, pas de sélecteur de langue.
 *
 * ⚠️ Le reste de la maquette 10a (compte, notifications, aide & support,
 * export de données, CGU) n'est pas dans le périmètre de cette phase — le
 * plan d'action §1.7 s'y limite explicitement, contrairement au résumé plus
 * large de DOCS/versions/MVP.md.
 *
 * ⚠️ Distinct du « Thème sombre » + « Couleur d'accent » de la maquette :
 * ce mécanisme-là est explicitement hors MVP. Ici, un choix fermé de 4
 * palettes nommées (voir `features/settings/constants.ts`), pas un
 * sélecteur clair/sombre ni une roue de couleur libre.
 */
export default function SettingsScreen() {
  const session = useAtomValue(sessionAtom);
  const { theme: activeTheme } = useUniwind();
  const updateTheme = useUpdateMyTheme();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const selectedThemeId = resolveThemeId(activeTheme);

  // Le changement est instantané côté client (Uniwind re-thème toute l'app,
  // pas seulement cet écran) ; l'écriture Supabase ne sert qu'à faire
  // survivre le choix à une reconnexion, sans bloquer l'affichage dessus —
  // et n'a d'ailleurs aucun effet sans session réelle (mode contournement
  // DEV compris, où le thème reste malgré tout modifiable).
  const selectTheme = (id: ThemeId) => {
    Uniwind.setTheme(id);
    if (session?.user.id) {
      updateTheme.mutate(id);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 gap-6 px-6 pt-4">
        <View className="gap-1">
          <Text className="text-[26px] font-bold text-[#1a1a1a]">Réglages</Text>
          <Text className="text-[13px] text-[#9a9a9a]">
            Personnels — non partagés avec votre co-parent.
          </Text>
        </View>

        <View className="gap-3">
          <Text className="text-[11.5px] font-semibold tracking-wide text-[#8a8a8a]">
            APPARENCE
          </Text>
          <View className="flex-row gap-4">
            {THEME_OPTIONS.map((option) => {
              const isSelected = option.id === selectedThemeId;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Thème ${option.label}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => selectTheme(option.id)}
                  className="items-center gap-1.5"
                >
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-[#1a1a1a]' : 'border-transparent'
                    }`}
                  >
                    <View
                      className="h-9 w-9 rounded-full"
                      style={{ backgroundColor: option.accent }}
                    />
                  </View>
                  <Text
                    className={`text-[12px] ${
                      isSelected
                        ? 'font-medium text-[#1a1a1a]'
                        : 'text-[#6b6b6b]'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text className="text-[13px] leading-5 text-[#9a9a9a]">
          L’application reste en français pour l’instant — pas de sélecteur de
          langue.
        </Text>

        <OutlineButton
          label={isSigningOut ? 'Déconnexion…' : 'Se déconnecter'}
          isDisabled={isSigningOut}
          onPress={handleSignOut}
        />
      </View>
    </SafeAreaView>
  );
}

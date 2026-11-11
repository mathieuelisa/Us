import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';

import { GLASS_TITLE_COLOR } from '@/components/ui/glass-card';
import { hexToRgba } from '@/lib/color';
import { NO_WEB_FOCUS_OUTLINE } from '@/lib/web-styles';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Icône dans un rond teinté (accent par défaut), en tête de champ ou de ligne. */
export function IconBubble({
  icon,
  color,
  size = 34,
}: {
  icon: IoniconName;
  color: string;
  size?: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: hexToRgba(color, 0.1),
      }}
    >
      <Ionicons name={icon} size={size / 2} color={color} />
    </View>
  );
}

/**
 * Champ en gélule claire, icône d'accent en tête — né dans la modale
 * « Nouveau rendez-vous », repris par le formulaire de contacts.
 *
 * `TextInput` brut plutôt que `Input` de Hero UI Native : la bibliothèque
 * rend un fond sombre hérité du thème, ou aucun fond pour nos 4 thèmes
 * custom (cf. DOCS/05-DETTE-ET-POINTS-OUVERTS.md, `PlainInput`). Contour
 * d'accent au focus, rouge si la valeur est invalide. Le placeholder sert
 * aussi d'`accessibilityLabel`.
 *
 * `trailing` : élément posé en fin de gélule (ex. l'œil qui affiche le mot
 * de passe sur l'écran de connexion).
 */
export function IconInput({
  icon,
  placeholder,
  value,
  onChangeText,
  accent,
  isInvalid = false,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  secureTextEntry,
  editable = true,
  returnKeyType,
  onSubmitEditing,
  trailing,
}: {
  icon: IoniconName;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  accent: string;
  isInvalid?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  secureTextEntry?: boolean;
  editable?: boolean;
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: () => void;
  trailing?: ReactNode;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className="h-[46px] flex-row items-center gap-2 rounded-full pl-1.5 pr-3"
      style={{
        backgroundColor: '#f7f6fa',
        borderWidth: 1.5,
        borderColor: isInvalid
          ? '#dc2626'
          : isFocused
            ? accent
            : 'rgba(0, 0, 0, 0.04)',
      }}
    >
      <IconBubble icon={icon} color={accent} />
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor="#a3a1b0"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        autoCorrect={secureTextEntry ? false : undefined}
        className="flex-1 text-[14.5px]"
        // Pas de contour de focus du navigateur (web) : la gélule prend
        // déjà un contour d'accent quand le champ est actif.
        style={[
          { color: GLASS_TITLE_COLOR, paddingVertical: 0 },
          NO_WEB_FOCUS_OUTLINE,
        ]}
      />
      {trailing}
    </View>
  );
}

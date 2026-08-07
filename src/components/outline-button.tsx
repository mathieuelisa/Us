import { Pressable, Text } from 'react-native';

/**
 * Hero UI Native's Button `variant="outline"` (and secondary/tertiary/ghost)
 * fails to resolve its hover color token on Expo Web (colorKit can't parse
 * the unresolved CSS var), rendering near-invisible text. This is a
 * lightweight stand-in for secondary actions until that's fixed upstream or
 * the theme config is filled in (see DOCS/02-ACTION-PLAN.md Phase 1.7).
 */
export function OutlineButton({
  label,
  onPress,
  isDisabled = false,
  className,
}: {
  label: string;
  onPress: () => void;
  isDisabled?: boolean;
  className?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      className={`items-center justify-center rounded-full border border-[#d0d0d0] px-4 py-3 ${isDisabled ? 'opacity-40' : ''} ${className ?? ''}`}
    >
      <Text className="text-[15px] font-medium text-[#1a1a1a]">{label}</Text>
    </Pressable>
  );
}

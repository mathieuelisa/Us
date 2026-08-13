import { View } from 'react-native';

/** Barre de progression continue — `progress` entre 0 et 1. */
export function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
      <View
        className="h-2 rounded-full bg-accent"
        style={{ width: `${clamped * 100}%` }}
      />
    </View>
  );
}

import { Text, View } from 'react-native';

import { getStatusLabel } from '@/features/procedures/constants';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  a_faire: { bg: '#f0f0f0', text: '#6b6b6b' },
  en_cours: { bg: '#fdf3d9', text: '#a3730a' },
  fait: { bg: '#eaf5f0', text: '#2D5E5A' },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.a_faire;
  return (
    <View
      className="rounded-full px-2.5 py-1"
      style={{ backgroundColor: style.bg }}
    >
      <Text className="text-[11px] font-medium" style={{ color: style.text }}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

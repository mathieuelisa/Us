import { Text, View } from 'react-native';

import { getStatusLabel } from '@/features/procedures/constants';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  a_faire: { bg: '#f0f0f0', text: '#6b6b6b' },
  en_cours: { bg: '#fdf3d9', text: '#a3730a' },
};

export function StatusBadge({ status }: { status: string }) {
  // "fait" suit la couleur d'accent active (`bg-accent/10`, teinte
  // dynamique) plutôt qu'un vert codé en dur — les deux autres statuts
  // n'ont pas de lien avec l'accent, ils gardent leurs couleurs fixes.
  if (status === 'fait') {
    return (
      <View className="rounded-full bg-accent/10 px-2.5 py-1">
        <Text className="text-[11px] font-medium text-accent">
          {getStatusLabel(status)}
        </Text>
      </View>
    );
  }

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

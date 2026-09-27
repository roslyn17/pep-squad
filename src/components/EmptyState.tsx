import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '@/theme';

type Props = {
  message: string;
};

// Placeholder card for screens whose real content arrives in a later build step.
export function EmptyState({ message }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.card,
    padding: 24,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/theme';

type Props = {
  title: string;
  subtitle: string;
};

// The big title + subtitle at the top of each tab (e.g. "Pep Squad" / "Who's hyping you up today?").
export function ScreenHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 36,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

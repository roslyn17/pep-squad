import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterCard } from '@/components/CharacterCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Character } from '@/data/characters';
import { useSquad } from '@/lib/squad';
import { colors, fonts, minTouchSize, spacing } from '@/theme';

export default function SquadScreen() {
  const { squad, rerollSquad } = useSquad();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Pep Squad" subtitle="Who's hyping you up today?" />
        <Text style={styles.sectionTitle} accessibilityRole="header">
          The squad
        </Text>
        {squad ? <SquadGrid squad={squad} /> : <ActivityIndicator color={colors.accent} />}

        {/* Development-only: lets us test the random starting squad. Never shown in the real app. */}
        {__DEV__ && (
          <Pressable onPress={rerollSquad} style={styles.devButton} accessibilityRole="button">
            <Text style={styles.devButtonText}>Dev only: re-roll my squad</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SquadGrid({ squad }: { squad: Character[] }) {
  // Pair characters into rows of two. An odd one out gets an empty spacer so it stays half-width.
  const rows: Character[][] = [];
  for (let i = 0; i < squad.length; i += 2) rows.push(squad.slice(i, i + 2));

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0].id} style={styles.row}>
          {row.map((character) => (
            <View key={character.id} style={styles.cell}>
              <CharacterCard character={character} />
            </View>
          ))}
          {row.length === 1 && <View style={styles.cell} />}
        </View>
      ))}
    </View>
  );
}

const GAP = 12;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 24,
    color: colors.text,
    marginBottom: 14,
  },
  grid: {
    gap: GAP,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  cell: {
    // Every cell starts at half the row and shrinks equally to make room for the gap,
    // so a lone card in the last row stays the same width as the others.
    width: '50%',
    flexShrink: 1,
  },
  devButton: {
    marginTop: 32,
    minHeight: minTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textSecondary,
    borderRadius: 12,
  },
  devButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
});

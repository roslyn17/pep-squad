import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { CharacterCard } from '@/components/CharacterCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Character } from '@/data/characters';
import { useMemberOfTheDay, useSquad } from '@/lib/squad';
import { devAddPepTalks, useUnlockReady } from '@/lib/unlocks';
import { colors, fonts, minTouchSize, radius, spacing } from '@/theme';

export default function SquadScreen() {
  const { squad, rerollSquad } = useSquad();
  const unlockReady = useUnlockReady();
  const featured = useMemberOfTheDay(squad);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Pep Squad" subtitle="Who's hyping you up today?" />

        {unlockReady && (
          <Pressable
            onPress={() => router.push('/unlock')}
            style={({ pressed }) => [styles.unlockBanner, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
          >
            <Ionicons name="gift" size={28} color={colors.onAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.unlockTitle}>New squad member unlocked!</Text>
              <Text style={styles.unlockText}>Tap to choose who joins.</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.onAccent} />
          </Pressable>
        )}

        {featured && (
          <Pressable
            onPress={() => router.push({ pathname: '/pep-talk/[id]', params: { id: featured.id } })}
            style={({ pressed }) => [styles.featured, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel={`Squad member of the day: ${featured.name}. ${featured.greeting}`}
          >
            <CharacterAvatar character={featured} size={60} backgroundColor={featured.cardColor} />
            <View style={{ flex: 1 }}>
              <Text style={styles.featuredLabel}>Squad member of the day</Text>
              <Text style={styles.featuredName}>{featured.name}</Text>
              <Text style={styles.featuredGreeting}>“{featured.greeting}”</Text>
            </View>
          </Pressable>
        )}
        <Text style={styles.sectionTitle} accessibilityRole="header">
          The squad
        </Text>
        {squad ? <SquadGrid squad={squad} /> : <ActivityIndicator color={colors.accent} />}

        {/* Development-only: lets us test the random starting squad. Never shown in the real app. */}
        {__DEV__ && (
          <>
            <Pressable onPress={rerollSquad} style={styles.devButton} accessibilityRole="button">
              <Text style={styles.devButtonText}>Dev only: re-roll my squad</Text>
            </Pressable>
            <Pressable onPress={devAddPepTalks} style={styles.devButton} accessibilityRole="button">
              <Text style={styles.devButtonText}>Dev only: add 20 pep talks (test unlocking)</Text>
            </Pressable>
          </>
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
              <CharacterCard
                character={character}
                onPress={() => router.push({ pathname: '/pep-talk/[id]', params: { id: character.id } })}
              />
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
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.accent,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
  },
  unlockTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.onAccent,
  },
  unlockText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onAccent,
    opacity: 0.9,
  },
  featured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.dark,
    borderRadius: radius.card + 4,
    padding: 18,
    marginBottom: 28,
  },
  featuredLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  featuredName: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.textOnDark,
    marginTop: 2,
  },
  featuredGreeting: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textOnDark,
    marginTop: 4,
  },
  devButton: {
    marginTop: 16,
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

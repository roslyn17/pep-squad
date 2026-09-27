import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { EmptyState } from '@/components/EmptyState';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Character, getCharacter } from '@/data/characters';
import { removeSavedPepTalk, useSavedPepTalks } from '@/lib/saved';
import { useSpeech } from '@/lib/speak';
import { SavedPepTalk } from '@/lib/storage';
import { colors, fonts, minTouchSize, radius, spacing } from '@/theme';

const ALL = 'all';

export default function SavedScreen() {
  const saved = useSavedPepTalks();
  const speech = useSpeech();
  const [filter, setFilter] = useState<string>(ALL);

  // Tabs stay loaded in the background, so stop any playback when leaving this tab.
  const { stop } = speech;
  useFocusEffect(useCallback(() => () => stop(), [stop]));

  // One chip per character that has saved pep talks, in order of their most recent save.
  const filterCharacters = useMemo(() => {
    const seen = new Map<string, Character>();
    for (const item of saved ?? []) {
      const character = getCharacter(item.characterId);
      if (character && !seen.has(character.id)) seen.set(character.id, character);
    }
    return [...seen.values()];
  }, [saved]);

  // If the filtered character's last saved pep talk is removed, fall back to "All".
  const activeFilter = filter === ALL || filterCharacters.some((c) => c.id === filter) ? filter : ALL;
  const visible = (saved ?? []).filter((item) => activeFilter === ALL || item.characterId === activeFilter);

  function confirmRemove(item: SavedPepTalk, character: Character) {
    Alert.alert('Remove this pep talk?', `${character.name}: "${item.task}"`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (speech.playingId === item.id) speech.stop();
          removeSavedPepTalk(item.id);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Saved" subtitle="Your favorite pep talks, on repeat." />

        {saved === null ? (
          <ActivityIndicator color={colors.accent} />
        ) : saved.length === 0 ? (
          <EmptyState message="No saved pep talks yet. Tap Save on a pep talk you love and it'll show up here." />
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={styles.chipsScroller}
            >
              <Chip label="All" selected={activeFilter === ALL} onPress={() => setFilter(ALL)} />
              {filterCharacters.map((character) => (
                <Chip
                  key={character.id}
                  label={character.name}
                  selected={activeFilter === character.id}
                  onPress={() => setFilter(character.id)}
                />
              ))}
            </ScrollView>

            <View style={styles.list}>
              {visible.map((item) => {
                const character = getCharacter(item.characterId);
                if (!character) return null;
                const playing = speech.playingId === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onLongPress={() => confirmRemove(item, character)}
                    style={styles.card}
                    accessibilityHint="Press and hold to remove"
                  >
                    <View style={styles.cardHeader}>
                      <CharacterAvatar character={character} size={48} backgroundColor={character.cardColor} />
                      <View style={styles.cardTitle}>
                        <Text style={styles.name}>{character.name}</Text>
                        <Text style={styles.task} numberOfLines={1}>
                          {item.task}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => speech.toggle(item.id, item.text, character)}
                        style={({ pressed }) => [styles.play, pressed && { opacity: 0.85 }]}
                        accessibilityRole="button"
                        accessibilityLabel={playing ? 'Stop' : `Play ${character.name}'s pep talk`}
                      >
                        <Ionicons name={playing ? 'stop' : 'play'} size={22} color={colors.onAccent} />
                      </Pressable>
                    </View>
                    <Text style={styles.text}>“{item.text}”</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>Press and hold a pep talk to remove it.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

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
  chipsScroller: {
    marginHorizontal: -spacing.screen,
    marginBottom: 16,
  },
  chips: {
    paddingHorizontal: spacing.screen,
    gap: 8,
  },
  chip: {
    minHeight: minTouchSize,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.dark,
    borderColor: colors.dark,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.textOnDark,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.card + 4,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  cardTitle: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  task: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 1,
  },
  play: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

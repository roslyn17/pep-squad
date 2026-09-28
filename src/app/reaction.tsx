import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { PlayButton } from '@/components/PlayButton';
import { characters, getCharacter } from '@/data/characters';
import { Outcome, PepTalkResult, requestPepTalk } from '@/lib/pepTalk';
import { estimateDurationSeconds, speak, useSpeech } from '@/lib/speak';
import { useSquad } from '@/lib/squad';
import { PEP_TALKS_PER_UNLOCK, useCountedPepTalks, useUnlockReady } from '@/lib/unlocks';
import { currentStreak, recordWin, useWins } from '@/lib/wins';
import { colors, fonts, minTouchSize, radius, spacing } from '@/theme';

const REACTION_ID = 'outcome-reaction';

// Reactions already fetched this session, per pep talk and outcome. Going back and forth on
// the same pep talk shows the same reaction with no new AI request. Only successful replies
// are kept, so a failed one can be retried.
const reactionCache = new Map<string, PepTalkResult>();

// Closes this screen and the pep talk underneath it, landing on the Squad tab.
function backToSquad() {
  router.dismissTo('/');
}

// Closes just this screen, back to the pep talk (still there, with its text and buttons).
function backToPepTalk() {
  if (router.canGoBack()) router.back();
  else backToSquad();
}

// Shown after "I did it!" (a celebration) or "I didn't do it" (a kind, no-guilt reaction).
export default function ReactionScreen() {
  const params = useLocalSearchParams<{
    characterId: string;
    task: string;
    outcome: Outcome;
    pepTalkId: string;
  }>();
  const pepTalkId = params.pepTalkId ?? '';
  const outcome: Outcome = params.outcome === 'not-done' ? 'not-done' : 'done';
  const character = getCharacter(params.characterId ?? '');
  const task = params.task ?? '';
  const insets = useSafeAreaInsets();
  const speech = useSpeech();

  const [result, setResult] = useState<PepTalkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);
  const wins = useWins();
  const pepTalkCount = useCountedPepTalks();
  const unlockReady = useUnlockReady();
  const { squad } = useSquad();
  const squadFull = !!squad && squad.length >= characters.length;
  const cacheKey = `${pepTalkId}:${outcome}`;

  const fetchReaction = useCallback(async () => {
    if (!character || !task) return;
    setLoading(true);
    const cached = pepTalkId ? reactionCache.get(cacheKey) : undefined;
    const next =
      cached ?? (await requestPepTalk(character, task, outcome === 'done' ? 'reaction' : 'not-done'));
    if (next.status === 'ok' && pepTalkId) reactionCache.set(cacheKey, next);
    if (!mounted.current) return;
    setResult(next);
    setLoading(false);
    // The reaction plays on its own (silent when the phone is on silent).
    if (next.status === 'ok') speak(REACTION_ID, next.text, character);
  }, [character, task, outcome, pepTalkId, cacheKey]);

  useEffect(() => {
    mounted.current = true;
    // "I did it!" counts as a win, once per pep talk (recordWin ignores repeats).
    if (outcome === 'done' && character && pepTalkId) {
      recordWin({ pepTalkId, characterId: character.id, task });
    }
    fetchReaction();
    return () => {
      mounted.current = false;
    };
    // Fetch once when the screen opens.
  }, []);

  if (!character) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingHorizontal: spacing.screen }]}>
        <Text style={styles.reaction}>We couldn't find that squad member.</Text>
        <OutlineButton label="Back to the squad" onPress={backToSquad} />
      </View>
    );
  }

  const playing = speech.playingId === REACTION_ID;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: 24 }]}
      >
        <Pressable
          onPress={backToPepTalk}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Back to the pep talk"
        >
          <Ionicons name="close" size={26} color={colors.textOnDark} />
        </Pressable>

        <Text style={styles.eyebrow}>{outcome === 'done' ? 'Mission complete' : 'Not this time'}</Text>
        <Text style={styles.task} accessibilityRole="header">
          {task}
        </Text>

        <View style={styles.avatar}>
          <CharacterAvatar character={character} size={88} backgroundColor={character.cardColor} />
        </View>

        <View style={styles.card} accessibilityLiveRegion="polite">
          <View style={styles.cardHeader}>
            <Text style={styles.speaker} numberOfLines={2}>
              {character.name}
            </Text>
            {result?.status === 'ok' && !loading && (
              <PlayButton
                variant="dark"
                durationSeconds={estimateDurationSeconds(result.text, character.voice.rate)}
                playing={playing}
                onPress={() => speech.toggle(REACTION_ID, result.text, character)}
              />
            )}
          </View>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.loadingText}>{character.name} is reacting…</Text>
            </View>
          ) : (
            <Text style={[styles.reaction, result?.status !== 'ok' && styles.notice]}>{result?.text}</Text>
          )}
          {result?.status === 'failed' && !loading && (
            <Pressable onPress={fetchReaction} style={styles.retry} accessibilityRole="button">
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          )}
        </View>

        {outcome === 'done' && wins && pepTalkCount !== null && (
          <ProgressTiles
            pepTalkCount={pepTalkCount}
            streak={currentStreak(wins)}
            unlockReady={unlockReady}
            squadFull={squadFull}
          />
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {outcome === 'done' ? (
          <>
            <GoldButton label="Back to the squad" onPress={backToSquad} />
            <OutlineButton label="See my pep talk again" onPress={backToPepTalk} />
          </>
        ) : (
          <>
            <GoldButton label="Back to Pep Talk" onPress={backToPepTalk} />
            <OutlineButton label="Back to the squad" onPress={backToSquad} />
          </>
        )}
      </View>
    </View>
  );
}

function ProgressTiles({
  pepTalkCount,
  streak,
  unlockReady,
  squadFull,
}: {
  pepTalkCount: number;
  streak: number;
  unlockReady: boolean;
  squadFull: boolean;
}) {
  // An earned-but-unused unlock shows "Unlocked!"; otherwise count down to the next one.
  const away = PEP_TALKS_PER_UNLOCK - (pepTalkCount % PEP_TALKS_PER_UNLOCK);
  return (
    <View style={styles.tiles}>
      <View style={styles.tile}>
        <Text style={styles.tileValue}>
          {streak} {streak === 1 ? 'day' : 'days'}
        </Text>
        <Text style={styles.tileLabel}>Current streak</Text>
      </View>
      {squadFull ? (
        <View style={styles.tile}>
          <Text style={styles.tileValue}>Full squad!</Text>
          <Text style={styles.tileLabel}>You've unlocked every squad member</Text>
        </View>
      ) : unlockReady ? (
        <Pressable
          onPress={() => router.push('/unlock')}
          style={({ pressed }) => [styles.tile, styles.tileAction, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
        >
          <Text style={[styles.tileValue, { color: colors.dark }]}>Unlocked!</Text>
          <Text style={[styles.tileLabel, { color: colors.dark }]}>Tap to choose a new squad member</Text>
        </Pressable>
      ) : (
        <View style={styles.tile}>
          <Text style={styles.tileValue}>{away} more</Text>
          <Text style={styles.tileLabel}>
            {away === 1 ? 'pep talk' : 'pep talks'} to unlock a new squad member
          </Text>
        </View>
      )}
    </View>
  );
}

function GoldButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.outline, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
    >
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    paddingHorizontal: spacing.screen,
    alignItems: 'stretch',
  },
  close: {
    alignSelf: 'flex-end',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.darkRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.gold,
    textAlign: 'center',
    marginTop: 12,
  },
  task: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 36,
    color: colors.textOnDark,
    textAlign: 'center',
    marginTop: 8,
  },
  avatar: {
    alignItems: 'center',
    marginVertical: 18,
  },
  card: {
    backgroundColor: colors.darkRaised,
    borderRadius: radius.card + 6,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: minTouchSize,
    marginBottom: 12,
  },
  speaker: {
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.gold,
  },
  reaction: {
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    lineHeight: 26,
    color: colors.textOnDark,
  },
  notice: {
    fontFamily: fonts.body,
    color: colors.textOnDarkSecondary,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textOnDarkSecondary,
  },
  tiles: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.darkRaised,
    borderRadius: radius.card,
    padding: 16,
  },
  tileAction: {
    backgroundColor: colors.gold,
  },
  tileValue: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.gold,
  },
  tileLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 19,
    color: colors.textOnDarkSecondary,
    marginTop: 2,
  },
  retry: {
    alignSelf: 'flex-start',
    minHeight: minTouchSize,
    justifyContent: 'center',
    marginTop: 8,
  },
  retryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.gold,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    gap: 12,
    backgroundColor: colors.dark,
  },
  primary: {
    minHeight: 60,
    borderRadius: radius.card,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.dark,
  },
  outline: {
    minHeight: 60,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 246, 238, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.textOnDark,
  },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { PlayButton } from '@/components/PlayButton';
import { getCharacter } from '@/data/characters';
import { Outcome, PepTalkResult, requestPepTalk } from '@/lib/pepTalk';
import { estimateDurationSeconds, speak, useSpeech } from '@/lib/speak';
import { colors, fonts, minTouchSize, radius, spacing } from '@/theme';

const REACTION_ID = 'outcome-reaction';

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
  const params = useLocalSearchParams<{ characterId: string; task: string; outcome: Outcome }>();
  const outcome: Outcome = params.outcome === 'not-done' ? 'not-done' : 'done';
  const character = getCharacter(params.characterId ?? '');
  const task = params.task ?? '';
  const insets = useSafeAreaInsets();
  const speech = useSpeech();

  const [result, setResult] = useState<PepTalkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchReaction = useCallback(async () => {
    if (!character || !task) return;
    setLoading(true);
    const next = await requestPepTalk(character, task, outcome === 'done' ? 'reaction' : 'not-done');
    if (!mounted.current) return;
    setResult(next);
    setLoading(false);
    // The reaction plays on its own (silent when the phone is on silent).
    if (next.status === 'ok') speak(REACTION_ID, next.text, character);
  }, [character, task, outcome]);

  useEffect(() => {
    mounted.current = true;
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
          <CharacterAvatar character={character} size={128} backgroundColor={character.cardColor} />
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
    fontSize: 34,
    lineHeight: 40,
    color: colors.textOnDark,
    textAlign: 'center',
    marginTop: 8,
  },
  avatar: {
    alignItems: 'center',
    marginVertical: 28,
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

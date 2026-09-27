import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import { SpeechBubble } from '@/components/SpeechBubble';
import { SwapSheet } from '@/components/SwapSheet';
import { Character, getCharacter } from '@/data/characters';
import { PepTalkResult, requestPepTalk } from '@/lib/pepTalk';
import { useSpeech } from '@/lib/speak';
import { useSquad } from '@/lib/squad';
import { colors, fonts, radius, spacing } from '@/theme';

const MAX_TASK_LENGTH = 120;

// Goes back if there's a screen to return to; otherwise lands on the Squad tab.
function backToSquad() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function PepTalkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [characterId, setCharacterId] = useState(id);
  const character = getCharacter(characterId);
  const insets = useSafeAreaInsets();

  if (!character) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.notFoundText}>We couldn't find that squad member.</Text>
        <SecondaryButton label="Back to the squad" onPress={() => backToSquad()} />
      </View>
    );
  }

  return <PepTalk character={character} onSwap={(c) => setCharacterId(c.id)} />;
}

function PepTalk({ character, onSwap }: { character: Character; onSwap: (c: Character) => void }) {
  const insets = useSafeAreaInsets();
  const { squad } = useSquad();
  const [task, setTask] = useState('');
  // The latest pep talk, or the character's "couldn't do it" line if the request failed.
  const [result, setResult] = useState<PepTalkResult | null>(null);
  // Changes with every new result, so the play button knows which line it's playing.
  const [resultId, setResultId] = useState('');
  const speech = useSpeech();
  const [loading, setLoading] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  // Ignores a slow response if a newer request (Again or Swap) was started after it.
  const latestRequest = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const [scrolled, setScrolled] = useState(false);

  const trimmedTask = task.trim();
  const hasPepTalk = result?.status === 'ok';
  const showBubble = loading || result !== null;

  async function generate(forCharacter: Character) {
    if (!trimmedTask) return;
    const requestId = ++latestRequest.current;
    Keyboard.dismiss();
    speech.stop();
    setLoading(true);
    try {
      const next = await requestPepTalk(forCharacter, trimmedTask);
      if (requestId === latestRequest.current) {
        setResult(next);
        setResultId(`pep-talk-${requestId}`);
      }
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }

  function handleSwap(next: Character) {
    setSwapOpen(false);
    onSwap(next);
    generate(next);
  }

  const swapOptions = (squad ?? []).filter((c) => c.id !== character.id);

  return (
    // Lifts the big button above the on-screen keyboard so it can be tapped right after typing.
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        ref={scrollRef}
        // Bring the pep talk and its buttons into view when it appears.
        onContentSizeChange={() => showBubble && scrollRef.current?.scrollToEnd({ animated: true })}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { backgroundColor: character.cardColor, paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => backToSquad()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back to the squad"
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.headerRow}>
            <CharacterAvatar character={character} size={76} />
            <View style={styles.headerText}>
              <Text style={styles.name} accessibilityRole="header">
                {character.name}
              </Text>
              <Text style={styles.tagline}>{character.tagline}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.label} nativeID="taskLabel">
            What do you need a push for?
          </Text>
          <TextInput
            value={task}
            onChangeText={setTask}
            placeholder="e.g. Finishing my essay"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            maxLength={MAX_TASK_LENGTH}
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            // The keyboard's "done" key asks for the first pep talk.
            onSubmitEditing={() => !result && !loading && generate(character)}
            accessibilityLabelledBy="taskLabel"
          />


          {showBubble && (
            <View style={styles.bubble}>
              <SpeechBubble
                character={character}
                text={result?.text ?? null}
                loading={loading}
                variant={result?.status === 'ok' ? 'pep-talk' : 'notice'}
                playing={speech.playingId === resultId}
                onPlay={() => result && speech.toggle(resultId, result.text, character)}
              />
            </View>
          )}
          {hasPepTalk && (
            <>
              <View style={styles.actions}>
                <SecondaryButton label="Again" onPress={() => generate(character)} disabled={loading} />
                {/* Save arrives in step 7. */}
                <SecondaryButton label="Save" disabled={loading} />
                <SecondaryButton
                  label="Swap"
                  onPress={() => setSwapOpen(true)}
                  disabled={loading || swapOptions.length === 0}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Once scrolled, a solid strip sits behind the clock and battery so content doesn't show through. */}
      {scrolled && <View style={[styles.statusBarCover, { height: insets.top }]} pointerEvents="none" />}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {hasPepTalk ? (
          <PrimaryButton
            label="I did it!"
            disabled={loading}
            onPress={() => {
              speech.stop();
              router.push({
                pathname: '/victory',
                params: { characterId: character.id, task: trimmedTask },
              });
            }}
          />
        ) : (
          <PrimaryButton
            label={result ? 'Try again' : 'Pep me up!'}
            onPress={() => generate(character)}
            disabled={!trimmedTask}
            loading={loading}
          />
        )}
      </View>

      <SwapSheet
        visible={swapOpen}
        options={swapOptions}
        onPick={handleSwap}
        onClose={() => setSwapOpen(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 34,
    color: colors.text,
    letterSpacing: -0.3,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 4,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingTop: 24,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  input: {
    minHeight: 56,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.card - 2,
    paddingHorizontal: 18,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.text,
    marginBottom: 22,
  },
  bubble: {
    marginTop: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statusBarCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    backgroundColor: colors.background,
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screen,
    gap: 16,
  },
  notFoundText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    color: colors.text,
  },
});

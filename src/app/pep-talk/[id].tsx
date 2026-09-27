import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { CharacterAvatar } from '@/components/CharacterAvatar';
import { IntensitySelector } from '@/components/IntensitySelector';
import { SpeechBubble } from '@/components/SpeechBubble';
import { SwapSheet } from '@/components/SwapSheet';
import { Character, getCharacter } from '@/data/characters';
import { Intensity, requestPepTalk } from '@/lib/pepTalk';
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
  const [intensity, setIntensity] = useState<Intensity>('fired-up');
  const [pepTalk, setPepTalk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  // Ignores a slow response if a newer request (Again or Swap) was started after it.
  const latestRequest = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  const trimmedTask = task.trim();
  const hasPepTalk = pepTalk !== null || loading;

  async function generate(forCharacter: Character) {
    if (!trimmedTask) return;
    const requestId = ++latestRequest.current;
    Keyboard.dismiss();
    setLoading(true);
    try {
      const text = await requestPepTalk(forCharacter, trimmedTask, intensity);
      if (requestId === latestRequest.current) setPepTalk(text);
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
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        // Bring the pep talk and its buttons into view when it appears.
        onContentSizeChange={() => hasPepTalk && scrollRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
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
            </View>
          </View>
          <Text style={styles.tagline}>{character.tagline}</Text>
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
            accessibilityLabelledBy="taskLabel"
          />

          <Text style={styles.label}>Intensity</Text>
          <IntensitySelector value={intensity} onChange={setIntensity} />

          {hasPepTalk && (
            <>
              <View style={styles.bubble}>
                <SpeechBubble character={character} text={pepTalk} loading={loading} />
              </View>
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

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {hasPepTalk ? (
          // The "I did it!" screen arrives in step 6.
          <PrimaryButton label="I did it!" disabled={loading} />
        ) : (
          <PrimaryButton label="Pep me up!" onPress={() => generate(character)} disabled={!trimmedTask} />
        )}
      </View>

      <SwapSheet
        visible={swapOpen}
        options={swapOptions}
        onPick={handleSwap}
        onClose={() => setSwapOpen(false)}
      />
    </View>
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
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
    marginTop: 16,
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

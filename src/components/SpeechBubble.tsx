import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PlayButton } from '@/components/PlayButton';
import { Character } from '@/data/characters';
import { estimateDurationSeconds } from '@/lib/speak';
import { colors, fonts, radius } from '@/theme';

type Props = {
  character: Character;
  text: string | null;
  loading: boolean;
  onPlay?: () => void;
};

export function SpeechBubble({ character, text, loading, onPlay }: Props) {
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={styles.header}>
        <Text style={styles.speaker} numberOfLines={2}>
          {character.name} says
        </Text>
        {text && !loading && (
          <PlayButton
            durationSeconds={estimateDurationSeconds(text, character.voice.rate)}
            onPress={onPlay}
          />
        )}
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>{character.name} is thinking…</Text>
        </View>
      ) : (
        <Text style={styles.body}>{text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.card + 4,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
    marginBottom: 12,
  },
  speaker: {
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  body: {
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    lineHeight: 26,
    color: colors.text,
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
    color: colors.textSecondary,
  },
});

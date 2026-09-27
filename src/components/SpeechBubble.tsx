import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PlayButton } from '@/components/PlayButton';
import { Character } from '@/data/characters';
import { estimateDurationSeconds } from '@/lib/speak';
import { colors, fonts, radius } from '@/theme';

type Props = {
  character: Character;
  text: string | null;
  loading: boolean;
  /** "notice" = the character explaining that something didn't work: no play button, muted text. */
  variant?: 'pep-talk' | 'notice';
  playing?: boolean;
  onPlay?: () => void;
};

export function SpeechBubble({
  character,
  text,
  loading,
  variant = 'pep-talk',
  playing = false,
  onPlay,
}: Props) {
  return (
    <View style={styles.card} accessibilityLiveRegion="polite">
      <View style={styles.header}>
        <Text style={styles.speaker} numberOfLines={2}>
          {character.name} says
        </Text>
        {text && !loading && variant === 'pep-talk' && (
          <PlayButton
            durationSeconds={estimateDurationSeconds(text, character.voice.rate)}
            playing={playing}
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
        <Text style={[styles.body, variant === 'notice' && styles.notice]}>{text}</Text>
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
  notice: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
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

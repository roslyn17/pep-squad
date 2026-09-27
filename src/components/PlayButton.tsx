import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '@/lib/speak';
import { colors, fonts, minTouchSize } from '@/theme';

type Props = {
  durationSeconds: number;
  /** True while this line is being read aloud: the button becomes a stop button. */
  playing?: boolean;
  onPress?: () => void;
  /** "light" = orange pill on light screens; "dark" = gold pill on the dark reaction screen. */
  variant?: 'light' | 'dark';
};

// Decorative waveform bar heights, matching the mockup's little sound-wave graphic.
const BARS = [8, 14, 10, 18, 12, 16, 8];

export function PlayButton({ durationSeconds, playing = false, onPress, variant = 'light' }: Props) {
  const background = variant === 'light' ? colors.accent : colors.gold;
  const foreground = variant === 'light' ? colors.onAccent : colors.dark;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pill, { backgroundColor: background }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Stop' : `Play, about ${durationSeconds} seconds`}
    >
      <Ionicons name={playing ? 'stop' : 'play'} size={18} color={foreground} />
      <View style={styles.wave}>
        {BARS.map((h, i) => (
          <View key={i} style={[styles.bar, { height: h, backgroundColor: foreground }]} />
        ))}
      </View>
      <Text style={[styles.time, { color: foreground }]}>{formatDuration(durationSeconds)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: minTouchSize,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.85,
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    width: 2.5,
    borderRadius: 2,
  },
  time: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
});

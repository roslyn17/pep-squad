import { Pressable, StyleSheet, Text, View } from 'react-native';

import { INTENSITIES, Intensity } from '@/lib/pepTalk';
import { colors, fonts, minTouchSize } from '@/theme';

type Props = {
  value: Intensity;
  onChange: (value: Intensity) => void;
};

export function IntensitySelector({ value, onChange }: Props) {
  return (
    <View style={styles.track} accessibilityRole="radiogroup">
      {INTENSITIES.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.segment, selected && styles.segmentSelected]}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.track,
    borderRadius: 18,
    padding: 4,
  },
  segment: {
    flex: 1,
    minHeight: minTouchSize + 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  segmentSelected: {
    backgroundColor: colors.accent,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.onAccent,
  },
});

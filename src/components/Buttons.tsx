import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, minTouchSize, radius } from '@/theme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

/** Big orange call-to-action, e.g. "I did it!". */
export function PrimaryButton({ label, onPress, disabled, loading }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.primary, inactive && styles.disabled, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.onAccent} />
      ) : (
        <Text style={styles.primaryLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

/** Same size as PrimaryButton but outlined, for a secondary big choice, e.g. "I didn't do it". */
export function OutlineBigButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.outlineBig, disabled && styles.disabled, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.outlineBigLabel} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </Pressable>
  );
}

/** White outlined button, e.g. "Again", "Save", "Swap". */
export function SecondaryButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.secondary, disabled && styles.disabled, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    minHeight: 64,
    borderRadius: radius.card,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBig: {
    minHeight: 64,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  outlineBigLabel: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.accent,
  },
  primaryLabel: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.onAccent,
  },
  secondary: {
    flex: 1,
    minHeight: minTouchSize + 8,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.8,
  },
});

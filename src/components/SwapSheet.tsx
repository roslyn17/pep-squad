import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { Character } from '@/data/characters';
import { colors, fonts, minTouchSize, radius, spacing } from '@/theme';

type Props = {
  visible: boolean;
  /** Characters to choose from (the user's squad minus the current one). */
  options: Character[];
  onPick: (character: Character) => void;
  onClose: () => void;
};

/** Bottom sheet for "Swap": pick a different squad member for the same task and intensity. */
export function SwapSheet({ visible, options, onPick, onClose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title} accessibilityRole="header">
            Swap to…
          </Text>
          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Same task, same intensity, new voice.</Text>
        <ScrollView>
          {options.map((character) => (
            <Pressable
              key={character.id}
              onPress={() => onPick(character)}
              style={({ pressed }) => [
                styles.option,
                { backgroundColor: character.cardColor },
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${character.name}. ${character.tagline}`}
            >
              <CharacterAvatar character={character} size={44} />
              <View style={styles.optionText}>
                <Text style={styles.name}>{character.name}</Text>
                <Text style={styles.tagline}>{character.tagline}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 27, 22, 0.4)',
  },
  sheet: {
    maxHeight: '75%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: spacing.screen,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.text,
  },
  close: {
    width: minTouchSize,
    height: minTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.card,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.8,
  },
  optionText: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

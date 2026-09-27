import { Pressable, StyleSheet, Text } from 'react-native';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { Character } from '@/data/characters';
import { colors, fonts, radius } from '@/theme';

type Props = {
  character: Character;
  onPress?: () => void;
};

export function CharacterCard({ character, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: character.cardColor },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${character.name}. ${character.tagline}`}
    >
      <CharacterAvatar character={character} />
      <Text style={styles.name}>{character.name}</Text>
      <Text style={styles.tagline}>{character.tagline}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.card,
    padding: 16,
    minHeight: 170,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
    marginTop: 14,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Character } from '@/data/characters';
import { colors } from '@/theme';

type Props = {
  character: Character;
  size?: number;
};

// Placeholder avatar: the character's icon in a soft circle. Swap this for drawn faces later;
// every screen uses this component, so that's the only place that will need to change.
// (Icons rather than emoji because emoji don't render in the iOS Simulator we test in.)
export function CharacterAvatar({ character, size = 56 }: Props) {
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <MaterialCommunityIcons name={character.icon} size={Math.round(size * 0.55)} color={colors.text} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';
import Svg from 'react-native-svg';

import { FACES } from '@/components/faces';
import { Character } from '@/data/characters';
import { colors } from '@/theme';

type Props = {
  character: Character;
  size?: number;
  /** Circle color. Defaults to a soft white that works on the pastel cards. */
  backgroundColor?: string;
};

// Every screen draws characters through this component. Characters with a drawn face
// (src/components/faces.tsx) use it; the rest show their placeholder icon.
export function CharacterAvatar({ character, size = 56, backgroundColor }: Props) {
  const Face = FACES[character.id];
  if (Face) {
    // On light cards, drawn faces are their own circle (like the mockup). When a background
    // color is given (dark screens like the featured card), a soft circle sits behind the face
    // so dark hair and hats don't disappear into the background.
    const faceSize = backgroundColor ? size * 0.86 : size;
    return (
      <View
        style={[
          { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
          backgroundColor ? { backgroundColor, borderRadius: size / 2 } : null,
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg width={faceSize} height={faceSize} viewBox="8 6 84 84">
          <Face />
        </Svg>
      </View>
    );
  }
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        backgroundColor ? { backgroundColor } : null,
      ]}
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

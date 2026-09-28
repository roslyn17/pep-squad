import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CharacterAvatar } from '@/components/CharacterAvatar';
import { Character, getCharacter } from '@/data/characters';
import { successFeedback } from '@/lib/haptics';
import { claimUnlock, getUnlockOffer } from '@/lib/unlocks';
import { colors, fonts, minTouchSize, radius, spacing } from '@/theme';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Choose 1 of 3 new squad members. The two not picked go back into the pool.
export default function UnlockScreen() {
  const insets = useSafeAreaInsets();
  const [offer, setOffer] = useState<Character[] | null>(null);
  const [joined, setJoined] = useState<Character | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUnlockOffer().then((ids) =>
      setOffer(ids.map(getCharacter).filter((c): c is Character => c !== undefined)),
    );
  }, []);

  async function pick(character: Character) {
    if (saving) return;
    setSaving(true);
    await claimUnlock(character.id);
    successFeedback();
    setJoined(character);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="light" />
      <Pressable onPress={close} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
        <Ionicons name="close" size={26} color={colors.textOnDark} />
      </Pressable>

      {joined ? (
        <View style={styles.joined}>
          <CharacterAvatar character={joined} size={120} backgroundColor={joined.cardColor} />
          <Text style={styles.eyebrow}>New squad member</Text>
          <Text style={styles.title} accessibilityRole="header">
            {joined.name} joined your squad!
          </Text>
          <Text style={styles.subtitle}>{joined.tagline}</Text>
          <View style={[styles.buttons, { paddingBottom: insets.bottom + 12 }]}>
            <Pressable
              onPress={() => router.replace({ pathname: '/pep-talk/[id]', params: { id: joined.id } })}
              style={({ pressed }) => [styles.gold, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
            >
              <Text style={styles.goldText}>Get a pep talk from {joined.name}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.dismissTo('/')}
              style={({ pressed }) => [styles.outline, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
            >
              <Text style={styles.outlineText}>Back to the squad</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <Text style={styles.eyebrow}>Unlocked</Text>
          <Text style={styles.title} accessibilityRole="header">
            Pick a new squad member
          </Text>
          <Text style={styles.subtitle}>Choose one to join your squad. The others will be back another time.</Text>

          {offer === null ? (
            <ActivityIndicator color={colors.gold} style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.options}>
              {offer.map((character) => (
                <Pressable
                  key={character.id}
                  onPress={() => pick(character)}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.option,
                    { backgroundColor: character.cardColor },
                    pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${character.name}. ${character.tagline}`}
                >
                  <CharacterAvatar character={character} size={64} />
                  <View style={styles.optionText}>
                    <Text style={styles.optionName}>{character.name}</Text>
                    <Text style={styles.optionTagline}>{character.tagline}</Text>
                  </View>
                  <Ionicons name="add-circle" size={30} color={colors.text} />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark,
    paddingHorizontal: spacing.screen,
  },
  close: {
    alignSelf: 'flex-end',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.darkRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.gold,
    textAlign: 'center',
    marginTop: 16,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 30,
    lineHeight: 36,
    color: colors.textOnDark,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.textOnDarkSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  options: {
    gap: 12,
    marginTop: 28,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.card,
    minHeight: minTouchSize + 40,
  },
  optionText: {
    flex: 1,
  },
  optionName: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
  },
  optionTagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 19,
    color: colors.textSecondary,
    marginTop: 2,
  },
  joined: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 24,
  },
  buttons: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    gap: 12,
  },
  gold: {
    minHeight: 60,
    borderRadius: radius.card,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  goldText: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.dark,
    textAlign: 'center',
  },
  outline: {
    minHeight: 60,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 246, 238, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.textOnDark,
  },
});

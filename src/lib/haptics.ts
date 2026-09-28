// Small vibrations on key taps. Kept in one place so they're easy to tune or turn off.
// (They don't run in the iOS Simulator; check on a real iPhone.)

import * as Haptics from 'expo-haptics';

/** A light tap: pressing a main button. */
export function tapFeedback() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** A celebratory buzz: "I did it!" and unlocking a squad member. */
export function successFeedback() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

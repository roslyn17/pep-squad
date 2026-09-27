// Everything about reading pep talks aloud lives here, so the voice engine can be swapped
// later (see "AI voices" under Future features in CLAUDE.md). Playback arrives in step 5.

// Average speaking pace at the device's default rate (1.0).
const WORDS_PER_SECOND_AT_DEFAULT_RATE = 2.6;

/**
 * Roughly how long the text takes to say aloud, in whole seconds. expo-speech can't report
 * clip length, so the play button shows this estimate instead.
 */
export function estimateDurationSeconds(text: string, rate = 1): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / (WORDS_PER_SECOND_AT_DEFAULT_RATE * rate)));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

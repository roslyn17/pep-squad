import { Character } from '@/data/characters';

export type Intensity = 'gentle' | 'fired-up' | 'full-chaos';

export const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: 'gentle', label: 'Gentle' },
  { id: 'fired-up', label: 'Fired up' },
  { id: 'full-chaos', label: 'Full chaos' },
];

/**
 * Gets a pep talk from the character for this task and intensity.
 *
 * Step 3 placeholder: returns a clearly-labeled sample after a short pause, so the screen's
 * loading and result states can be built. Step 4 replaces this with the real AI call through
 * the backend; screens shouldn't need to change.
 */
export async function requestPepTalk(
  character: Character,
  task: string,
  intensity: Intensity,
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const label = INTENSITIES.find((i) => i.id === intensity)?.label ?? intensity;
  const text =
    `[Sample pep talk. Real ones arrive in step 4.] ` +
    `${character.name} here, cheering you on at "${label}" level. ` +
    `"${task}" doesn't stand a chance. Go get it!`;
  return character.tone === 'loud' ? text.toUpperCase() : text;
}

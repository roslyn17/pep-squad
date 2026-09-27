import { API_BASE_URL } from '@/config';
import { Character } from '@/data/characters';
import { getDeviceId } from '@/lib/storage';

export type Intensity = 'gentle' | 'fired-up' | 'full-chaos';

export const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: 'gentle', label: 'Gentle' },
  { id: 'fired-up', label: 'Fired up' },
  { id: 'full-chaos', label: 'Full chaos' },
];

/** "pep-talk" is before the task; "reaction" is after the user taps "I did it!". */
export type PepTalkKind = 'pep-talk' | 'reaction';

export type PepTalkResult =
  | { status: 'ok'; text: string }
  // Today's AI limit is used up. `text` is the character's in-character "come back tomorrow" line.
  | { status: 'limit'; text: string }
  // Anything else went wrong (no internet, server error). `text` is an in-character failure line.
  | { status: 'failed'; text: string };

const REQUEST_TIMEOUT_MS = 20_000;

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

/**
 * Asks the backend for a pep talk (or a reaction) from this character. Never throws: failures
 * come back as a result with the character's pre-written line, so screens can show it as-is.
 */
export async function requestPepTalk(
  character: Character,
  task: string,
  intensity: Intensity,
  kind: PepTalkKind = 'pep-talk',
): Promise<PepTalkResult> {
  // Give up on a slow request rather than leaving the character "thinking" forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}/api/pep-talk`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind,
        characterId: character.id,
        task,
        intensity,
        deviceId: await getDeviceId(),
      }),
      signal: controller.signal,
    });
    if (response.status === 429) return { status: 'limit', text: pick(character.limitLines) };
    if (!response.ok) return { status: 'failed', text: pick(character.failureLines) };
    const data = (await response.json()) as { text?: unknown };
    if (typeof data.text !== 'string' || !data.text.trim()) {
      return { status: 'failed', text: pick(character.failureLines) };
    }
    return { status: 'ok', text: data.text.trim() };
  } catch {
    return { status: 'failed', text: pick(character.failureLines) };
  } finally {
    clearTimeout(timer);
  }
}

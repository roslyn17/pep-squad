import { API_BASE_URL } from '@/config';
import { Character } from '@/data/characters';
import { getDeviceId } from '@/lib/storage';

/** "pep-talk" is before the task; "reaction" follows "I did it!"; "not-done" follows "I didn't do it". */
export type PepTalkKind = 'pep-talk' | 'reaction' | 'not-done';

/** What the user reported after a pep talk: "I did it!" or "I didn't do it". */
export type Outcome = 'done' | 'not-done';

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
  kind: PepTalkKind = 'pep-talk',
): Promise<PepTalkResult> {
  // Give up on a slow request rather than leaving the character "thinking" forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}/api/pep-talk`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Development builds only: unlocks the higher testing limit. The key comes from
        // .env.development.local on the developer's Mac (never committed, never in release builds).
        ...(__DEV__ && process.env.EXPO_PUBLIC_DEV_LIMIT_KEY
          ? { 'x-pep-dev-key': process.env.EXPO_PUBLIC_DEV_LIMIT_KEY }
          : {}),
      },
      body: JSON.stringify({
        kind,
        characterId: character.id,
        task,
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

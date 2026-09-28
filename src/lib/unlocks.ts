// Progress toward unlocking a new squad member: every PEP_TALKS_PER_UNLOCK unique pep talks.
// A pep talk counts unless the same task already counted today, so tapping Again or Swap on
// the same task (or leaving and asking again) doesn't add up.

import { useEffect, useState } from 'react';

import { CountedPepTalk, loadCountedPepTalks, writeCountedPepTalks } from '@/lib/storage';
import { localDay } from '@/lib/wins';

export const PEP_TALKS_PER_UNLOCK = 20;

let items: CountedPepTalk[] | null = null; // null until loaded from the phone
let loading: Promise<CountedPepTalk[]> | null = null;
const listeners = new Set<(items: CountedPepTalk[]) => void>();

function load(): Promise<CountedPepTalk[]> {
  if (items) return Promise.resolve(items);
  loading ??= loadCountedPepTalks().then((loaded) => {
    items = loaded;
    listeners.forEach((listener) => listener(loaded));
    return loaded;
  });
  return loading;
}

const normalize = (task: string) => task.trim().toLowerCase().replace(/\s+/g, ' ');

/** Counts a successful pep talk toward the next unlock, unless this task already counted today. */
export async function countPepTalk(task: string, characterId: string): Promise<void> {
  const current = await load();
  const now = new Date();
  const entry = { task: normalize(task), characterId, day: localDay(now), at: now.toISOString() };
  if (current.some((c) => c.task === entry.task && c.day === entry.day)) return;
  const next = [...current, entry];
  items = next;
  listeners.forEach((listener) => listener(next));
  await writeCountedPepTalks(next);
}

/** Pep talks still needed for the next unlock (0 = an unlock was just earned). */
export function pepTalksUntilUnlock(total: number): number {
  const remainder = total % PEP_TALKS_PER_UNLOCK;
  return total > 0 && remainder === 0 ? 0 : PEP_TALKS_PER_UNLOCK - remainder;
}

/** How many pep talks have counted so far. `null` while loading. */
export function useCountedPepTalks(): number | null {
  const [state, setState] = useState<CountedPepTalk[] | null>(items);
  useEffect(() => {
    listeners.add(setState);
    load().then(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return state ? state.length : null;
}

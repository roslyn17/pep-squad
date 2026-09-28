// Wins ("I did it!"), streaks, and progress toward the next unlock. Wins are kept on the
// phone; every screen that shows them updates when a new win is recorded.

import { useEffect, useState } from 'react';

import { loadWins, Win, writeWins } from '@/lib/storage';

/** A new squad member unlocks every this-many wins (step 9 adds choosing one). */
export const WINS_PER_UNLOCK = 10;

let wins: Win[] | null = null; // null until loaded from the phone
let loading: Promise<Win[]> | null = null;
const listeners = new Set<(wins: Win[]) => void>();

function load(): Promise<Win[]> {
  if (wins) return Promise.resolve(wins);
  loading ??= loadWins().then((loaded) => {
    wins = loaded;
    listeners.forEach((listener) => listener(loaded));
    return loaded;
  });
  return loading;
}

/** The phone's local calendar date, e.g. "2026-09-27". */
export function localDay(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * Records a win for this pep talk. Does nothing if this pep talk already has a win, so going
 * back and forth to "I did it!" never counts twice.
 */
export async function recordWin(entry: Omit<Win, 'day' | 'at'>): Promise<void> {
  const current = await load();
  if (current.some((w) => w.pepTalkId === entry.pepTalkId)) return;
  const now = new Date();
  const next = [...current, { ...entry, day: localDay(now), at: now.toISOString() }];
  wins = next;
  listeners.forEach((listener) => listener(next));
  await writeWins(next);
}

/**
 * Consecutive days with at least one win. Today counts once there's a win today; until then
 * a streak that reached yesterday is still shown (it isn't broken until today ends).
 */
export function currentStreak(all: Win[], today = new Date()): number {
  const days = new Set(all.map((w) => w.day));
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days.has(localDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDay(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Wins still needed for the next unlock (0 = an unlock was just earned). */
export function winsUntilUnlock(totalWins: number): number {
  const remainder = totalWins % WINS_PER_UNLOCK;
  return totalWins > 0 && remainder === 0 ? 0 : WINS_PER_UNLOCK - remainder;
}

/** All wins, oldest first. `null` while loading. */
export function useWins(): Win[] | null {
  const [state, setState] = useState<Win[] | null>(wins);
  useEffect(() => {
    listeners.add(setState);
    load().then(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return state;
}

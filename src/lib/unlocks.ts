// Progress toward unlocking a new squad member: every PEP_TALKS_PER_UNLOCK pep talks.
// Each "Pep me up!" counts (even the same task again later). Again and Swap on the same task
// don't; the pep talk screen decides that and only calls countPepTalk for new ones.

import { useEffect, useState } from 'react';

import { characters } from '@/data/characters';
import { addToSquad, loadSquad } from '@/lib/squad';
import {
  CountedPepTalk,
  loadCountedPepTalks,
  loadUnlockState,
  UnlockState,
  writeCountedPepTalks,
  writeUnlockState,
} from '@/lib/storage';
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

/** Counts a pep talk toward the next unlock. */
export async function countPepTalk(task: string, characterId: string): Promise<void> {
  const current = await load();
  const now = new Date();
  const entry = { task: normalize(task), characterId, day: localDay(now), at: now.toISOString() };
  const next = [...current, entry];
  items = next;
  listeners.forEach((listener) => listener(next));
  await writeCountedPepTalks(next);
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

// ---- Unlocks: earned = floor(counted pep talks / 20); pending = earned minus claimed. ----

const CHOICES_PER_UNLOCK = 3;

let unlockState: UnlockState | null = null;
const unlockListeners = new Set<(state: UnlockState) => void>();

async function getUnlockState(): Promise<UnlockState> {
  unlockState ??= await loadUnlockState();
  return unlockState;
}

async function setUnlockState(next: UnlockState) {
  unlockState = next;
  unlockListeners.forEach((listener) => listener(next));
  await writeUnlockState(next);
}

/**
 * Whether a new squad member can be chosen right now: an unlock has been earned but not used,
 * and there's still someone in the bank who isn't in the squad.
 */
export function useUnlockReady(): boolean {
  const count = useCountedPepTalks();
  const [state, setState] = useState<UnlockState | null>(unlockState);
  const [squadSize, setSquadSize] = useState<number | null>(null);
  useEffect(() => {
    unlockListeners.add(setState);
    getUnlockState().then(setState);
    return () => {
      unlockListeners.delete(setState);
    };
  }, []);
  // Re-check the squad size whenever the unlock state changes (a claim adds a member).
  useEffect(() => {
    loadSquad().then((ids) => setSquadSize(ids.length));
  }, [state]);
  if (count === null || state === null || squadSize === null) return false;
  const earned = Math.floor(count / PEP_TALKS_PER_UNLOCK);
  return earned > state.claimed && squadSize < characters.length;
}

/** The characters offered for the current unlock (up to 3, not already in the squad). */
export async function getUnlockOffer(): Promise<string[]> {
  const state = await getUnlockState();
  const squad = await loadSquad();
  const stillValid = state.offer?.filter((id) => !squad.includes(id)) ?? [];
  if (state.offer && stillValid.length === state.offer.length && stillValid.length > 0) {
    return state.offer;
  }
  const pool = characters.map((c) => c.id).filter((id) => !squad.includes(id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const offer = pool.slice(0, CHOICES_PER_UNLOCK);
  await setUnlockState({ ...state, offer });
  return offer;
}

/** Adds the chosen character to the squad and uses up one unlock. The other choices go back into the pool. */
export async function claimUnlock(characterId: string): Promise<void> {
  const state = await getUnlockState();
  await addToSquad(characterId);
  await setUnlockState({ claimed: state.claimed + 1, offer: null });
}

/** Development only: pretend 20 more unique pep talks happened, to test unlocking. */
export async function devAddPepTalks(): Promise<void> {
  const current = await load();
  const now = new Date();
  const extra = Array.from({ length: PEP_TALKS_PER_UNLOCK }, (_, i) => ({
    task: `dev test ${now.getTime()}-${i}`,
    characterId: 'dev',
    day: localDay(now),
    at: now.toISOString(),
  }));
  const next = [...current, ...extra];
  items = next;
  listeners.forEach((listener) => listener(next));
  await writeCountedPepTalks(next);
}

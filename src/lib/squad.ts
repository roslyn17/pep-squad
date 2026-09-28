import { useEffect, useMemo, useState } from 'react';

import { Character, TONES, characters, getCharacter } from '@/data/characters';
import { loadFeaturedPick, loadSquadIds, saveSquadIds, writeFeaturedPick } from '@/lib/storage';
import { localDay } from '@/lib/wins';

export const STARTING_SQUAD_SIZE = 5;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Picks one random character of each tone, then fills the rest of the squad from everyone left. */
export function pickStartingSquad(pool: Character[] = characters): string[] {
  const shuffled = shuffle(pool);
  const picked: Character[] = [];
  for (const tone of TONES) {
    const match = shuffled.find((c) => c.tone === tone && !picked.includes(c));
    if (match) picked.push(match);
  }
  for (const c of shuffled) {
    if (picked.length >= STARTING_SQUAD_SIZE) break;
    if (!picked.includes(c)) picked.push(c);
  }
  // Shuffle again so the grid order doesn't always go gentle, loud, chaotic, deadpan.
  return shuffle(picked).map((c) => c.id);
}

// The squad is shared by every screen: when someone joins (an unlock), all screens update.
let squadIds: string[] | null = null;
let loading: Promise<string[]> | null = null;
const listeners = new Set<(ids: string[]) => void>();

function publish(ids: string[]) {
  squadIds = ids;
  listeners.forEach((listener) => listener(ids));
}

/** Loads the squad from the phone, assigning a random starting squad on first launch. */
export function loadSquad(): Promise<string[]> {
  if (squadIds) return Promise.resolve(squadIds);
  loading ??= (async () => {
    const saved = await loadSquadIds();
    const valid = saved ? idsToCharacters(saved).map((c) => c.id) : [];
    const ids = valid.length > 0 ? valid : pickStartingSquad();
    if (valid.length === 0) await saveSquadIds(ids);
    publish(ids);
    return ids;
  })();
  return loading;
}

/** Adds a character to the end of the squad (used by unlocks). */
export async function addToSquad(characterId: string): Promise<void> {
  const current = await loadSquad();
  if (current.includes(characterId)) return;
  const next = [...current, characterId];
  publish(next);
  await saveSquadIds(next);
}

/** Development only: replaces the squad with a new random starting squad. */
async function rerollSquad(): Promise<void> {
  const ids = pickStartingSquad();
  publish(ids);
  await saveSquadIds(ids);
}

/** The user's squad (in the order they joined). `squad` is null while loading. */
export function useSquad() {
  const [ids, setIds] = useState<string[] | null>(squadIds);
  useEffect(() => {
    listeners.add(setIds);
    loadSquad().then(setIds);
    return () => {
      listeners.delete(setIds);
    };
  }, []);
  const squad = useMemo(() => (ids ? idsToCharacters(ids) : null), [ids]);
  return { squad, rerollSquad };
}

/**
 * Today's featured squad member: picked once per day and remembered, so it stays the same all
 * day even if someone joins the squad. Tomorrow it moves on to the next squad member.
 */
export function useMemberOfTheDay(squad: Character[] | null): Character | undefined {
  const [pick, setPick] = useState<Character | undefined>(undefined);
  useEffect(() => {
    if (!squad || squad.length === 0) return;
    let cancelled = false;
    (async () => {
      const today = localDay();
      const saved = await loadFeaturedPick();
      let chosen = saved?.day === today ? squad.find((c) => c.id === saved.characterId) : undefined;
      if (!chosen) {
        // Rotate: the member after yesterday's pick (or the first one).
        const previous = saved ? squad.findIndex((c) => c.id === saved.characterId) : -1;
        chosen = squad[(previous + 1) % squad.length];
        await writeFeaturedPick({ day: today, characterId: chosen.id });
      }
      if (!cancelled) setPick(chosen);
    })();
    return () => {
      cancelled = true;
    };
  }, [squad]);
  return pick;
}

// Drops ids that no longer exist in the character bank (e.g. a character was renamed).
function idsToCharacters(ids: string[]): Character[] {
  return ids.map(getCharacter).filter((c): c is Character => c !== undefined);
}

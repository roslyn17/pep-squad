import { useCallback, useEffect, useState } from 'react';

import { Character, TONES, characters, getCharacter } from '@/data/characters';
import { loadSquadIds, saveSquadIds } from '@/lib/storage';

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

/**
 * The user's squad, loaded from the phone. On first launch it assigns and saves a random
 * starting squad. `squad` is null while loading.
 */
export function useSquad() {
  const [squad, setSquad] = useState<Character[] | null>(null);

  const assignNewSquad = useCallback(async () => {
    const ids = pickStartingSquad();
    await saveSquadIds(ids);
    setSquad(idsToCharacters(ids));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadSquadIds();
      const valid = saved ? idsToCharacters(saved) : [];
      if (cancelled) return;
      if (valid.length > 0) {
        setSquad(valid);
      } else {
        await assignNewSquad();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assignNewSquad]);

  return { squad, rerollSquad: assignNewSquad };
}

// Drops ids that no longer exist in the character bank (e.g. a character was renamed).
function idsToCharacters(ids: string[]): Character[] {
  return ids.map(getCharacter).filter((c): c is Character => c !== undefined);
}

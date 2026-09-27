// Saved pep talks: kept on the phone, shared by every screen that shows them. Saving or
// removing on one screen updates the others immediately.

import { useEffect, useState } from 'react';

import { loadSavedPepTalks, SavedPepTalk, writeSavedPepTalks } from '@/lib/storage';

let items: SavedPepTalk[] | null = null; // null until loaded from the phone
let loading: Promise<SavedPepTalk[]> | null = null;
const listeners = new Set<(items: SavedPepTalk[]) => void>();

function load(): Promise<SavedPepTalk[]> {
  if (items) return Promise.resolve(items);
  loading ??= loadSavedPepTalks().then((loaded) => {
    items = loaded;
    listeners.forEach((listener) => listener(loaded));
    return loaded;
  });
  return loading;
}

async function update(change: (current: SavedPepTalk[]) => SavedPepTalk[]) {
  const next = change(await load());
  items = next;
  listeners.forEach((listener) => listener(next));
  await writeSavedPepTalks(next);
}

/** Saves a pep talk (newest first) and returns its id. */
export async function savePepTalk(entry: Omit<SavedPepTalk, 'id' | 'savedAt'>): Promise<string> {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  await update((current) => [{ ...entry, id, savedAt: new Date().toISOString() }, ...current]);
  return id;
}

export function removeSavedPepTalk(id: string): Promise<void> {
  return update((current) => current.filter((item) => item.id !== id));
}

/** All saved pep talks, newest first. `null` while loading. */
export function useSavedPepTalks(): SavedPepTalk[] | null {
  const [state, setState] = useState<SavedPepTalk[] | null>(items);
  useEffect(() => {
    listeners.add(setState);
    load().then(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return state;
}

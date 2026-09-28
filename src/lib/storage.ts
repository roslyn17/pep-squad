// All data the app saves on the phone goes through this file, so it's easy to find,
// migrate, or sync later (see "User accounts" under Future features in CLAUDE.md).

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  squad: 'pepsquad:v1:squad', // array of character ids
  deviceId: 'pepsquad:v1:deviceId', // anonymous id for the backend's per-phone daily limit
  saved: 'pepsquad:v1:saved', // array of SavedPepTalk, newest first
  wins: 'pepsquad:v1:wins', // array of Win, oldest first
};

export type Win = {
  /** The pep talk this win came from. One win per pep talk. */
  pepTalkId: string;
  characterId: string;
  task: string;
  /** The phone's local date when the win happened, e.g. "2026-09-27". Used for streaks. */
  day: string;
  at: string; // ISO timestamp
};

export type SavedPepTalk = {
  id: string;
  characterId: string;
  task: string;
  text: string;
  savedAt: string; // ISO date
};

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function loadSquadIds(): Promise<string[] | null> {
  return readJson<string[]>(KEYS.squad);
}

export function saveSquadIds(ids: string[]): Promise<void> {
  return writeJson(KEYS.squad, ids);
}

/** A random anonymous id for this phone, created on first use. Not tied to the person. */
export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(KEYS.deviceId);
  if (existing) return existing;
  const id = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  await AsyncStorage.setItem(KEYS.deviceId, id);
  return id;
}

export async function loadSavedPepTalks(): Promise<SavedPepTalk[]> {
  return (await readJson<SavedPepTalk[]>(KEYS.saved)) ?? [];
}

export function writeSavedPepTalks(items: SavedPepTalk[]): Promise<void> {
  return writeJson(KEYS.saved, items);
}

export async function loadWins(): Promise<Win[]> {
  return (await readJson<Win[]>(KEYS.wins)) ?? [];
}

export function writeWins(wins: Win[]): Promise<void> {
  return writeJson(KEYS.wins, wins);
}

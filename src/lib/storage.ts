// All data the app saves on the phone goes through this file, so it's easy to find,
// migrate, or sync later (see "User accounts" under Future features in CLAUDE.md).

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  squad: 'pepsquad:v1:squad', // array of character ids
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

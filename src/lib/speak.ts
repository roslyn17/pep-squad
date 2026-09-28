// Everything about reading pep talks aloud lives here, so the voice engine can be swapped
// later (see "AI voices" under Future features in CLAUDE.md).

import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';

import { Character } from '@/data/characters';

// Average speaking pace at the device's default rate (1.0).
const WORDS_PER_SECOND_AT_DEFAULT_RATE = 3.3; // measured in the Simulator

/**
 * Roughly how long the text takes to say aloud, in whole seconds. expo-speech can't report
 * clip length, so the play button shows this estimate instead.
 */
export function estimateDurationSeconds(text: string, rate = 1): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / (WORDS_PER_SECOND_AT_DEFAULT_RATE * rate)));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Text-to-speech reads some all-caps words as letters ("IT" -> "I T"), so shouted lines
 * (Sergeant Stone) are spoken in normal case. The screen still shows them in caps.
 */
function forSpeech(text: string): string {
  const letters = text.replace(/[^A-Za-z]/g, '');
  const upper = letters.replace(/[^A-Z]/g, '').length;
  return letters.length > 0 && upper / letters.length > 0.6 ? text.toLowerCase() : text;
}

// The phone's installed voices, loaded once. iOS sometimes returns an empty list on the very
// first call, so an empty result isn't cached.
let voicesCache: Speech.Voice[] | null = null;
async function installedVoices(): Promise<Speech.Voice[]> {
  if (voicesCache) return voicesCache;
  const voices = await Speech.getAvailableVoicesAsync().catch(() => []);
  if (voices.length > 0) voicesCache = voices;
  return voices;
}

const isEnhanced = (voice: Speech.Voice) => voice.quality === Speech.VoiceQuality.Enhanced;

/**
 * Picks the character's voice: the first of their preferred voices that this phone has,
 * using an Enhanced/Premium download of it when available. Undefined = the phone's default.
 */
async function voiceFor(character: Character): Promise<string | undefined> {
  const voices = await installedVoices();
  for (const preference of character.voice.preferred) {
    const isLanguage = /^[a-z]{2}-[A-Z]{2}$/.test(preference);
    const matches = voices.filter((v) =>
      isLanguage
        ? v.language === preference
        : v.name === preference || v.name.startsWith(`${preference} (`), // e.g. "Daniel (Enhanced)"
    );
    const best = matches.find(isEnhanced) ?? matches[0];
    if (best) return best.identifier;
  }
  return undefined;
}

// Only one line plays at a time across the whole app. Screens subscribe to know what's playing.
let currentId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

function setCurrent(id: string | null) {
  currentId = id;
  listeners.forEach((listener) => listener(id));
}

/** Reads `text` aloud in the character's voice. `id` identifies what's playing (e.g. a pep talk). */
export async function speak(id: string, text: string, character: Character) {
  Speech.stop();
  setCurrent(id);
  const voice = await voiceFor(character);
  if (currentId !== id) return; // stopped or replaced while the voice list was loading
  // iOS can report "done" early when one line is cut off and another starts right away, so
  // double-check that speech really ended before switching the button back to play.
  const finished = () => {
    const check = async () => {
      if (currentId !== id) return;
      if (await Speech.isSpeakingAsync().catch(() => false)) setTimeout(check, 400);
      else if (currentId === id) setCurrent(null);
    };
    check();
  };
  Speech.speak(forSpeech(text), {
    pitch: character.voice.pitch,
    rate: character.voice.rate,
    ...(voice ? { voice } : { language: 'en-US' }),
    // Let iOS give speech its own audio session. Using the app's session (the default) was
    // silent on a real iPhone in Expo Go even with sound on.
    useApplicationAudioSession: false,
    onDone: finished,
    onStopped: finished,
    onError: finished,
  });
}

export function stopSpeaking() {
  Speech.stop();
  setCurrent(null);
}

/**
 * Lets a screen play lines and know which one is playing. Stops speech when the screen closes,
 * so a pep talk doesn't keep talking after you leave.
 */
export function useSpeech() {
  const [playingId, setPlayingId] = useState<string | null>(currentId);

  useEffect(() => {
    listeners.add(setPlayingId);
    return () => {
      listeners.delete(setPlayingId);
      stopSpeaking();
    };
  }, []);

  const toggle = useCallback((id: string, text: string, character: Character) => {
    if (currentId === id) stopSpeaking();
    else speak(id, text, character);
  }, []);

  return { playingId, toggle, stop: stopSpeaking };
}

// Everything about reading pep talks aloud lives here, so the voice engine can be swapped
// later (see "AI voices" under Future features in CLAUDE.md).

import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';

import { Character } from '@/data/characters';

// Average speaking pace at the device's default rate (1.0).
const WORDS_PER_SECOND_AT_DEFAULT_RATE = 2.6;

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

// Only one line plays at a time across the whole app. Screens subscribe to know what's playing.
let currentId: string | null = null;
const listeners = new Set<(id: string | null) => void>();

function setCurrent(id: string | null) {
  currentId = id;
  listeners.forEach((listener) => listener(id));
}

/** Reads `text` aloud in the character's voice. `id` identifies what's playing (e.g. a pep talk). */
export function speak(id: string, text: string, character: Character) {
  Speech.stop();
  setCurrent(id);
  const finished = () => {
    if (currentId === id) setCurrent(null);
  };
  Speech.speak(forSpeech(text), {
    pitch: character.voice.pitch,
    rate: character.voice.rate,
    language: 'en-US',
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

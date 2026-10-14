"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Storage key for persisting video audio mute state across views and queue steps.
 */
export const AUDIO_STORAGE_KEY = "reel_audio_muted";

const AUDIO_EVENT = "reel_audio_change";

function readStoredMute(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(AUDIO_STORAGE_KEY);
    if (raw === null) return true;
    // Only literal "false" is unmuted; everything else (null, corrupted) defaults to muted (true)
    return raw !== "false";
  } catch {
    return true;
  }
}

function writeStoredMute(val: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUDIO_STORAGE_KEY, String(val));
    window.dispatchEvent(new CustomEvent(AUDIO_EVENT, { detail: val }));
  } catch {
    // Ignore quota or disabled storage errors
  }
}

/**
 * usePersistentAudio hook
 *
 * Preserves user mute preferences across film queue step changes and route navigation.
 * Backed by localStorage key 'reel_audio_muted', defaulting safely to muted: true.
 */
export function usePersistentAudio(): {
  muted: boolean;
  toggleMute: () => void;
  setMuted: (val: boolean) => void;
} {
  // Default state is muted: true for safe browser autoplay compliance
  const [muted, setMutedState] = useState<boolean>(true);

  // Sync with localStorage on client mount
  useEffect(() => {
    setMutedState(readStoredMute());

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === "boolean") {
        setMutedState(customEvent.detail);
      } else {
        setMutedState(readStoredMute());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUDIO_STORAGE_KEY) {
        setMutedState(readStoredMute());
      }
    };

    window.addEventListener(AUDIO_EVENT, handleCustomChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUDIO_EVENT, handleCustomChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setMuted = useCallback((val: boolean) => {
    setMutedState(val);
    writeStoredMute(val);
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      writeStoredMute(next);
      return next;
    });
  }, []);

  return { muted, toggleMute, setMuted };
}

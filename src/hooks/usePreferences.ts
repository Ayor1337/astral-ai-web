import { useState, useCallback } from "react";

const STORAGE_KEY = "astral-preferences";

interface Preferences {
  thinkingEnabled: boolean;
}

function readPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { thinkingEnabled: false, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { thinkingEnabled: false };
}

function writePrefs(prefs: Preferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(readPrefs);

  const setThinkingEnabled = useCallback((value: boolean) => {
    setPrefs((prev) => {
      const next = { ...prev, thinkingEnabled: value };
      writePrefs(next);
      return next;
    });
  }, []);

  const toggleThinking = useCallback(() => {
    setPrefs((prev) => {
      const next = { ...prev, thinkingEnabled: !prev.thinkingEnabled };
      writePrefs(next);
      return next;
    });
  }, []);

  return {
    thinkingEnabled: prefs.thinkingEnabled,
    setThinkingEnabled,
    toggleThinking,
  };
}

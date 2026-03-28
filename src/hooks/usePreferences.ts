import { useState, useCallback } from "react";

const STORAGE_KEY = "astral-preferences";

interface Preferences {
  thinkingEnabled: boolean;
  searchEnabled: boolean;
}

function readPrefs(): Preferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw)
      return {
        thinkingEnabled: false,
        searchEnabled: true,
        ...JSON.parse(raw),
      };
  } catch {
    /* ignore */
  }
  return { thinkingEnabled: false, searchEnabled: true };
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

  const toggleSearch = useCallback(() => {
    setPrefs((prev) => {
      const next = { ...prev, searchEnabled: !prev.searchEnabled };
      writePrefs(next);
      return next;
    });
  }, []);

  return {
    thinkingEnabled: prefs.thinkingEnabled,
    searchEnabled: prefs.searchEnabled,
    setThinkingEnabled,
    toggleThinking,
    toggleSearch,
  };
}

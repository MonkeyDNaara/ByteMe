"use client";

import { useCallback, useSyncExternalStore } from "react";

// Favourites are stored as an array of recipe ids in localStorage.
const STORAGE_KEY = "byte-me:favorites";
// Same-tab sync: components dispatch/listen for this event so every mounted
// `useFavorites` updates when one of them changes the list. Cross-tab sync uses
// the native `storage` event.
const CHANGE_EVENT = "byte-me:favorites-changed";

// `useSyncExternalStore` requires `getSnapshot` to return a stable reference
// while the underlying data is unchanged, so we memoise the parsed array against
// the raw string last seen in storage.
let cachedRaw: string | null = null;
let cachedFavorites: string[] = [];
const SERVER_SNAPSHOT: string[] = [];

function getSnapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return cachedFavorites;
  }

  if (raw === cachedRaw) return cachedFavorites;
  cachedRaw = raw;

  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedFavorites = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    cachedFavorites = [];
  }
  return cachedFavorites;
}

function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const toggleFavorite = useCallback((id: string) => {
    const current = getSnapshot();
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    const serialized = JSON.stringify(next);
    // Update the memoised snapshot up front so this works even if storage is
    // unavailable (private mode, disabled).
    cachedRaw = serialized;
    cachedFavorites = next;
    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Ignore: the in-memory cache above keeps this session consistent.
    }
    // Refresh every mounted `useFavorites` in this tab.
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  return { favorites, isFavorite, toggleFavorite };
}

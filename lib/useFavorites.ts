"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { authClient } from "@/lib/auth/client";
import {
  getMyFavoriteIds,
  importLocalFavorites,
  setFavorite,
} from "@/lib/favorites";

// Same-tab sync: every mounted `useFavorites` re-renders when one of them
// changes the shared cache below. There's no cross-tab sync anymore (unlike
// the old localStorage-backed version, which got that for free from the
// native `storage` event) -- favorites now live server-side, so another tab
// only sees a change on its next fetch.
const CHANGE_EVENT = "byte-me:favorites-changed";

// The pre-accounts localStorage key this hook imports from, once, then clears.
const LEGACY_STORAGE_KEY = "byte-me:favorites";

let cachedFavorites: string[] = [];
// Which account `cachedFavorites` belongs to, so switching accounts (or
// logging out) doesn't leak the previous user's favorites for a moment.
let cachedForUserId: string | null = null;
let loadInFlight: Promise<void> | null = null;
const SERVER_SNAPSHOT: string[] = [];

function getSnapshot(): string[] {
  return cachedFavorites;
}

function getServerSnapshot(): string[] {
  return SERVER_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function readLegacyFavoriteIds(): string[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

async function loadFavorites(userId: string): Promise<void> {
  if (loadInFlight) return loadInFlight;

  loadInFlight = (async () => {
    const legacyIds = readLegacyFavoriteIds();
    if (legacyIds.length > 0) {
      await importLocalFavorites(legacyIds);
      try {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // Ignore: worst case, the next load retries the (now no-op) import.
      }
    }

    cachedFavorites = await getMyFavoriteIds();
    cachedForUserId = userId;
    notify();
  })();

  try {
    await loadInFlight;
  } finally {
    loadInFlight = null;
  }
}

export function useFavorites() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;
  const favorites = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!userId) {
      if (cachedForUserId !== null) {
        cachedFavorites = [];
        cachedForUserId = null;
        notify();
      }
      return;
    }

    if (cachedForUserId !== userId) {
      void loadFavorites(userId);
    }
  }, [userId]);

  /**
   * Sets a favorite to an exact state (no-op if it's already there). Reads the
   * live module cache, so it's safe for a delayed "Undo" even if the user
   * clicked again in the meantime -- a plain toggle could flip it the wrong way.
   * Returns whether anything changed.
   */
  const setFavoriteState = useCallback(
    (id: string, next: boolean): boolean => {
      if (!userId || cachedFavorites.includes(id) === next) return false;

      cachedFavorites = next
        ? [...cachedFavorites, id]
        : cachedFavorites.filter((item) => item !== id);
      notify();
      // Best-effort DB sync; the optimistic update above doesn't wait on this.
      void setFavorite(id, next);
      return true;
    },
    [userId],
  );

  const toggleFavorite = useCallback(
    (id: string) => setFavoriteState(id, !cachedFavorites.includes(id)),
    [setFavoriteState],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  // True once `favorites` really belongs to the signed-in user. Before that
  // it's an empty placeholder, so pages can show server-loaded ids instead
  // of flashing "no favorites". (Read after useSyncExternalStore, which
  // re-renders right after loadFavorites updates both values.)
  const isLoaded = userId !== null && cachedForUserId === userId;

  return { favorites, isFavorite, toggleFavorite, setFavoriteState, isLoggedIn: userId != null, isLoaded };
}

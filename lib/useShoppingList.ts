"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { useSessionUserId } from "@/app/components/SessionProvider";
import { getMyShoppingListRecipeIds, setOnShoppingList } from "@/lib/shoppingList";

// Same architecture as lib/useFavorites.ts: a module-level cache backing
// useSyncExternalStore, hydrated once per login from the server.
const CHANGE_EVENT = "byte-me:shopping-list-changed";

let cachedRecipeIds: string[] = [];
let cachedForUserId: string | null = null;
let loadInFlight: Promise<void> | null = null;
const SERVER_SNAPSHOT: string[] = [];

function getSnapshot(): string[] {
  return cachedRecipeIds;
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

async function loadShoppingList(userId: string): Promise<void> {
  if (loadInFlight) return loadInFlight;

  loadInFlight = (async () => {
    cachedRecipeIds = await getMyShoppingListRecipeIds();
    cachedForUserId = userId;
    notify();
  })();

  try {
    await loadInFlight;
  } finally {
    loadInFlight = null;
  }
}

export function useShoppingList() {
  // Server-provided (see SessionProvider) -- updates right after sign-in/out.
  const userId = useSessionUserId();
  const recipeIds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!userId) {
      if (cachedForUserId !== null) {
        cachedRecipeIds = [];
        cachedForUserId = null;
        notify();
      }
      return;
    }

    if (cachedForUserId !== userId) {
      void loadShoppingList(userId);
    }
  }, [userId]);

  /** Sets an exact state (no-op if already there) -- safe for a delayed "Undo", see useFavorites. */
  const setOnListState = useCallback(
    (id: string, next: boolean): boolean => {
      if (!userId || cachedRecipeIds.includes(id) === next) return false;

      cachedRecipeIds = next
        ? [...cachedRecipeIds, id]
        : cachedRecipeIds.filter((item) => item !== id);
      notify();
      void setOnShoppingList(id, next);
      return true;
    },
    [userId],
  );

  /**
   * Marks a recipe as on the list in the local cache only -- for callers that
   * already saved it on the server themselves (the ingredient checklist).
   */
  const markOnList = useCallback(
    (id: string) => {
      if (!userId || cachedRecipeIds.includes(id)) return;
      cachedRecipeIds = [...cachedRecipeIds, id];
      notify();
    },
    [userId],
  );

  const toggleOnList = useCallback(
    (id: string) => setOnListState(id, !cachedRecipeIds.includes(id)),
    [setOnListState],
  );

  const isOnList = useCallback(
    (id: string) => recipeIds.includes(id),
    [recipeIds],
  );

  return { recipeIds, isOnList, toggleOnList, setOnListState, markOnList, isLoggedIn: userId != null };
}

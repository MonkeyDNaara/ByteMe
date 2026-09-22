"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

import { authClient } from "@/lib/auth/client";
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
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;
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

  const toggleOnList = useCallback(
    (id: string) => {
      if (!userId) return;

      const next = !cachedRecipeIds.includes(id);
      cachedRecipeIds = next
        ? [...cachedRecipeIds, id]
        : cachedRecipeIds.filter((item) => item !== id);
      notify();
      void setOnShoppingList(id, next);
    },
    [userId],
  );

  const isOnList = useCallback(
    (id: string) => recipeIds.includes(id),
    [recipeIds],
  );

  return { recipeIds, isOnList, toggleOnList, isLoggedIn: userId != null };
}

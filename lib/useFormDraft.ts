"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { z } from "zod";

import { useSessionUserId } from "@/app/components/SessionProvider";

// Auto-saved form drafts in localStorage, one per user + form ("scope").
// localStorage lives only in this browser and can hold anything (old formats,
// hand-edited values), so every read is validated with zod and every access
// is wrapped in try/catch (private mode / full storage can throw).

const PREFIX = "byteme:draft:";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SAVE_DELAY_MS = 800;
const CHANGE_EVENT = "byte-me:draft-changed";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable -> the form just works without drafts.
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const notify = () => window.dispatchEvent(new Event(CHANGE_EVENT));

type StoredDraft<T> = { savedAt: number; values: T };

type UseFormDraftOptions<T> = {
  /** Which form, e.g. "create" or "edit:42" (the user id is added automatically). */
  scope: string;
  /** Validates what comes back out of localStorage. */
  schema: z.ZodType<T>;
  /** The form's current values. */
  values: T;
};

/**
 * - Saves `values` 800 ms after the last change (debounce) -- but only when
 *   they differ from what the form started with (no drafts of an untouched form).
 * - Returns the draft found when the form was opened, so the page can offer
 *   "Restore / Discard". Saving is paused until the user decides, so typing
 *   can't overwrite the old draft before they've seen it.
 * - `clear()` after a successful submit or a deliberate cancel.
 */
export function useFormDraft<T>({ scope, schema, values }: UseFormDraftOptions<T>) {
  const userId = useSessionUserId();
  const key = userId ? `${PREFIX}${userId}:${scope}` : null;

  // What the form started with -- a draft identical to this isn't worth keeping.
  const [initialSnapshot] = useState(() => JSON.stringify(values));
  const snapshot = JSON.stringify(values);

  // Server snapshot = null: localStorage doesn't exist on the server, so the
  // banner only appears after hydration (no hydration mismatch).
  const raw = useSyncExternalStore(subscribe, () => (key ? read(key) : null), () => null);

  // The banner question is answered (restored or discarded) -> saving may start.
  const [decided, setDecided] = useState(false);
  // Set by clear(): no more saves, even from a timer that's still pending.
  const stoppedRef = useRef(false);

  const storedDraft = useMemo<StoredDraft<T> | null>(() => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { savedAt?: unknown; values?: unknown };
      const result = schema.safeParse(parsed.values);
      if (!result.success || typeof parsed.savedAt !== "number") return null;
      return { savedAt: parsed.savedAt, values: result.data };
    } catch {
      return null;
    }
  }, [raw, schema]);

  // Only a draft that differs from the form's starting point is offered.
  const pendingDraft =
    !decided && storedDraft && JSON.stringify(storedDraft.values) !== initialSnapshot ? storedDraft : null;

  // Housekeeping once per visit: drop this user's drafts older than 7 days.
  useEffect(() => {
    if (!userId) return;
    try {
      const now = Date.now();
      for (const storageKey of Object.keys(window.localStorage)) {
        if (!storageKey.startsWith(`${PREFIX}${userId}:`)) continue;
        const savedAt = (JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as { savedAt?: number }).savedAt;
        if (typeof savedAt !== "number" || now - savedAt > MAX_AGE_MS) window.localStorage.removeItem(storageKey);
      }
      notify();
    } catch {
      // ignore
    }
  }, [userId]);

  // Debounced auto-save. Each change restarts the timer (cleanup clears it).
  const isPaused = pendingDraft !== null;
  useEffect(() => {
    if (!key || isPaused) return;
    const timer = setTimeout(() => {
      if (stoppedRef.current) return;
      // From now on the stored draft is THIS session's work -- never offer it
      // back as an "old draft" in the banner.
      setDecided(true);
      // Back to the starting values (e.g. everything undone) -> no draft needed.
      write(key, snapshot === initialSnapshot ? null : JSON.stringify({ savedAt: Date.now(), values: JSON.parse(snapshot) }));
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [key, snapshot, initialSnapshot, isPaused]);

  return {
    /** The draft found on opening the form, until the user restores or discards it. */
    pendingDraft,
    /** Marks the draft as handled; the caller puts `pendingDraft.values` into its state. */
    markRestored: () => setDecided(true),
    discard: () => {
      if (key) write(key, null);
      setDecided(true);
      notify();
    },
    /** After a successful submit or a deliberate cancel: delete and stop saving. */
    clear: () => {
      stoppedRef.current = true;
      if (key) write(key, null);
    },
  };
}

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Support never changes while the page is open, so there's nothing to subscribe to.
const noopSubscribe = () => () => {};

/**
 * Keeps the screen on while `enabled` is true (Screen Wake Lock API).
 *
 * The browser releases the lock by itself whenever the tab is hidden (app
 * switch, phone locked) and never re-acquires it -- so we request it again on
 * `visibilitychange`. Unsupported browsers or a refused request (e.g. battery
 * saver) fail silently: `isActive` just stays false.
 */
export function useWakeLock(enabled: boolean) {
  // useSyncExternalStore instead of reading `navigator` during render: the
  // server snapshot (false) is used for hydration, so server and client HTML match.
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    () => "wakeLock" in navigator,
    () => false,
  );
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    // Set by the cleanup: a request that resolves after unmount/disable is released right away.
    let cancelled = false;

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel = lock;
        setIsActive(true);
        // Fires for our own release() AND when the browser drops the lock (tab hidden).
        lock.addEventListener("release", () => setIsActive(false));
      } catch {
        setIsActive(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && (sentinel === null || sentinel.released)) {
        void request();
      }
    };

    void request();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      void sentinel?.release();
    };
  }, [enabled]);

  return { isSupported, isActive };
}

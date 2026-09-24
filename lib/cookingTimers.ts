"use client";

import { useCallback, useEffect, useState } from "react";

// Running timers are per-browser and ephemeral (not synced across devices,
// not tied to an account), so they live entirely in localStorage rather than
// the database -- keyed by recipe id, so different recipes' timers don't mix.
const STORAGE_KEY_PREFIX = "byte-me:cooking-timers:";

export type TimerStatus = "running" | "paused" | "completed";

export type StepTimer = {
  stepIndex: number;
  durationSeconds: number;
  status: TimerStatus;
  // Absolute end time (ms epoch), set only while running. Remaining time is
  // always computed as `endsAt - now`, not decremented directly -- that way
  // it stays correct across a paused tab, a backgrounded browser, or a full
  // page reload, instead of drifting the way a plain setInterval countdown would.
  endsAt: number | null;
  // Frozen remaining seconds, set while paused or once completed (where it's always 0).
  remainingSeconds: number | null;
};

function isStepTimer(value: unknown): value is StepTimer {
  if (!value || typeof value !== "object") return false;
  const timer = value as Record<string, unknown>;
  return (
    typeof timer.stepIndex === "number" &&
    typeof timer.durationSeconds === "number" &&
    (timer.status === "running" ||
      timer.status === "paused" ||
      timer.status === "completed") &&
    (timer.endsAt === null || typeof timer.endsAt === "number") &&
    (timer.remainingSeconds === null || typeof timer.remainingSeconds === "number")
  );
}

function loadTimers(recipeId: string): Record<number, StepTimer> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + recipeId);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    const result: Record<number, StepTimer> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (isStepTimer(value)) result[Number(key)] = value;
    }
    return result;
  } catch {
    return {};
  }
}

function saveTimers(recipeId: string, timers: Record<number, StepTimer>) {
  try {
    if (Object.keys(timers).length === 0) {
      window.localStorage.removeItem(STORAGE_KEY_PREFIX + recipeId);
    } else {
      window.localStorage.setItem(
        STORAGE_KEY_PREFIX + recipeId,
        JSON.stringify(timers),
      );
    }
  } catch {
    // Ignore: worst case, timer state doesn't survive a reload this time.
  }
}

/** A short two-beep chime, synthesized with the Web Audio API so no audio file is needed. */
function playCompletionSound() {
  try {
    type WindowWithWebkitAudio = typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextClass =
      window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const playTone = (startTime: number) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    };

    const now = ctx.currentTime;
    playTone(now);
    playTone(now + 0.4);
  } catch {
    // Audio unavailable (autoplay policy, unsupported browser) -- the
    // visual "Done" state on the timer still communicates completion.
  }
}

/** Remaining seconds for a timer right now -- always derived, never stored while running. */
export function getRemainingSeconds(timer: StepTimer, now: number): number {
  if (timer.status === "running" && timer.endsAt != null) {
    return Math.max(0, Math.round((timer.endsAt - now) / 1000));
  }
  return timer.remainingSeconds ?? 0;
}

export function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function useCookingTimers(recipeId: string) {
  const [timers, setTimers] = useState<Record<number, StepTimer>>({});
  const [now, setNow] = useState(() => Date.now());
  // Guards the save effect below: on the very first render its `timers`
  // closure is still the initial `{}`, before the load effect's setState
  // has taken effect -- without this flag, that first run would persist an
  // empty state and immediately erase whatever loadTimers just read.
  const [isHydrated, setIsHydrated] = useState(false);

  // Load once on mount (and if the recipe id ever changes, which it won't
  // in practice since this hook is only used for one recipe's cook page).
  // Deliberately starts at `{}` (matching the server, where localStorage
  // doesn't exist) and hydrates after mount, rather than reading
  // localStorage in useState's initializer -- that would run again during
  // client hydration and produce a different value than the server
  // rendered, a real hydration mismatch instead of just this lint warning.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimers(loadTimers(recipeId));
    setIsHydrated(true);
  }, [recipeId]);

  useEffect(() => {
    if (!isHydrated) return;
    saveTimers(recipeId, timers);
  }, [recipeId, timers, isHydrated]);

  const hasRunningTimer = Object.values(timers).some(
    (timer) => timer.status === "running",
  );

  // Only ticks while at least one timer is actually running, so an idle
  // cooking session with no active timers does nothing in the background.
  useEffect(() => {
    if (!hasRunningTimer) return;

    const interval = setInterval(() => {
      const tickTime = Date.now();
      setNow(tickTime);

      setTimers((current) => {
        let changed = false;
        const next: Record<number, StepTimer> = { ...current };

        for (const [key, timer] of Object.entries(current)) {
          if (timer.status !== "running" || timer.endsAt == null) continue;
          if (tickTime >= timer.endsAt) {
            next[Number(key)] = {
              ...timer,
              status: "completed",
              endsAt: null,
              remainingSeconds: 0,
            };
            changed = true;
            playCompletionSound();
          }
        }

        return changed ? next : current;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasRunningTimer]);

  const startTimer = useCallback((stepIndex: number, durationMinutes: number) => {
    const durationSeconds = Math.round(durationMinutes * 60);
    setNow(Date.now());
    setTimers((current) => ({
      ...current,
      [stepIndex]: {
        stepIndex,
        durationSeconds,
        status: "running",
        endsAt: Date.now() + durationSeconds * 1000,
        remainingSeconds: null,
      },
    }));
  }, []);

  const pauseTimer = useCallback((stepIndex: number) => {
    setTimers((current) => {
      const timer = current[stepIndex];
      if (!timer || timer.status !== "running" || timer.endsAt == null) {
        return current;
      }
      const remaining = getRemainingSeconds(timer, Date.now());
      return {
        ...current,
        [stepIndex]: {
          ...timer,
          status: "paused",
          endsAt: null,
          remainingSeconds: remaining,
        },
      };
    });
  }, []);

  const resumeTimer = useCallback((stepIndex: number) => {
    setNow(Date.now());
    setTimers((current) => {
      const timer = current[stepIndex];
      if (!timer || timer.status !== "paused") return current;
      const remaining = timer.remainingSeconds ?? 0;
      return {
        ...current,
        [stepIndex]: {
          ...timer,
          status: "running",
          endsAt: Date.now() + remaining * 1000,
          remainingSeconds: null,
        },
      };
    });
  }, []);

  const stopTimer = useCallback((stepIndex: number) => {
    setTimers((current) => {
      if (!(stepIndex in current)) return current;
      const next = { ...current };
      delete next[stepIndex];
      return next;
    });
  }, []);

  const clearAllTimers = useCallback(() => {
    setTimers({});
  }, []);

  const timerList = Object.values(timers).sort(
    (a, b) => a.stepIndex - b.stepIndex,
  );

  return {
    timers: timerList,
    getTimer: (stepIndex: number) => timers[stepIndex],
    now,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    clearAllTimers,
  };
}

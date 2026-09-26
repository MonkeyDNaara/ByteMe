"use client";

import { formatTimer, getRemainingSeconds, type StepTimer } from "@/lib/cookingTimers";
import type { CookingStep } from "@/lib/recipe";

type ActiveTimersProps = {
  timers: StepTimer[];
  steps: CookingStep[];
  now: number;
  onJumpToStep: (stepIndex: number) => void;
  onPause: (stepIndex: number) => void;
  onResume: (stepIndex: number) => void;
  onStop: (stepIndex: number) => void;
};

const miniButton =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-300 text-sm transition-colors hover:bg-base-content/15";

/** Timer dock: one pill per timer. Finished timers turn green with 🔔. */
export default function ActiveTimers({ timers, steps, now, onJumpToStep, onPause, onResume, onStop }: ActiveTimersProps) {
  if (timers.length === 0) return null;

  return (
    <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Running timers">
      {timers.map((timer) => {
        const step = steps[timer.stepIndex];
        if (!step) return null;
        const label = `Step ${timer.stepIndex + 1} · ${step.title || "Timer"}`;

        if (timer.status === "completed") {
          return (
            <li
              key={timer.stepIndex}
              className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-accent pl-4 pr-1.5 text-sm text-accent-content"
            >
              <button type="button" onClick={() => onJumpToStep(timer.stepIndex)} className="max-w-56 truncate font-medium">
                🔔 {label} — done!
              </button>
              <button
                type="button"
                onClick={() => onStop(timer.stepIndex)}
                aria-label={`Dismiss timer for step ${timer.stepIndex + 1}`}
                className={`${miniButton} bg-base-100 text-base-content`}
              >
                ✕
              </button>
            </li>
          );
        }

        const running = timer.status === "running";
        return (
          <li
            key={timer.stepIndex}
            className="flex h-12 shrink-0 items-center gap-3 rounded-full border border-base-300 bg-base-200 pl-4 pr-1.5 text-sm"
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${running ? "bg-link motion-safe:animate-pulse" : "bg-base-content/30"}`}
            />
            <button type="button" onClick={() => onJumpToStep(timer.stepIndex)} className="max-w-48 truncate">
              {label}
            </button>
            <span className="font-mono text-base font-bold">{formatTimer(getRemainingSeconds(timer, now))}</span>
            <button
              type="button"
              onClick={() => (running ? onPause(timer.stepIndex) : onResume(timer.stepIndex))}
              aria-label={`${running ? "Pause" : "Resume"} timer for step ${timer.stepIndex + 1}`}
              className={miniButton}
            >
              {running ? "⏸" : "▶"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

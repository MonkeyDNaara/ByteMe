"use client";

import {
  formatTimer,
  getRemainingSeconds,
  type StepTimer,
} from "@/lib/cookingTimers";
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

export default function ActiveTimers({
  timers,
  steps,
  now,
  onJumpToStep,
  onPause,
  onResume,
  onStop,
}: ActiveTimersProps) {
  if (timers.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-primary bg-base-200/95 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
        {timers.map((timer) => {
          const step = steps[timer.stepIndex];
          if (!step) return null;

          const label = step.title
            ? `Step ${timer.stepIndex + 1} · ${step.title}`
            : `Step ${timer.stepIndex + 1}`;
          const remaining = getRemainingSeconds(timer, now);

          return (
            <div
              key={timer.stepIndex}
              className={`flex shrink-0 flex-col items-center gap-1.5 rounded-box border px-4 py-2 text-sm ${
                timer.status === "completed"
                  ? "border-primary bg-primary/10"
                  : "border-base-300 bg-base-200"
              }`}
            >
              <button
                type="button"
                onClick={() => onJumpToStep(timer.stepIndex)}
                className="flex flex-col items-center text-center"
              >
                <span className="text-xs text-base-content/60">{label}</span>
                <span className="pt-1 font-mono text-base font-semibold">
                  {timer.status === "completed" ? "Done" : formatTimer(remaining)}
                </span>
              </button>

              <div className="flex items-center gap-2">
                {timer.status === "completed" ? (
                  <button
                    type="button"
                    onClick={() => onStop(timer.stepIndex)}
                    aria-label={`Dismiss timer for step ${timer.stepIndex + 1}`}
                    className="btn btn-ghost btn-xs"
                  >
                    Dismiss
                  </button>
                ) : (
                  <>
                    {timer.status === "running" ? (
                      <button
                        type="button"
                        onClick={() => onPause(timer.stepIndex)}
                        aria-label={`Pause timer for step ${timer.stepIndex + 1}`}
                        className="btn btn-ghost btn-xs"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onResume(timer.stepIndex)}
                        aria-label={`Resume timer for step ${timer.stepIndex + 1}`}
                        className="btn btn-ghost btn-xs"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onStop(timer.stepIndex)}
                      aria-label={`Stop timer for step ${timer.stepIndex + 1}`}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      Stop
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

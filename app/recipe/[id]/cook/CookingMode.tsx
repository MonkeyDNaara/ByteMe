"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import BackButton from "@/app/components/BackButton";
import ActiveTimers from "@/app/recipe/[id]/cook/ActiveTimers";
import { formatTimer, getRemainingSeconds, useCookingTimers } from "@/lib/cookingTimers";
import { isOptimizableImageUrl, type Recipe } from "@/lib/recipe";

type CookingModeProps = {
  recipe: Recipe;
};

export default function CookingMode({ recipe }: CookingModeProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = recipe.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === recipe.steps.length - 1;

  const {
    timers,
    getTimer,
    now,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    clearAllTimers,
  } = useCookingTimers(recipe.id);

  const timer = getTimer(stepIndex);

  return (
    <div className="flex flex-col">
      <div className="sticky top-16 z-10 flex items-center justify-between border-b border-base-300 bg-base-100/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <BackButton fallbackHref={`/recipe/${recipe.id}`} />
        <span className="rounded-full bg-base-300 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          Cooking Mode
        </span>
      </div>

      <div
        className={`mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6 ${
          timers.length > 0 ? "pb-24" : ""
        }`}
      >
        <p className="text-sm font-medium text-base-content/60">{recipe.name}</p>

        <div className="relative h-64 w-full overflow-hidden rounded-box sm:h-80">
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            sizes="(min-width: 768px) 672px, 100vw"
            className="object-cover"
            unoptimized={!isOptimizableImageUrl(recipe.image_url)}
            priority
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Step {stepIndex + 1} of {recipe.steps.length}
          </h1>
          <div className="flex gap-1.5">
            {recipe.steps.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 w-8 rounded-full sm:w-10 ${
                  index === stepIndex ? "bg-primary" : "bg-base-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="card flex flex-col gap-4 bg-base-200 p-6 shadow-md sm:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
              {stepIndex + 1}
            </span>
            {step.title && (
              <span className="text-lg font-semibold">{step.title}</span>
            )}
          </div>

          <p className="text-lg leading-relaxed">{step.description}</p>

          {(step.ingredients || step.timeMinutes != null) && (
            <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
              {step.ingredients && (
                <span className="badge badge-outline gap-1.5 px-3 py-3">
                  🥣 {step.ingredients}
                </span>
              )}
              {step.timeMinutes != null && (
                <span className="badge badge-outline gap-1.5 px-3 py-3">
                  ⏱ {step.timeMinutes} min
                </span>
              )}
            </div>
          )}

          {step.timeMinutes != null && (
            <div className="flex w-fit max-w-full flex-col items-center gap-3 self-center rounded-box bg-base-100 p-4">
              {!timer && (
                <button
                  type="button"
                  onClick={() => startTimer(stepIndex, step.timeMinutes!)}
                  className="btn btn-primary btn-sm"
                >
                  Start Timer ({step.timeMinutes} min)
                </button>
              )}

              {timer && timer.status !== "completed" && (
                <>
                  <span className="font-mono text-2xl font-bold">
                    {formatTimer(getRemainingSeconds(timer, now))}
                  </span>
                  <div className="flex items-center gap-3">
                    {timer.status === "running" ? (
                      <button
                        type="button"
                        onClick={() => pauseTimer(stepIndex)}
                        className="btn btn-outline btn-sm"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => resumeTimer(stepIndex)}
                        className="btn btn-outline btn-sm"
                      >
                        Resume
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => stopTimer(stepIndex)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      Stop
                    </button>
                  </div>
                </>
              )}

              {timer && timer.status === "completed" && (
                <>
                  <span className="text-lg font-bold text-primary">Done!</span>
                  <button
                    type="button"
                    onClick={() => stopTimer(stepIndex)}
                    className="btn btn-ghost btn-sm"
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setStepIndex((current) => current - 1)}
            disabled={isFirst}
            className="btn btn-outline"
          >
            Previous
          </button>

          {isLast ? (
            <Link
              href={`/recipe/${recipe.id}`}
              onClick={clearAllTimers}
              className="btn btn-primary"
            >
              Finish
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setStepIndex((current) => current + 1)}
              className="btn btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <ActiveTimers
        timers={timers}
        steps={recipe.steps}
        now={now}
        onJumpToStep={setStepIndex}
        onPause={pauseTimer}
        onResume={resumeTimer}
        onStop={stopTimer}
      />
    </div>
  );
}

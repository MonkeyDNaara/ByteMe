"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useCookingTimers } from "@/lib/cookingTimers";
import { isOptimizableImageUrl, type Recipe } from "@/lib/recipe";

import ActiveTimers from "./ActiveTimers";
import FinishScreen from "./FinishScreen";
import LeaveDialog from "./LeaveDialog";
import StepProgress from "./StepProgress";
import TimerCard from "./TimerCard";

type CookingModeProps = {
  recipe: Recipe;
};

type LeaveTarget = {
  href: string;
  /** "hard" = full page load. Needed for /recipe/[id]: a soft navigation there
      would be intercepted and open the recipe as a modal over cooking mode. */
  mode: "hard" | "soft";
};

/** Keys inside these elements belong to them (e.g. Space presses a focused button). */
function isInteractive(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest("button, a, input, textarea, select, [contenteditable]") !== null;
}

/** "2 tbsp olive oil, 3 cloves garlic" -> chips */
function splitIngredients(text: string): string[] {
  return text
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function CookingMode({ recipe }: CookingModeProps) {
  const router = useRouter();
  const steps = recipe.steps;
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [pendingLeave, setPendingLeave] = useState<LeaveTarget | null>(null);
  const [leavingTo, setLeavingTo] = useState<LeaveTarget | null>(null);

  const { timers, getTimer, now, startTimer, pauseTimer, resumeTimer, stopTimer, clearAllTimers } =
    useCookingTimers(recipe.id);

  const step = steps[stepIndex];
  const nextStep = steps[stepIndex + 1];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const timer = getTimer(stepIndex);
  const activeTimerCount = timers.filter((t) => t.status === "running" || t.status === "paused").length;

  const goTo = (index: number) => {
    setFinished(false);
    setStepIndex(Math.min(Math.max(index, 0), steps.length - 1));
  };
  const goNext = () => (isLast ? setFinished(true) : goTo(stepIndex + 1));
  const goPrev = () => (finished ? setFinished(false) : goTo(stepIndex - 1));

  // --- Leaving cooking mode -------------------------------------------------
  // Leaving stops all timers. If some are still running, ask first.
  const requestLeave = (target: LeaveTarget) => {
    if (activeTimerCount > 0) setPendingLeave(target);
    else confirmLeave(target);
  };

  const confirmLeave = (target: LeaveTarget) => {
    setPendingLeave(null);
    clearAllTimers();
    setLeavingTo(target);
  };

  // Navigate only AFTER the cleared timers were saved: the timer hook's own
  // save effect runs before this one in the same commit (effects run in the
  // order they're declared), so the next page load doesn't restore them.
  useEffect(() => {
    if (!leavingTo || timers.length > 0) return;
    if (leavingTo.mode === "hard") window.location.assign(leavingTo.href);
    else router.push(leavingTo.href);
  }, [leavingTo, timers.length, router]);

  // --- Keyboard shortcuts: ← / → change steps, Space starts/pauses the timer --
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || pendingLeave) return;
      if (isInteractive(event.target)) return;

      if (event.key === "ArrowRight" && !finished) {
        event.preventDefault();
        goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === " " && !finished && step.timeMinutes) {
        event.preventDefault(); // otherwise Space scrolls the page
        if (!timer) startTimer(stepIndex, step.timeMinutes);
        else if (timer.status === "running") pauseTimer(stepIndex);
        else if (timer.status === "paused") resumeTimer(stepIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });
  // ^ No dependency array on purpose: the handler reads the latest state on
  //   every render, and re-attaching one listener is cheap.

  const recipeHref = `/recipe/${recipe.id}`;
  const ingredientChips = splitIngredients(step.ingredients);

  const dock = (
    <ActiveTimers
      timers={timers}
      steps={steps}
      now={now}
      onJumpToStep={goTo}
      onPause={pauseTimer}
      onResume={resumeTimer}
      onStop={stopTimer}
    />
  );

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-base-300 px-4 sm:h-[72px] sm:gap-4 sm:px-8">
        <button
          type="button"
          onClick={() => requestLeave({ href: recipeHref, mode: "hard" })}
          aria-label="Exit cooking mode"
          className="btn h-11 min-h-11 rounded-full border-none bg-base-300 px-4 font-semibold"
        >
          ✕<span className="max-sm:sr-only"> Exit</span>
        </button>
        <span className="relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-xl sm:block">
          <Image
            src={recipe.image_url}
            alt=""
            fill
            sizes="44px"
            className="object-cover"
            unoptimized={!isOptimizableImageUrl(recipe.image_url)}
          />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="hidden text-xs font-bold uppercase tracking-wider text-link sm:block">👩‍🍳 Cooking mode</span>
          <span className="truncate font-bold sm:text-[17px]">{recipe.name}</span>
        </div>
        <span className="text-sm font-bold text-link sm:hidden">
          {finished ? "✓" : `${stepIndex + 1}/${steps.length}`}
        </span>
      </header>

      <StepProgress steps={steps} current={stepIndex} finished={finished} onSelect={goTo} />

      {finished ? (
        <>
          <FinishScreen
            recipe={recipe}
            onBackToSteps={() => setFinished(false)}
            onBackToRecipe={() => requestLeave({ href: recipeHref, mode: "hard" })}
            onSurprise={() => requestLeave({ href: "/random", mode: "soft" })}
          />
          {timers.length > 0 && <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-8">{dock}</div>}
        </>
      ) : (
        <>
          {/* Step + timer. pb-44 on phones leaves room for the fixed bottom bar. */}
          <main className="mx-auto grid w-full max-w-6xl flex-1 content-start gap-6 px-4 pt-6 pb-44 sm:px-8 sm:pt-9 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-8 lg:pb-6">
            <section className="flex flex-col gap-4 sm:gap-6" aria-live="polite">
              <span className="font-bold text-link">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                {step.title || `Step ${stepIndex + 1}`}
              </h1>
              <p className="text-xl leading-normal sm:text-[26px]">{step.description}</p>

              {ingredientChips.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">
                    You need for this step
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    {ingredientChips.map((chip) => (
                      <li
                        key={chip}
                        className="flex h-10 items-center rounded-full border border-base-300 bg-base-200 px-4 sm:text-base"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <aside className="flex flex-col gap-4">
              {step.timeMinutes ? (
                <TimerCard
                  minutes={step.timeMinutes}
                  timer={timer}
                  now={now}
                  onStart={() => startTimer(stepIndex, step.timeMinutes!)}
                  onPause={() => pauseTimer(stepIndex)}
                  onResume={() => resumeTimer(stepIndex)}
                  onStop={() => stopTimer(stepIndex)}
                />
              ) : null}

              {nextStep && (
                <div className="hidden flex-col gap-1 rounded-box bg-base-300 px-5 py-4 lg:flex">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">Up next</span>
                  <span className="font-bold">
                    {stepIndex + 2} · {nextStep.title || `Step ${stepIndex + 2}`}
                    {nextStep.timeMinutes ? (
                      <span className="font-medium text-base-content/60"> · ⏱ {nextStep.timeMinutes} min</span>
                    ) : null}
                  </span>
                </div>
              )}

              <p className="hidden text-xs text-base-content/50 lg:block">
                Tip: <kbd className="kbd kbd-xs">←</kbd> <kbd className="kbd kbd-xs">→</kbd> change steps,{" "}
                <kbd className="kbd kbd-xs">Space</kbd> starts or pauses the timer.
              </p>
            </aside>
          </main>

          {/* Dock + Prev/Next. Phone: pinned to the bottom. Desktop: in the flow. */}
          <div className="fixed inset-x-0 bottom-0 z-30 flex flex-col gap-3 border-t border-base-300 bg-base-200/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:mx-auto lg:w-full lg:max-w-6xl lg:border-none lg:bg-transparent lg:px-8 lg:pt-0 lg:pb-7 lg:backdrop-blur-none">
            {dock}
            <div className="flex gap-3 lg:gap-4">
              <button
                type="button"
                onClick={goPrev}
                disabled={isFirst}
                aria-label="Previous step"
                className="btn h-15 w-16 rounded-full border-primary bg-base-100 text-lg font-bold lg:h-16 lg:w-auto lg:flex-1"
              >
                ←<span className="max-lg:sr-only"> Previous</span>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="btn btn-primary h-15 min-w-0 flex-1 rounded-full text-base font-bold lg:h-16 lg:flex-[2] lg:text-lg"
              >
                <span className="truncate">
                  {isLast ? "Finish 🎉" : `Next: ${nextStep.title || `Step ${stepIndex + 2}`}`}
                </span>
                {!isLast && <span aria-hidden="true">→</span>}
              </button>
            </div>
          </div>
        </>
      )}

      <LeaveDialog
        open={pendingLeave !== null}
        activeTimerCount={activeTimerCount}
        onStay={() => setPendingLeave(null)}
        onLeave={() => pendingLeave && confirmLeave(pendingLeave)}
      />
    </div>
  );
}

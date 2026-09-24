"use client";

import Link from "next/link";
import { useState } from "react";

import type { Recipe } from "@/lib/recipe";

type CookingModeProps = {
  recipe: Recipe;
};

export default function CookingMode({ recipe }: CookingModeProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = recipe.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === recipe.steps.length - 1;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-base-content/60">{recipe.name}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Step {stepIndex + 1} of {recipe.steps.length}
        </h1>
      </header>

      <div className="card flex flex-col gap-4 bg-base-200 p-6 shadow-md sm:p-8">
        <p className="text-lg leading-relaxed">{step.description}</p>

        {(step.ingredients || step.timeMinutes != null) && (
          <div className="flex flex-wrap gap-4 text-sm text-base-content/70">
            {step.ingredients && <span>🥣 {step.ingredients}</span>}
            {step.timeMinutes != null && <span>⏱ {step.timeMinutes} min</span>}
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
          <Link href={`/recipe/${recipe.id}`} className="btn btn-primary">
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
  );
}

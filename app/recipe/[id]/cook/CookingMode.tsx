"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import BackButton from "@/app/components/BackButton";
import { isOptimizableImageUrl, type Recipe } from "@/lib/recipe";

type CookingModeProps = {
  recipe: Recipe;
};

export default function CookingMode({ recipe }: CookingModeProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = recipe.steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === recipe.steps.length - 1;

  return (
    <div className="flex flex-col">
      <div className="sticky top-16 z-10 flex items-center justify-between border-b border-base-300 bg-base-100/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <BackButton fallbackHref={`/recipe/${recipe.id}`} />
        <span className="rounded-full bg-base-300 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
          Cooking Mode
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
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
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">
            {stepIndex + 1}
          </span>

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
    </div>
  );
}

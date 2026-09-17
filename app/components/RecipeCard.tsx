"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import FavoriteButton from "@/app/components/FavoriteButton";
import {
  formatLabel,
  isOptimizableImageUrl,
  type MealType,
  type Recipe,
} from "@/lib/recipe";

// Theme-aware badge colour per meal: green / yellow / red.
const mealBadge: Record<MealType, string> = {
  Breakfast: "badge-success",
  Lunch: "badge-warning",
  Dinner: "badge-error",
};

type RecipeCardProps = {
  recipe: Recipe;
  /** Optional meal badge shown on the image (used on the "recipes of the day" section). */
  meal?: MealType;
  /** When set, the card image + body link to this path. */
  href?: string;
};

export default function RecipeCard({ meal, recipe, href }: RecipeCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    window.history.pushState(
      {
        ...window.history.state,
        recipeModal: recipe.id,
      },
      "",
      href ?? window.location.href,
    );

    setIsOpen(true);
  };

  const closeModal = () => {
    window.history.back();
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setIsOpen(event.state?.recipeModal === recipe.id);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [recipe.id]);

  const content = (
    <>
      <figure className="relative h-48 overflow-hidden">
        <Image
          src={recipe.image_url}
          alt={recipe.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          unoptimized={!isOptimizableImageUrl(recipe.image_url)}
        />

        {meal && (
          <span
            className={`badge ${mealBadge[meal]} absolute left-3 top-3 font-medium`}
          >
            {meal}
          </span>
        )}
      </figure>

      <div className="card-body gap-3">
        <h4 className="card-title text-lg">{recipe.name}</h4>

        <p className="text-sm text-base-content/70">{recipe.snippet}</p>

        {recipe.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.categories.map((category) => (
              <span key={category} className="badge badge-outline badge-sm">
                {formatLabel(category)}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions mt-1 items-center justify-between text-sm text-base-content/70">
          <span>⏱ {recipe.time} min</span>
          <span>❤ {recipe.likes}</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <article
        className="group card relative overflow-hidden bg-base-200 shadow-md transition-shadow duration-300 hover:shadow-xl"
        onClick={openModal}
      >
        <div onClick={(event) => event.stopPropagation()}>
          <FavoriteButton
            recipeId={String(recipe.id)}
            className="absolute right-3 top-3 z-10"
          />
        </div>

        {content}
      </article>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-base-100 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-circle btn-sm absolute right-4 top-4 z-20"
              aria-label="Close recipe"
            >
              ✕
            </button>

            <div className="flex flex-col gap-8 p-6 sm:p-8">
              <div className="relative h-64 overflow-hidden rounded-box sm:h-80">
                <Image
                  src={recipe.image_url}
                  alt={recipe.name}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover"
                  unoptimized={!isOptimizableImageUrl(recipe.image_url)}
                />
              </div>

              <header className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {recipe.name}
                  </h1>

                  <FavoriteButton recipeId={String(recipe.id)} size="md" />
                </div>

                <p className="text-base-content/80">{recipe.snippet}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                  <span>⏱ {recipe.time} min</span>
                  <span>❤ {recipe.likes} likes</span>
                </div>

                {recipe.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.categories.map((category) => (
                      <span
                        key={category}
                        className="badge badge-outline badge-sm"
                      >
                        {formatLabel(category)}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <section className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Ingredients</h2>

                <ul className="list-inside list-disc space-y-1 text-base-content/80">
                  {recipe.ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Method</h2>

                <p className="leading-relaxed text-base-content/80">
                  {recipe.description}
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import FavoriteButton from "@/app/components/FavoriteButton";
import {
  DIFFICULTY_EMOJI,
  formatLabel,
  getDifficultyLabel,
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
  /** When set, opening the modal also pushes this path into the URL. */
  href?: string;
};

export default function RecipeCard({ meal, recipe, href }: RecipeCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Optimistic local count so the card/modal update immediately when the
  // favourite button is pressed, instead of only reflecting the DB's real
  // value on the next full render. The actual write is still best-effort
  // (see FavoriteButton/setRecipeLiked) -- this just mirrors it visually.
  const [likes, setLikes] = useState(recipe.likes);

  const handleFavoriteToggle = (isFavorite: boolean) => {
    setLikes((current) => Math.max(current + (isFavorite ? 1 : -1), 0));
  };

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

        {meal && <span className={`badge ${mealBadge[meal]} absolute left-3 top-3 font-medium`}>{meal}</span>}
      </figure>

      <div className="card-body flex-1 gap-3">
        <h4 className="card-title line-clamp-1 text-lg">{recipe.name}</h4>
        <p className="line-clamp-2 text-sm text-base-content/70">
          {recipe.snippet}
        </p>

        {/* Reserves one badge row's height even with zero/few categories, so
            this section is a similar size across cards instead of collapsing
            and leaving a big gap for mt-auto (below) to paper over. */}
        <div className="flex min-h-7 flex-wrap gap-1.5">
          {recipe.categories.map((category, index) => (
            <span
              key={`${category}-${index}`}
              className="badge badge-outline badge-sm"
            >
              {formatLabel(category)}
            </span>
          ))}
        </div>

        {/* Reserved height (like the labels row above) even when there's no
            rating yet, so an unrated recipe's card doesn't sit at a
            different height than a rated one in the same grid row. */}
        <div className="flex min-h-6 items-center gap-0.5">
          {/* `!= null` on purpose: some pages pass a raw DB row here whose
              `difficulty` is `undefined` (column missing) rather than a real
              `null` -- both mean "unrated". */}
          {recipe.difficulty != null &&
            Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={index < recipe.difficulty! ? "" : "opacity-25"}
              >
                {DIFFICULTY_EMOJI}
              </span>
            ))}
        </div>

        {/* mt-auto is now just a safety net -- title/snippet/labels above are
            reserved to consistent heights, so it rarely has much space left
            to absorb, unlike before when it alone had to bridge cards of
            very different content lengths. */}
        <div className="card-actions mt-auto items-center justify-between text-sm text-base-content/70">
          <span>⏱ {recipe.time} min</span>
          <span>❤ {likes}</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      <article
        className="group card relative cursor-pointer overflow-hidden border border-primary/20 bg-base-200 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        onClick={openModal}
      >
        <div onClick={(event) => event.stopPropagation()}>
          <FavoriteButton
            recipeId={String(recipe.id)}
            className="absolute right-3 top-3 z-10"
            onToggle={handleFavoriteToggle}
          />
        </div>

        {content}
      </article>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-primary/20 bg-base-200 shadow-2xl"
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
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{recipe.name}</h1>

                  <FavoriteButton
                    recipeId={String(recipe.id)}
                    size="md"
                    onToggle={handleFavoriteToggle}
                  />
                </div>

                <p className="text-base-content/80">{recipe.snippet}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                  <span>⏱ {recipe.time} min</span>
                  <span>❤ {likes} likes</span>
                </div>

                {recipe.difficulty != null && (
                  <div className="flex items-center gap-2 text-sm text-base-content/70">
                    <span>
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={index}
                          className={
                            index < recipe.difficulty! ? "" : "opacity-25"
                          }
                        >
                          {DIFFICULTY_EMOJI}
                        </span>
                      ))}
                    </span>
                    <span>{getDifficultyLabel(recipe.difficulty)}</span>
                  </div>
                )}

                {recipe.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.categories.map((category, index) => (
                      <span
                        key={`${category}-${index}`}
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
                  {recipe.ingredients.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Method</h2>

                <p className="leading-relaxed text-base-content/80">{recipe.description}</p>
              </section>

              <div className="flex justify-center">
                <a
                  href="https://leetcode.com/problemset/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Start cooking (for real software developer)
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

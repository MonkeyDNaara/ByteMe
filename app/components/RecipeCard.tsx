"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DeleteRecipeButton from "@/app/components/DeleteRecipeButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import ShoppingListButton from "@/app/components/ShoppingListButton";
import { authClient } from "@/lib/auth/client";
import {
  DIFFICULTY_EMOJI,
  formatLabel,
  getDifficultyLabel,
  isOptimizableImageUrl,
  isRecipeOwner,
  type MealType,
  type Recipe,
} from "@/lib/recipe";

// Theme-aware badge colour per meal: green / yellow / red.
const mealBadge: Record<MealType, string> = {
  Breakfast: "badge-success",
  Lunch: "badge-warning",
  Dinner: "badge-error",
};

const MAX_VISIBLE_TAGS = 3;

type RecipeCardProps = {
  recipe: Recipe;
  /** Optional meal badge shown on the image (used on the "recipes of the day" section). */
  meal?: MealType;
  /** When set, opening the modal also pushes this path into the URL. */
  href?: string;
  /** Lowercase labels to show first and highlight, e.g. the active filters. */
  highlightTags?: string[];
};

export default function RecipeCard({ meal, recipe, href, highlightTags = [] }: RecipeCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const isOwner = isRecipeOwner(recipe, session?.user?.id);
  // Optimistic local count so the card/modal update immediately when the
  // favourite button is pressed, instead of only reflecting the DB's real
  // value on the next full render. The actual write is still best-effort
  // (see FavoriteButton/lib/useFavorites.ts's setFavorite) -- this just
  // mirrors it visually; the real count is derived from the favorites table.
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

  // Matching (filtered) labels first, so they never hide behind "+N".
  const isHighlighted = (category: string) => highlightTags.includes(category.toLowerCase());
  const orderedTags = [
    ...recipe.categories.filter(isHighlighted),
    ...recipe.categories.filter((category) => !isHighlighted(category)),
  ];
  const visibleTags = orderedTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTagCount = orderedTags.length - visibleTags.length;
  const difficultyLabel = getDifficultyLabel(recipe.difficulty ?? null);

  const content = (
    <>
      <figure className="relative h-[196px] shrink-0 overflow-hidden">
        <Image
          src={recipe.image_url}
          alt={recipe.name}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          unoptimized={!isOptimizableImageUrl(recipe.image_url)}
        />

        {meal && <span className={`badge ${mealBadge[meal]} absolute left-3 top-3 font-medium`}>{meal}</span>}
      </figure>

      <div className="card-body flex-1 gap-3 p-5">
        <h3 className="line-clamp-1 text-lg font-semibold">{recipe.name}</h3>
        <p className="line-clamp-2 min-h-10 text-sm text-base-content/70">{recipe.snippet}</p>

        {/* Max. 3 tags + a dashed "+N" tag, so every card keeps one tag row.
            min-h reserves the row even for recipes without tags. */}
        <div className="flex min-h-6 flex-wrap gap-1.5">
          {visibleTags.map((category, index) => (
            <span
              key={`${category}-${index}`}
              className={`badge badge-sm ${
                isHighlighted(category) ? "border-primary bg-primary/25 font-medium" : "badge-outline border-base-300"
              }`}
            >
              {formatLabel(category)}
            </span>
          ))}
          {hiddenTagCount > 0 && (
            <span
              className="badge badge-sm border-dashed border-base-content/30 bg-transparent text-base-content/60"
              title={orderedTags.slice(MAX_VISIBLE_TAGS).map(formatLabel).join(", ")}
            >
              +{hiddenTagCount}
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-1.5 border-t border-base-300 pt-3 text-sm text-base-content/70">
          {/* Line 1: difficulty. whitespace-nowrap + truncate = never wraps,
              a very long label gets "…" instead of breaking the line.
              `!= null` on purpose: some pages pass a raw DB row whose
              `difficulty` is `undefined` rather than `null` -- both mean "unrated". */}
          <div className="flex min-h-6 items-center gap-2 whitespace-nowrap">
            {recipe.difficulty != null ? (
              <>
                <span aria-hidden="true" className="shrink-0 tracking-tighter">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} className={index < recipe.difficulty! ? "" : "opacity-25"}>
                      {DIFFICULTY_EMOJI}
                    </span>
                  ))}
                </span>
                <span className="truncate font-medium text-base-content">{difficultyLabel}</span>
                <span className="sr-only">Difficulty {recipe.difficulty} of 5</span>
              </>
            ) : (
              <span className="text-base-content/50">No difficulty yet</span>
            )}
          </div>

          {/* Line 2: time left, likes right */}
          <div className="flex items-center justify-between">
            <span>⏱ {recipe.time} min</span>
            <span>
              ❤️ {likes}
              <span className="sr-only"> likes</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <article
        className="group card relative cursor-pointer overflow-hidden border border-base-300 bg-base-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        onClick={openModal}
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className="absolute right-3 top-3 z-10 flex gap-2"
        >
          <ShoppingListButton recipeId={String(recipe.id)} />
          <FavoriteButton
            recipeId={String(recipe.id)}
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

                  <div className="flex items-center gap-2">
                    <ShoppingListButton recipeId={String(recipe.id)} size="md" />
                    <FavoriteButton
                      recipeId={String(recipe.id)}
                      size="md"
                      onToggle={handleFavoriteToggle}
                    />
                  </div>
                </div>

                <p className="text-base-content/80">{recipe.snippet}</p>

                {recipe.author_name && (
                  <p className="text-sm text-base-content/60">
                    by {recipe.author_name}
                  </p>
                )}

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

                {isOwner && (
                  <div className="flex gap-2">
                    <Link
                      href={`/recipe/${recipe.id}/edit`}
                      className="btn btn-outline btn-sm"
                    >
                      Edit
                    </Link>
                    <DeleteRecipeButton
                      recipeId={Number(recipe.id)}
                      onDeleted={() => {
                        closeModal();
                        router.refresh();
                      }}
                    />
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

              {recipe.steps.length > 0 && (
                <div className="flex justify-center">
                  <Link
                    href={`/recipe/${recipe.id}/cook`}
                    className="btn btn-primary"
                  >
                    Start cooking
                  </Link>
                </div>
              )}

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

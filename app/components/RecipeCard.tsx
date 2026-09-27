"use client";

import { useState } from "react";
import Link from "next/link";

import FavoriteButton from "@/app/components/FavoriteButton";
import { mealBadge } from "@/app/components/mealBadge";
import RecipeImage from "@/app/components/RecipeImage";
import ShoppingListButton from "@/app/components/ShoppingListButton";
import {
  DIFFICULTY_EMOJI,
  formatLabel,
  getDifficultyLabel,
  type MealType,
  type Recipe,
} from "@/lib/recipe";


const MAX_VISIBLE_TAGS = 3;

type RecipeCardProps = {
  recipe: Recipe;
  /** Optional meal badge shown on the image (used on the "recipes of the day" section). */
  meal?: MealType;
  /** Lowercase labels to show first and highlight, e.g. the active filters. */
  highlightTags?: string[];
  /** Live preview in the recipe form: no link, no ♡/🛒, placeholder without a photo. */
  preview?: boolean;
};

/**
 * A plain link to /recipe/[id]. Inside the app, Next.js intercepts that
 * navigation and shows the recipe as a modal over the current page (see
 * app/@modal/(.)recipe/[id]); a reload or shared link shows the full page.
 */
export default function RecipeCard({ meal, recipe, highlightTags = [], preview = false }: RecipeCardProps) {
  // Optimistic local count so the card updates immediately when the
  // favourite button is pressed. The real count comes from the favorites table.
  const [likes, setLikes] = useState(recipe.likes);

  const handleFavoriteToggle = (isFavorite: boolean) => {
    setLikes((current) => Math.max(current + (isFavorite ? 1 : -1), 0));
  };

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
        {/* In the form preview, an empty photo means "not added yet" -> 📷.
            Everywhere else RecipeImage shows the meal-type fallback. */}
        {preview && !recipe.image_url ? (
          <div className="flex h-full items-center justify-center bg-base-300 text-4xl" aria-hidden="true">
            📷
          </div>
        ) : (
          <RecipeImage
            src={recipe.image_url}
            alt={recipe.name}
            categories={recipe.categories}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:scale-[1.03]"
            emojiClassName="text-6xl"
          />
        )}

        {meal && <span className={`badge ${mealBadge[meal]} absolute left-3 top-3 font-medium`}>{meal}</span>}
      </figure>

      <div className="card-body flex-1 gap-3 p-5">
        {/* "Stretched link": the link's ::after covers the whole card, so the
            entire card is clickable while the link text stays the title
            (good for screen readers, and no <button> nested in an <a>). */}
        <h3 className="line-clamp-1 text-lg font-semibold">
          {preview ? (
            recipe.name
          ) : (
            <Link
              href={`/recipe/${recipe.id}`}
              className="after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:outline-none"
            >
              {recipe.name}
            </Link>
          )}
        </h3>
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
              className="badge badge-sm border-dashed border-base-content/30 bg-transparent text-base-content/70"
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
              <span className="text-base-content/70">No difficulty yet</span>
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
    <article className="group card relative overflow-hidden border border-base-300 bg-base-200 shadow-sm transition-all duration-300 hover:shadow-lg motion-safe:hover:-translate-y-0.5 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary">
      {/* z-10 puts the buttons above the stretched link, so they stay clickable. */}
      {!preview && (
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <ShoppingListButton recipeId={String(recipe.id)} />
          <FavoriteButton recipeId={String(recipe.id)} onToggle={handleFavoriteToggle} />
        </div>
      )}

      {content}
    </article>
  );
}

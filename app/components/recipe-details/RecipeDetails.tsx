import Image from "next/image";
import Link from "next/link";

import DeleteRecipeButton from "@/app/components/DeleteRecipeButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import { mealBadge } from "@/app/components/mealBadge";
import ShoppingListButton from "@/app/components/ShoppingListButton";
import { formatLabel, getDifficultyLabel, isOptimizableImageUrl, MEALS, type MealType } from "@/lib/recipe";

import CloseModalButton from "./CloseModalButton";
import DifficultyPots from "./DifficultyPots";
import IngredientList from "./IngredientList";
import LikesCount from "./LikesCount";
import type { RecipeDetailsData } from "./loadRecipeDetails";
import RecipeBodyTabs from "./RecipeBodyTabs";
import StatTiles from "./StatTiles";
import StepList from "./StepList";

type RecipeDetailsProps = RecipeDetailsData & {
  /** "page" = /recipe/[id] (full page), "modal" = intercepted route over a list. */
  variant: "page" | "modal";
};

/**
 * ALL recipe detail markup lives here -- the full page and the modal only
 * choose a variant, so there's no duplicated markup to keep in sync.
 */
export default function RecipeDetails(props: RecipeDetailsProps) {
  return props.variant === "modal" ? <ModalVariant {...props} /> : <PageVariant {...props} />;
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function getMeal(categories: string[]): MealType | undefined {
  const lower = categories.map((category) => category.toLowerCase());
  return MEALS.find((meal) => lower.includes(meal.toLowerCase()));
}

function Badges({ categories, meal }: { categories: string[]; meal?: MealType }) {
  const others = categories.filter((category) => category.toLowerCase() !== meal?.toLowerCase());
  return (
    <div className="flex flex-wrap gap-2">
      {meal && <span className={`badge ${mealBadge[meal]} font-semibold`}>{meal}</span>}
      {others.map((category, index) => (
        <span key={`${category}-${index}`} className="badge badge-outline border-base-300">
          {formatLabel(category)}
        </span>
      ))}
    </div>
  );
}

function stepSummary(steps: RecipeDetailsData["recipe"]["steps"]): string {
  const timers = steps.filter((step) => step.timeMinutes).length;
  return `${steps.length} ${steps.length === 1 ? "step" : "steps"} · ⏱ ${timers} ${timers === 1 ? "timer" : "timers"}`;
}

const startCookingClass = "btn btn-primary h-12 gap-2 rounded-full px-6 text-base font-bold";

// ---------------------------------------------------------------------------
// Full page
// ---------------------------------------------------------------------------

function PageVariant({ recipe, isOwner, initiallyFavorite }: RecipeDetailsProps) {
  const meal = getMeal(recipe.categories);
  const hasSteps = recipe.steps.length > 0;
  const cookHref = `/recipe/${recipe.id}/cook`;

  const about = recipe.description && (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold sm:text-2xl">📝 About this dish</h2>
      <p className="leading-relaxed text-base-content/80">{recipe.description}</p>
    </section>
  );

  return (
    // pb-28 on phones leaves room for the fixed bottom bar.
    <article className="mx-auto flex max-w-6xl flex-col pb-28 lg:gap-10 lg:px-6 lg:py-8 lg:pb-20">
      {/* Breadcrumb replaces the old back button: a "back" button breaks when
          the page is opened from a shared link (there's nothing to go back to). */}
      <nav aria-label="Breadcrumb" className="hidden text-sm text-base-content/60 lg:block">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/all-recipes" className="font-semibold text-link hover:underline">
              ← All recipes
            </Link>
          </li>
          {meal && (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/all-recipes?label=${meal.toLowerCase()}`} className="hover:text-link hover:underline">
                  {meal}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-base-content">
            {recipe.name}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <div className="relative h-[280px] overflow-hidden sm:h-[380px] lg:h-[460px] lg:rounded-[2rem]">
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            priority
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover"
            unoptimized={!isOptimizableImageUrl(recipe.image_url)}
          />
          {/* Phone: back + favorite float on the photo */}
          <div className="absolute inset-x-4 top-4 flex justify-between lg:hidden">
            <Link
              href="/all-recipes"
              aria-label="Back to all recipes"
              className="btn btn-circle h-11 min-h-11 w-11 border-none bg-base-100/85 text-lg shadow-sm"
            >
              ←
            </Link>
            <FavoriteButton recipeId={recipe.id} size="md" />
          </div>
        </div>

        {/* Phone: this sheet overlaps the photo with rounded top corners */}
        <div className="relative -mt-6 flex flex-col gap-5 rounded-t-[2rem] bg-base-100 px-4 pt-6 sm:px-6 lg:mt-0 lg:rounded-none lg:bg-transparent lg:p-0">
          <Badges categories={recipe.categories} meal={meal} />

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
              {recipe.name}
            </h1>
            <FavoriteButton recipeId={recipe.id} size="md" className="mt-1 hidden shrink-0 lg:inline-flex" />
          </div>

          {recipe.snippet && <p className="text-lg leading-relaxed text-base-content/75">{recipe.snippet}</p>}

          {recipe.author_name && (
            <p className="flex items-center gap-2.5 text-sm text-base-content/70">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-bold text-accent-content"
              >
                {recipe.author_name.charAt(0).toUpperCase()}
              </span>
              <span>
                by <strong className="text-base-content">{recipe.author_name}</strong>
              </span>
            </p>
          )}

          <StatTiles recipe={recipe} initiallyFavorite={initiallyFavorite} />

          <div className="hidden flex-wrap items-center gap-3 lg:flex">
            {hasSteps && (
              <Link href={cookHref} className={startCookingClass}>
                🍳 Start cooking
              </Link>
            )}
            <ShoppingListButton recipeId={recipe.id} label="full" />
          </div>

          {isOwner && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-base-300 px-4 py-2.5 text-sm">
              <span className="flex-1 text-base-content/70">This is your recipe</span>
              <Link href={`/recipe/${recipe.id}/edit`} className="btn btn-ghost btn-sm rounded-full">
                ✏️ Edit
              </Link>
              <DeleteRecipeButton recipeId={Number(recipe.id)} redirectTo="/all-recipes" className="rounded-full" />
            </div>
          )}

          {/* Phone: "About" sits above the tabs */}
          <div className="lg:hidden">{about}</div>
        </div>
      </section>

      {/* Body: ingredients + steps (tabs on phones, side by side from lg) */}
      <div className="mt-8 px-4 sm:px-6 lg:mt-0 lg:px-0">
        <RecipeBodyTabs
          stepCount={recipe.steps.length}
          ingredients={
            <aside className="flex flex-col gap-2 rounded-box border border-base-300 bg-base-200 p-5 sm:p-6">
              <h2 className="text-xl font-bold sm:text-2xl">🥕 Ingredients</h2>
              <IngredientList ingredients={recipe.ingredientDetails} />
            </aside>
          }
          steps={
            hasSteps ? (
              <div className="flex flex-col gap-8">
                <div className="hidden lg:block">{about}</div>
                <section className="flex flex-col">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-xl font-bold sm:text-2xl">👣 Steps</h2>
                    <span className="text-sm text-base-content/60">{stepSummary(recipe.steps)}</span>
                  </div>
                  <StepList steps={recipe.steps} />
                </section>

                {/* Dark CTA band (bg-base-content flips correctly in dark mode) */}
                <div className="flex flex-col items-start gap-4 rounded-box bg-base-content p-6 text-base-100 sm:flex-row sm:items-center sm:gap-5">
                  <span aria-hidden="true" className="text-4xl">
                    👩‍🍳
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-lg font-bold">Ready? Let&apos;s cook step by step.</p>
                    <p className="text-sm opacity-80">Cooking mode shows one step at a time and runs the timers for you.</p>
                  </div>
                  <Link href={cookHref} className="btn btn-primary h-12 shrink-0 whitespace-nowrap rounded-full px-6 font-bold">
                    Start cooking →
                  </Link>
                </div>
              </div>
            ) : null
          }
        />
        {/* No steps: "About" still needs a place on desktop */}
        {!hasSteps && <div className="mt-8 hidden lg:block">{about}</div>}
      </div>

      {/* Phone: actions pinned to the bottom. `data-bottom-bar` lets toasts
          move up above it (see globals.css). */}
      <div
        data-bottom-bar
        className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-base-300 bg-base-200/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
      >
        <ShoppingListButton recipeId={recipe.id} size="md" className="h-14 w-14 border border-primary" />
        {hasSteps && (
          <Link href={cookHref} className="btn btn-primary h-14 flex-1 rounded-full text-base font-bold">
            🍳 Start cooking
          </Link>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Modal (intercepted route)
// ---------------------------------------------------------------------------

function ModalVariant({ recipe, isOwner, initiallyFavorite }: RecipeDetailsProps) {
  const meal = getMeal(recipe.categories);
  const hasSteps = recipe.steps.length > 0;
  const fullPageHref = `/recipe/${recipe.id}`;

  return (
    <>
      {/* Top bar */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-base-300 pl-6 pr-3">
        <span className="flex-1 truncate font-bold">{recipe.name}</span>
        {/* A plain <a>, NOT <Link>: a soft navigation to /recipe/[id] would be
            intercepted again and just show this modal. A full page load skips
            interception and renders the real page. */}
        <a href={fullPageHref} className="shrink-0 text-sm font-semibold text-link hover:underline">
          Open full page ↗
        </a>
        <CloseModalButton />
      </div>

      {/* Scrollable content */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
        <div className="relative h-[220px] shrink-0 overflow-hidden rounded-box sm:h-[260px]">
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            sizes="(min-width: 640px) 720px, 100vw"
            className="object-cover"
            unoptimized={!isOptimizableImageUrl(recipe.image_url)}
          />
        </div>

        <Badges categories={recipe.categories} meal={meal} />

        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{recipe.name}</h2>
            <FavoriteButton recipeId={recipe.id} size="md" className="shrink-0" />
          </div>
          <p className="text-base-content/70">
            {recipe.snippet}
            {recipe.author_name && (
              <>
                {" · by "}
                <strong className="text-base-content">{recipe.author_name}</strong>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-base-content/80">
          <span>⏱ {recipe.time} min</span>
          {recipe.difficulty != null && (
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <DifficultyPots level={recipe.difficulty} /> {getDifficultyLabel(recipe.difficulty)}
            </span>
          )}
          <span>
            ❤️ <LikesCount recipeId={recipe.id} likes={recipe.likes} initiallyFavorite={initiallyFavorite} />
          </span>
          <ShoppingListButton recipeId={recipe.id} label="short" className="ml-auto h-10 min-h-10" />
        </div>

        {isOwner && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-base-300 px-4 py-2.5 text-sm">
            <span className="flex-1 text-base-content/70">This is your recipe</span>
            <Link href={`/recipe/${recipe.id}/edit`} className="btn btn-ghost btn-sm rounded-full">
              ✏️ Edit
            </Link>
            <DeleteRecipeButton recipeId={Number(recipe.id)} redirectTo="/all-recipes" className="rounded-full" />
          </div>
        )}

        <section className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">🥕 Ingredients</h3>
          <IngredientList ingredients={recipe.ingredientDetails} twoColumns />
        </section>
      </div>

      {/* Sticky footer */}
      <div className="flex shrink-0 items-center gap-3 border-t border-base-300 bg-base-200 px-6 py-4">
        <span className="flex-1 text-sm text-base-content/70">
          {hasSteps ? stepSummary(recipe.steps) : "No cooking steps yet"}
        </span>
        {hasSteps && (
          <Link href={`/recipe/${recipe.id}/cook`} className={startCookingClass}>
            🍳 Start cooking
          </Link>
        )}
      </div>
    </>
  );
}

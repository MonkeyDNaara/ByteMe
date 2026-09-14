import z from "zod";

import {
  getRecipeById as dbGetRecipeById,
  getRecipes as dbGetRecipes,
} from "@/dbQueries";

export const Recipe = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  snippet: z.string(),
  time: z.number(),
  ingredients: z.array(z.string()),
  categories: z.array(z.string()),
  image_url: z.string().min(1),
  likes: z.number(),
});

export type Recipe = z.infer<typeof Recipe>;

export type MealType = "Breakfast" | "Lunch" | "Dinner";

export const MEALS: MealType[] = ["Breakfast", "Lunch", "Dinner"];

// `next/image` only optimizes hosts allowlisted in next.config.ts. Real
// recipes can point at any image host, so anything not on that allowlist is
// rendered unoptimized instead of crashing the page.
// TODO: once uploads land, images move to a host we control and this check
// (and the fallback) can go away.
const OPTIMIZABLE_IMAGE_HOSTS = new Set(["images.unsplash.com"]);

export function isOptimizableImageUrl(url: string): boolean {
  try {
    return OPTIMIZABLE_IMAGE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Capitalises a raw category/label for display (categories are stored lowercase, e.g. "breakfast"). */
export function formatLabel(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

// ---------------------------------------------------------------------------
// Data layer, backed by the Neon Postgres `recipes` table via dbQueries.ts.
// Raw rows use different field names (snippet, ingredients, categories,
// image_url, numeric id) than our `Recipe` shape in a few spots that were kept
// for the rest of the app; `mapRowToRecipe` bridges the two and validates
// every row, so one malformed row just gets skipped (with a warning) instead
// of crashing the page.
// ---------------------------------------------------------------------------

function mapRowToRecipe(row: Record<string, unknown>): Recipe | null {
  const result = Recipe.safeParse({
    id: String(row.id),
    name: row.name,
    description: row.description ?? "",
    snippet: row.snippet ?? "",
    time: row.time ?? 0,
    ingredients: row.ingredients ?? [],
    categories: row.categories ?? [],
    image_url: row.image_url ?? "",
    likes: row.likes ?? 0,
  });

  if (!result.success) {
    console.warn(
      `Skipping recipe row (id: ${String(row.id)}): ${result.error.message}`,
    );
    return null;
  }

  return result.data;
}

/** Returns every recipe. */
export async function getAllRecipes(): Promise<Recipe[]> {
  const rows = await dbGetRecipes();
  return rows
    .map((row) => mapRowToRecipe(row))
    .filter((recipe): recipe is Recipe => recipe !== null);
}

/** Returns a single recipe by id, or `null` if none matches. */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  const rows = await dbGetRecipeById(numericId);
  const row = rows[0];
  return row ? mapRowToRecipe(row) : null;
}

/**
 * Picks one recipe per meal (breakfast / lunch / dinner) at random from the
 * recipes whose `categories` include that meal (case-insensitive — categories
 * are stored lowercase). A meal with no matching recipe is skipped, and a
 * recipe is never reused across slots.
 *
 * TODO: this changes on every call; the plan is still to make it rotate once
 * per day instead (e.g. seed the pick with the current date).
 */
export async function getRecipesOfTheDay(): Promise<
  { meal: MealType; recipe: Recipe }[]
> {
  const recipes = await getAllRecipes();
  const used = new Set<string>();
  const picks: { meal: MealType; recipe: Recipe }[] = [];

  for (const meal of MEALS) {
    const mealLower = meal.toLowerCase();
    const candidates = recipes.filter(
      (recipe) =>
        !used.has(recipe.id) &&
        recipe.categories.some(
          (category) => category.toLowerCase() === mealLower,
        ),
    );
    if (candidates.length === 0) continue;

    const recipe = candidates[Math.floor(Math.random() * candidates.length)];
    used.add(recipe.id);
    picks.push({ meal, recipe });
  }

  return picks;
}

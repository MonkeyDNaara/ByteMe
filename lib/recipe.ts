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
 * A pick that's deterministic for a given (day, salt) pair: the same UTC
 * calendar day and the same salt always produce the same index into a list
 * of the given length, and it changes once the UTC day rolls over. Used
 * instead of `Math.random()` so "recipes of the day" is stable across
 * repeated calls on the same day without needing to cache anything -- the
 * page itself (see app/page.tsx) just needs to re-run this on a new request
 * after midnight for the change to show up.
 */
function dailyIndex(salt: string, length: number): number {
  const utcDayNumber = Math.floor(Date.now() / 86_400_000);
  const saltValue = salt
    .split("")
    .reduce((sum, char) => sum + char.codePointAt(0)!, 0);
  return (utcDayNumber + saltValue) % length;
}

/**
 * Picks one recipe per meal (breakfast / lunch / dinner) from the recipes
 * whose `categories` include that meal (case-insensitive -- categories are
 * stored lowercase), deterministically for the current UTC day (see
 * `dailyIndex`). A meal with no matching recipe is skipped, and a recipe is
 * never reused across slots.
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

    const recipe = candidates[dailyIndex(meal, candidates.length)];
    used.add(recipe.id);
    picks.push({ meal, recipe });
  }

  return picks;
}

// ---------------------------------------------------------------------------
// Filtering helpers for the /all-recipes page. Pure functions over an
// already-fetched recipe list — no DB access — so they can run entirely on
// the client alongside the filter UI's local state.
// ---------------------------------------------------------------------------

/**
 * Every distinct category across the given recipes, deduped case-insensitively
 * (categories are stored with inconsistent casing, e.g. "Sweet" vs "sweet")
 * and sorted alphabetically by its first-seen display form.
 */
export function getDistinctCategories(recipes: Recipe[]): string[] {
  const seen = new Map<string, string>();
  for (const recipe of recipes) {
    for (const category of recipe.categories) {
      const key = category.toLowerCase();
      if (!seen.has(key)) seen.set(key, category);
    }
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

export type TimeRange = { min: number; max: number };

/** Min/max `time` across the given recipes (both 0 if the list is empty). */
export function getTimeBounds(recipes: Recipe[]): TimeRange {
  if (recipes.length === 0) return { min: 0, max: 0 };
  const times = recipes.map((recipe) => recipe.time);
  return { min: Math.min(...times), max: Math.max(...times) };
}

/**
 * Filters recipes by category and time range. `categories` uses AND
 * semantics (case-insensitive): a recipe must include every selected
 * category, not just one. `timeRange` is inclusive.
 */
export function filterRecipes(
  recipes: Recipe[],
  { categories, timeRange }: { categories: string[]; timeRange: TimeRange },
): Recipe[] {
  const wanted = categories.map((category) => category.toLowerCase());

  return recipes.filter((recipe) => {
    const recipeCategories = recipe.categories.map((category) =>
      category.toLowerCase(),
    );
    const matchesCategories = wanted.every((category) =>
      recipeCategories.includes(category),
    );
    const matchesTime =
      recipe.time >= timeRange.min && recipe.time <= timeRange.max;
    return matchesCategories && matchesTime;
  });
}

// ---------------------------------------------------------------------------
// Category taxonomy, shared by the create-recipe form (which offers these as
// checkboxes) and the /all-recipes + /favorites "Labels" filter (which
// groups whatever categories actually exist in the DB using the same
// lookup). Keeping one source of truth means the two can't drift apart.
// ---------------------------------------------------------------------------

export type CategoryOption = { value: string; label: string };
export type CategoryGroup = { name: string; options: CategoryOption[] };

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    name: "Meal & Course Type",
    options: [
      { value: "breakfast", label: "Breakfast" },
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Dinner" },
      { value: "snack", label: "Snack" },
      { value: "dessert", label: "Dessert" },
      { value: "brunch", label: "Brunch" },
      { value: "soup", label: "Soup" },
      { value: "appetizer", label: "Appetizer" },
      { value: "salad", label: "Salad" },
    ],
  },
  {
    name: "Main Ingredient",
    options: [
      { value: "beef", label: "Beef" },
      { value: "fish", label: "Fish" },
      { value: "chicken", label: "Chicken" },
      { value: "pork", label: "Pork" },
      { value: "seafood", label: "Seafood" },
    ],
  },
  {
    name: "Diet & Nutrition",
    options: [
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "gluten-free", label: "Gluten-Free" },
      { value: "nut-free", label: "Nut-Free" },
      { value: "egg-free", label: "Egg-Free" },
      { value: "lactose intolerant", label: "Lactose Intolerant" },
      { value: "low carb", label: "Low Carb" },
      { value: "low fat", label: "Low Fat" },
      { value: "low calorie", label: "Low Calorie" },
      { value: "high fiber", label: "High Fiber" },
      { value: "high protein", label: "High Protein" },
      { value: "sugar-free", label: "Sugar-Free" },
    ],
  },
  {
    name: "Flavor",
    options: [
      { value: "sweet", label: "Sweet" },
      { value: "salty", label: "Salty" },
    ],
  },
  {
    name: "Cooking Method & Prep",
    options: [
      { value: "fast", label: "Fast" },
      { value: "takes time", label: "Takes Time" },
      { value: "baking", label: "Baking" },
      { value: "air fryer", label: "Air Fryer" },
      { value: "no-cook", label: "No-Cook" },
      { value: "no-bake", label: "No-Bake" },
      { value: "one-pot", label: "One-Pot" },
      { value: "meal prep", label: "Meal Prep" },
    ],
  },
];

/** The group that must have at least one selection when creating a recipe. */
export const REQUIRED_CATEGORY_GROUP = CATEGORY_GROUPS[0].name;

/** Bucket for any category that exists in the DB but isn't in the taxonomy above. */
export const OTHER_CATEGORY_GROUP = "Other";

const CATEGORY_TO_GROUP = new Map<string, string>(
  CATEGORY_GROUPS.flatMap((group) =>
    group.options.map(
      (option) => [option.value.toLowerCase(), group.name] as const,
    ),
  ),
);

/** Which taxonomy group a (possibly free-form) category belongs to; "Other" if unrecognized. */
export function getCategoryGroup(category: string): string {
  return (
    CATEGORY_TO_GROUP.get(category.toLowerCase()) ?? OTHER_CATEGORY_GROUP
  );
}

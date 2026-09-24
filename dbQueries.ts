"use server";

import z from "zod";
import { sql } from "./db";
import { auth } from "./lib/auth/server";
import { INGREDIENT_UNITS } from "./lib/ingredientUnits";

// Both ingredients and steps arrive from RecipeForm as one JSON-encoded
// string per repeated form field (rather than parallel arrays), since that
// keeps each item's fields together without relying on array-index
// alignment across separate form fields.
function parseJsonField(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

const ingredientInputSchema = z.object({
  name: z.string().trim().min(1, "Ingredient name is required"),
  amount: z.number().positive("Amount must be positive").nullable(),
  // "" means no unit; only a fixed unit or "" is accepted even though the
  // form's <select> already constrains this, as a defense-in-depth check.
  unit: z.enum(["", ...INGREDIENT_UNITS]),
});

// A step's `number` is never submitted -- it's assigned from the array's
// order at save time (see replaceSteps below), the same way an ingredient's
// position is just its position in the array, not a separate field.
const stepInputSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim().min(1, "Step description is required"),
  ingredients: z.string().trim(),
  timeMinutes: z.number().positive("Time must be positive").nullable(),
});

const recipeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  snippet: z.string().trim().min(1, "Snippet is required"),
  time: z.coerce.number().positive("Time must be positive"),
  ingredients: z.preprocess(
    (value) =>
      Array.isArray(value) ? value.map(parseJsonField) : value,
    z.array(ingredientInputSchema).min(1, "At least one ingredient is required"),
  ),
  // Cooking steps are entirely optional -- a recipe with zero steps is
  // valid, unlike ingredients which need at least one.
  steps: z.preprocess(
    (value) =>
      Array.isArray(value) ? value.map(parseJsonField) : value,
    z.array(stepInputSchema),
  ),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  image_url: z.string().url("Invalid image URL"),
  difficulty: z.coerce
    .number()
    .int()
    .min(1, "Difficulty is required")
    .max(5, "Difficulty is required"),
});

type RecipeInput = z.infer<typeof recipeSchema>;

export type Recipe = Omit<RecipeInput, "ingredients" | "steps"> & {
  id: number;
  likes: number;
  created_at: Date;
  user_id: string | null;
  author_name: string | null;
  // Raw JSON from the read queries' subqueries; parsed properly by
  // lib/recipe.ts's mapRowToRecipe, not consumed directly here.
  ingredient_details: unknown;
  step_details: unknown;
};

/**
 * Replaces every ingredient row for a recipe: delete-then-reinsert, rather
 * than diffing old vs. new, since a recipe's ingredient list is always
 * submitted as a whole (both create and edit send the full set).
 */
async function replaceIngredients(
  recipeId: number,
  ingredients: RecipeInput["ingredients"],
) {
  await sql`DELETE FROM recipe_ingredients WHERE recipe_id = ${recipeId}`;
  if (ingredients.length === 0) return;

  const names = ingredients.map((ingredient) => ingredient.name);
  const amounts = ingredients.map((ingredient) => ingredient.amount);
  const units = ingredients.map((ingredient) => ingredient.unit);

  await sql`
    INSERT INTO recipe_ingredients (recipe_id, name, amount, unit)
    SELECT ${recipeId}, ingredient.name, ingredient.amount, ingredient.unit
    FROM unnest(${names}::text[], ${amounts}::numeric[], ${units}::text[])
      AS ingredient(name, amount, unit)
  `;
}

/**
 * Replaces every cooking step for a recipe, the same delete-then-reinsert
 * approach as replaceIngredients. `step_number` is assigned here from each
 * step's position in the array (1-based), since the form never submits a
 * number -- reordering steps in the UI is just reordering this array.
 */
async function replaceSteps(recipeId: number, steps: RecipeInput["steps"]) {
  await sql`DELETE FROM recipe_steps WHERE recipe_id = ${recipeId}`;
  if (steps.length === 0) return;

  const stepNumbers = steps.map((_, index) => index + 1);
  const titles = steps.map((step) => step.title);
  const descriptions = steps.map((step) => step.description);
  const ingredientsNotes = steps.map((step) => step.ingredients);
  const timeMinutes = steps.map((step) => step.timeMinutes);

  await sql`
    INSERT INTO recipe_steps (recipe_id, step_number, title, description, ingredients, time_minutes)
    SELECT ${recipeId}, step.step_number, step.title, step.description, step.ingredients, step.time_minutes
    FROM unnest(${stepNumbers}::int[], ${titles}::text[], ${descriptions}::text[], ${ingredientsNotes}::text[], ${timeMinutes}::int[])
      AS step(step_number, title, description, ingredients, time_minutes)
  `;
}

export type RecipeState = {
  success: boolean;
  message?: string;
} | null;

// Every read that returns a `Recipe` joins in the author's display name from
// Neon Auth's own `user` table (left join, since `user_id` is nullable --
// recipes created before this feature, or via the seed script, have none),
// and computes `likes` and `ingredient_details` as scalar subqueries rather
// than joins. `favorites` and `recipe_ingredients` are both one-to-many
// against `recipes`; joining both of them directly in the same query would
// fan out into a cross product (a recipe with 3 ingredients and 2 favorites
// would produce 6 rows), corrupting the like count and duplicating
// ingredients. A scalar subquery per aggregate keeps each recipe to exactly
// one row. The column list is spelled out (instead of `recipes.*`) because a
// wildcard would collide with the `likes` alias, and is repeated per query
// rather than factored out, since this driver's `sql` tag runs a query
// immediately on use -- it isn't a composable fragment that can be
// interpolated into another query.
export const getRecipeById = async (id: number): Promise<Recipe[]> => {
  const result = await sql`
    SELECT
      recipes.id,
      recipes.name,
      recipes.description,
      recipes.snippet,
      recipes.time,
      recipes.categories,
      recipes.image_url,
      recipes.difficulty,
      recipes.user_id,
      recipes.created_at,
      author.name AS author_name,
      (SELECT COUNT(*)::int FROM favorites f WHERE f.recipe_id = recipes.id) AS likes,
      (
        SELECT COALESCE(json_agg(json_build_object('name', ri.name, 'amount', ri.amount, 'unit', ri.unit) ORDER BY ri.id), '[]'::json)
        FROM recipe_ingredients ri
        WHERE ri.recipe_id = recipes.id
      ) AS ingredient_details,
      (
        SELECT COALESCE(json_agg(json_build_object('title', rs.title, 'description', rs.description, 'ingredients', rs.ingredients, 'time_minutes', rs.time_minutes) ORDER BY rs.step_number), '[]'::json)
        FROM recipe_steps rs
        WHERE rs.recipe_id = recipes.id
      ) AS step_details
    FROM recipes
    LEFT JOIN neon_auth."user" AS author ON author.id = recipes.user_id
    WHERE recipes.id = ${id}
  `;
  return result as unknown as Recipe[];
};

export const getRecipes = async (): Promise<Recipe[]> => {
  const result = await sql`
    SELECT
      recipes.id,
      recipes.name,
      recipes.description,
      recipes.snippet,
      recipes.time,
      recipes.categories,
      recipes.image_url,
      recipes.difficulty,
      recipes.user_id,
      recipes.created_at,
      author.name AS author_name,
      (SELECT COUNT(*)::int FROM favorites f WHERE f.recipe_id = recipes.id) AS likes,
      (
        SELECT COALESCE(json_agg(json_build_object('name', ri.name, 'amount', ri.amount, 'unit', ri.unit) ORDER BY ri.id), '[]'::json)
        FROM recipe_ingredients ri
        WHERE ri.recipe_id = recipes.id
      ) AS ingredient_details,
      (
        SELECT COALESCE(json_agg(json_build_object('title', rs.title, 'description', rs.description, 'ingredients', rs.ingredients, 'time_minutes', rs.time_minutes) ORDER BY rs.step_number), '[]'::json)
        FROM recipe_steps rs
        WHERE rs.recipe_id = recipes.id
      ) AS step_details
    FROM recipes
    LEFT JOIN neon_auth."user" AS author ON author.id = recipes.user_id
    ORDER BY recipes.created_at DESC
  `;

  return result as unknown as Recipe[];
};

export const getFavoriteRecipeIds = async (
  userId: string,
): Promise<number[]> => {
  const rows = await sql`
    SELECT recipe_id FROM favorites WHERE user_id = ${userId}
  `;
  return (rows as { recipe_id: number }[]).map((row) => row.recipe_id);
};

export const addFavorite = async (userId: string, recipeId: number) => {
  await sql`
    INSERT INTO favorites (user_id, recipe_id)
    VALUES (${userId}, ${recipeId})
    ON CONFLICT (user_id, recipe_id) DO NOTHING
  `;
};

export const removeFavorite = async (userId: string, recipeId: number) => {
  await sql`
    DELETE FROM favorites
    WHERE user_id = ${userId} AND recipe_id = ${recipeId}
  `;
};

// Used once per account, the first time `lib/useFavorites.ts` finds
// pre-accounts favorites left in that browser's localStorage. The subquery
// (rather than inserting `recipeIds` directly) means a stale id for a
// recipe that no longer exists is just silently skipped instead of throwing
// a foreign-key error.
export const importFavorites = async (
  userId: string,
  recipeIds: number[],
) => {
  if (recipeIds.length === 0) return;
  await sql`
    INSERT INTO favorites (user_id, recipe_id)
    SELECT ${userId}, recipes.id FROM recipes WHERE recipes.id = ANY(${recipeIds})
    ON CONFLICT (user_id, recipe_id) DO NOTHING
  `;
};

// ---------------------------------------------------------------------------
// Shopping list: which recipes a user has added (shopping_list_recipes,
// shaped identically to favorites), plus the checked/unchecked state of an
// aggregated ingredient line (shopping_list_checked_items). A checked line is
// keyed by (name, unit) rather than by recipe_ingredients row, since the
// aggregate itself is keyed that way -- the same ingredient can come from
// more than one recipe on the list.
// ---------------------------------------------------------------------------

export const getShoppingListRecipeIds = async (
  userId: string,
): Promise<number[]> => {
  const rows = await sql`
    SELECT recipe_id FROM shopping_list_recipes WHERE user_id = ${userId}
  `;
  return (rows as { recipe_id: number }[]).map((row) => row.recipe_id);
};

export const addToShoppingList = async (userId: string, recipeId: number) => {
  await sql`
    INSERT INTO shopping_list_recipes (user_id, recipe_id)
    VALUES (${userId}, ${recipeId})
    ON CONFLICT (user_id, recipe_id) DO NOTHING
  `;
};

export const removeFromShoppingList = async (
  userId: string,
  recipeId: number,
) => {
  await sql`
    DELETE FROM shopping_list_recipes
    WHERE user_id = ${userId} AND recipe_id = ${recipeId}
  `;
};

export type ShoppingListIngredient = {
  name: string;
  unit: string;
  amount: number | null;
};

/**
 * Ingredients for every recipe on the user's shopping list, summed by
 * (name, unit). If any contributing row has no amount, the whole line's
 * amount comes back `null` (rather than silently summing only the known
 * ones) since a partial total would understate what's actually needed.
 */
export const getShoppingListIngredients = async (
  userId: string,
): Promise<ShoppingListIngredient[]> => {
  const rows = await sql`
    SELECT
      ri.name,
      ri.unit,
      CASE WHEN bool_or(ri.amount IS NULL) THEN NULL ELSE SUM(ri.amount) END AS amount
    FROM recipe_ingredients ri
    JOIN shopping_list_recipes slr ON slr.recipe_id = ri.recipe_id
    WHERE slr.user_id = ${userId}
    GROUP BY ri.name, ri.unit
    ORDER BY ri.name
  `;
  // `SUM` on a numeric column comes back as a string (the driver avoids
  // silently losing precision on large values), so it's parsed back to a
  // number here rather than trusting the raw row shape.
  return (
    rows as { name: string; unit: string; amount: string | null }[]
  ).map((row) => ({
    name: row.name,
    unit: row.unit,
    amount: row.amount == null ? null : Number(row.amount),
  }));
};

export type CheckedItemKey = { name: string; unit: string };

export const getCheckedShoppingListItems = async (
  userId: string,
): Promise<CheckedItemKey[]> => {
  const rows = await sql`
    SELECT name, unit FROM shopping_list_checked_items WHERE user_id = ${userId}
  `;
  return rows as unknown as CheckedItemKey[];
};

export const setShoppingListItemChecked = async (
  userId: string,
  name: string,
  unit: string,
  checked: boolean,
) => {
  if (checked) {
    await sql`
      INSERT INTO shopping_list_checked_items (user_id, name, unit)
      VALUES (${userId}, ${name}, ${unit})
      ON CONFLICT (user_id, name, unit) DO NOTHING
    `;
  } else {
    await sql`
      DELETE FROM shopping_list_checked_items
      WHERE user_id = ${userId} AND name = ${name} AND unit = ${unit}
    `;
  }
};

// ---------------------------------------------------------------------------
// Shopping list: custom items, not tied to any recipe (e.g. "paper towels").
// Unlike the recipe-derived aggregate, each custom item is its own uniquely
// identified row from the moment it's created, so its checked state lives
// directly on that row -- no separate checked-items table needed, since
// there's no multi-recipe aggregation to key it by (name, unit) instead.
// ---------------------------------------------------------------------------

export type CustomShoppingListItem = {
  id: number;
  name: string;
  amount: number | null;
  unit: string;
  checked: boolean;
};

function mapCustomItemRow(row: {
  id: number;
  name: string;
  amount: string | number | null;
  unit: string;
  checked: boolean;
}): CustomShoppingListItem {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount == null ? null : Number(row.amount),
    unit: row.unit,
    checked: row.checked,
  };
}

export const getCustomShoppingListItems = async (
  userId: string,
): Promise<CustomShoppingListItem[]> => {
  const rows = await sql`
    SELECT id, name, amount, unit, checked
    FROM shopping_list_custom_items
    WHERE user_id = ${userId}
    ORDER BY created_at
  `;
  return (rows as Parameters<typeof mapCustomItemRow>[0][]).map(
    mapCustomItemRow,
  );
};

export const addCustomShoppingListItem = async (
  userId: string,
  name: string,
  amount: number | null,
  unit: string,
): Promise<CustomShoppingListItem> => {
  const [row] = await sql`
    INSERT INTO shopping_list_custom_items (user_id, name, amount, unit)
    VALUES (${userId}, ${name}, ${amount}, ${unit})
    RETURNING id, name, amount, unit, checked
  `;
  return mapCustomItemRow(row as Parameters<typeof mapCustomItemRow>[0]);
};

export const removeCustomShoppingListItem = async (
  userId: string,
  itemId: number,
) => {
  await sql`
    DELETE FROM shopping_list_custom_items
    WHERE id = ${itemId} AND user_id = ${userId}
  `;
};

export const setCustomShoppingListItemChecked = async (
  userId: string,
  itemId: number,
  checked: boolean,
) => {
  await sql`
    UPDATE shopping_list_custom_items
    SET checked = ${checked}
    WHERE id = ${itemId} AND user_id = ${userId}
  `;
};

// ---------------------------------------------------------------------------
// Recipe creation permission: signing in alone isn't enough to create a
// recipe, since that would let anyone who signs up flood the database.
// Absence of a row (rather than a `false` row for every account) means
// "not allowed" so ordinary sign-ups need no row written for them at all --
// only accounts explicitly granted the flag get one.
// ---------------------------------------------------------------------------

export const canCreateRecipes = async (userId: string): Promise<boolean> => {
  const rows = await sql`
    SELECT can_create_recipes FROM user_roles WHERE user_id = ${userId}
  `;
  return (rows as { can_create_recipes: boolean }[])[0]?.can_create_recipes ?? false;
};

export const createRecipe = async (
  prevState: RecipeState,
  formData: FormData,
) => {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return {
      success: false,
      message: "You must be signed in to create a recipe",
    };
  }

  if (!(await canCreateRecipes(session.user.id))) {
    return {
      success: false,
      message: "Your account isn't approved to create recipes yet.",
    };
  }

  const result = recipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    snippet: formData.get("snippet"),
    time: formData.get("time"),
    ingredients: formData.getAll("ingredients"),
    steps: formData.getAll("steps"),
    categories: formData.getAll("categories"),
    image_url: formData.get("image_url"),
    difficulty: formData.get("difficulty"),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid recipe data",
    };
  }

  const recipe = result.data;

  try {
    // The old `ingredients` text[] column is no longer written to --
    // structured ingredients go into recipe_ingredients below instead.
    const [{ id: newRecipeId }] = await sql`
      INSERT INTO recipes (
        name,
        description,
        snippet,
        time,
        categories,
        image_url,
        likes,
        difficulty,
        user_id
      )
      VALUES (
        ${recipe.name},
        ${recipe.description},
        ${recipe.snippet},
        ${recipe.time},
        ${recipe.categories},
        ${recipe.image_url},
        0,
        ${recipe.difficulty},
        ${session.user.id}
      )
      RETURNING id
    `;

    await replaceIngredients(newRecipeId as number, recipe.ingredients);
    await replaceSteps(newRecipeId as number, recipe.steps);

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);

    return {
      success: false,
      message: "Failed to create recipe",
    };
  }
};

// Shaped as a `(prevState, formData)` action so a caller can bind the id
// (`updateRecipe.bind(null, id)`) and pass the result straight to
// `useActionState`, the same way `createRecipe` already works.
export const updateRecipe = async (
  id: number,
  prevState: RecipeState,
  formData: FormData,
): Promise<RecipeState> => {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return {
      success: false,
      message: "You must be signed in to edit a recipe",
    };
  }

  const result = recipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    snippet: formData.get("snippet"),
    time: formData.get("time"),
    ingredients: formData.getAll("ingredients"),
    steps: formData.getAll("steps"),
    categories: formData.getAll("categories"),
    image_url: formData.get("image_url"),
    difficulty: formData.get("difficulty"),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid recipe data",
    };
  }

  const recipe = result.data;

  try {
    // `AND user_id = ...` in the WHERE clause (rather than a separate
    // ownership lookup beforehand) makes the check atomic: a non-owner's
    // request just matches zero rows instead of racing a check-then-act.
    const updated = await sql`
      UPDATE recipes
      SET
        name = ${recipe.name},
        description = ${recipe.description},
        snippet = ${recipe.snippet},
        time = ${recipe.time},
        categories = ${recipe.categories},
        image_url = ${recipe.image_url},
        difficulty = ${recipe.difficulty}
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING id
    `;

    if (updated.length === 0) {
      return {
        success: false,
        message: "You can only edit recipes you created",
      };
    }

    await replaceIngredients(id, recipe.ingredients);
    await replaceSteps(id, recipe.steps);

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);

    return { success: false, message: "Failed to update recipe" };
  }
};

// prevState/formData are unused (delete needs no form fields) but kept as
// named params so `deleteRecipe.bind(null, id)` still matches the
// `(prevState, formData)` shape `useActionState` requires.
export const deleteRecipe = async (
  id: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prevState: RecipeState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData,
): Promise<RecipeState> => {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return {
      success: false,
      message: "You must be signed in to delete a recipe",
    };
  }

  try {
    const deleted = await sql`
      DELETE FROM recipes
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return {
        success: false,
        message: "You can only delete recipes you created",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);

    return { success: false, message: "Failed to delete recipe" };
  }
};

export const searchRecipes = async (search: string): Promise<Recipe[]> => {
  const result = sql`
    SELECT
      recipes.id,
      recipes.name,
      recipes.description,
      recipes.snippet,
      recipes.time,
      recipes.categories,
      recipes.image_url,
      recipes.difficulty,
      recipes.user_id,
      recipes.created_at,
      author.name AS author_name,
      (SELECT COUNT(*)::int FROM favorites f WHERE f.recipe_id = recipes.id) AS likes,
      (
        SELECT COALESCE(json_agg(json_build_object('name', ri.name, 'amount', ri.amount, 'unit', ri.unit) ORDER BY ri.id), '[]'::json)
        FROM recipe_ingredients ri
        WHERE ri.recipe_id = recipes.id
      ) AS ingredient_details,
      (
        SELECT COALESCE(json_agg(json_build_object('title', rs.title, 'description', rs.description, 'ingredients', rs.ingredients, 'time_minutes', rs.time_minutes) ORDER BY rs.step_number), '[]'::json)
        FROM recipe_steps rs
        WHERE rs.recipe_id = recipes.id
      ) AS step_details
    FROM recipes
    LEFT JOIN neon_auth."user" AS author ON author.id = recipes.user_id
    WHERE recipes.name ILIKE ${`%${search}%`}
    ORDER BY recipes.created_at DESC
  `;

  return result as unknown as Recipe[];
};

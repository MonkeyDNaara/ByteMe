"use server";

import z from "zod";
import { sql } from "./db";
import { auth } from "./lib/auth/server";

const recipeSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  snippet: z.string().trim().min(1, "Snippet is required"),
  time: z.coerce.number().positive("Time must be positive"),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  image_url: z.string().url("Invalid image URL"),
  difficulty: z.coerce
    .number()
    .int()
    .min(1, "Difficulty is required")
    .max(5, "Difficulty is required"),
});

type RecipeInput = z.infer<typeof recipeSchema>;

export type Recipe = RecipeInput & {
  id: number;
  likes: number;
  created_at: Date;
  user_id: string | null;
  author_name: string | null;
};

export type RecipeState = {
  success: boolean;
  message?: string;
} | null;

// Every read that returns a `Recipe` joins in the author's display name from
// Neon Auth's own `user` table (left join, since `user_id` is nullable --
// recipes created before this feature, or via the seed script, have none).
export const getRecipeById = async (id: number): Promise<Recipe[]> => {
  const result = await sql`
    SELECT recipes.*, author.name AS author_name
    FROM recipes
    LEFT JOIN neon_auth."user" AS author ON author.id = recipes.user_id
    WHERE recipes.id = ${id}
  `;
  return result as unknown as Recipe[];
};

export const getRecipes = async (): Promise<Recipe[]> => {
  const result = await sql`
    SELECT recipes.*, author.name AS author_name
    FROM recipes
    LEFT JOIN neon_auth."user" AS author ON author.id = recipes.user_id
    ORDER BY recipes.created_at DESC
  `;

  return result as unknown as Recipe[];
};

// delta is +1 (favourited) or -1 (un-favourited)
export const updateRecipeLikes = async (id: number, delta: 1 | -1) => {
  return sql`
    UPDATE recipes
    SET likes = GREATEST(likes + ${delta}, 0)
    WHERE id = ${id}
  `;
};

export const createRecipeDEV = async (recipe: RecipeInput) => {
  await sql`
    INSERT INTO recipes (
      name,
      description,
      snippet,
      time,
      ingredients,
      categories,
      image_url,
      likes,
      difficulty
    )
    VALUES (
      ${recipe.name},
      ${recipe.description},
      ${recipe.snippet},
      ${recipe.time},
      ${recipe.ingredients},
      ${recipe.categories},
      ${recipe.image_url},
      ${Math.floor(Math.random() * 10 ** Math.floor((Math.random() + 1) * 3))},
      ${recipe.difficulty}
    )
  `;
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

  const result = recipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    snippet: formData.get("snippet"),
    time: formData.get("time"),
    ingredients: formData.getAll("ingredients"),
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
    await sql`
      INSERT INTO recipes (
        name,
        description,
        snippet,
        time,
        ingredients,
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
        ${recipe.ingredients},
        ${recipe.categories},
        ${recipe.image_url},
        0,
        ${recipe.difficulty},
        ${session.user.id}
      )
    `;

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
        ingredients = ${recipe.ingredients},
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
    SELECT recipes.*, author.name AS author_name
    FROM recipes
    LEFT JOIN neon_auth."user" AS author ON author.id = recipes.user_id
    WHERE recipes.name ILIKE ${`%${search}%`}
    ORDER BY recipes.created_at DESC
  `;

  return result as unknown as Recipe[];
};

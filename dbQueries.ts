"use server";

import z from "zod";
import { sql } from "./db";

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
});

type Recipe = z.infer<typeof recipeSchema>;

export type RecipeState = {
  success: boolean;
  message?: string;
} | null;

export const getRecipeById = async (id: number) => sql`
    SELECT *
    FROM recipes
    WHERE id = ${id}
`;

export const getRecipes = async () =>
  sql`SELECT * FROM recipes ORDER BY created_at DESC`;

// delta is +1 (favourited) or -1 (un-favourited); GREATEST keeps likes from
// going negative if calls ever race or double-fire.
export const updateRecipeLikes = async (id: number, delta: 1 | -1) =>
  sql`
    UPDATE recipes
    SET likes = GREATEST(likes + ${delta}, 0)
    WHERE id = ${id}
  `;

// type RecipeTypes = {
//   name: string;
//   description: string;
//   snippet: string;
//   time: number;
//   ingredients: string[];
//   categories: string[];
//   image_url: string;
//   likes: number;
// };

// export const createRecipe = async (prevState, recipe: RecipeTypes) =>
//   sql`INSERT INTO recipes (name,description,snippet,time,ingredients,categories,image_url,likes)VALUES (${recipe.name},${recipe.description},${recipe.snippet},${recipe.time},${recipe.ingredients},${recipe.categories},${recipe.image_url},${recipe.likes})`;
export type RecipeState = {
  success: boolean;
  message?: string;
} | null;

export const createRecipe = async (
  prevState: RecipeState,
  formData: FormData,
) => {
  const recipe = {
    name: formData.get("name"),
    description: formData.get("description"),
    snippet: formData.get("snippet"),
    time: formData.get("time"),
    ingredients: formData.getAll("ingredients"),
    categories: formData.getAll("categories"),
    image_url: formData.get("image_url"),
  };
  const likes = 0;

  const parsedRecipe = recipeSchema.safeParse(recipe);

  if (!parsedRecipe.success) {
    console.log(parsedRecipe.error);
    return {
      success: false,
      message: "Invalid recipe data",
    };
  }

  try {
    await sql`INSERT INTO recipes (name,description,snippet,time,ingredients,categories,image_url,likes)VALUES (${parsedRecipe.data.name},${parsedRecipe.data.description},${parsedRecipe.data.snippet},${parsedRecipe.data.time},${parsedRecipe.data.ingredients},${parsedRecipe.data.categories},${parsedRecipe.data.image_url},${likes})`;
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
};

export const updateRecipe = async (id: number, recipe: Recipe) => {
  try {
    await sql`
      UPDATE recipes
      SET
        name = ${recipe.name},
        description = ${recipe.description},
        snippet = ${recipe.snippet},
        time = ${recipe.time},
        ingredients = ${recipe.ingredients},
        categories = ${recipe.categories},
        image_url = ${recipe.image_url}
      WHERE id = ${id}
    `;

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);

    return { success: false };
  }
};

export const deleteRecipe = async (id: number) => {
  try {
    await sql`
      DELETE FROM recipes
      WHERE id = ${id}
    `;

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);

    return { success: false };
  }
};

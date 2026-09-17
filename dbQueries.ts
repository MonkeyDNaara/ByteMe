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

type RecipeInput = z.infer<typeof recipeSchema>;

export type Recipe = RecipeInput & {
  id: number;
  likes: number;
  created_at: Date;
};

export type RecipeState = {
  success: boolean;
  message?: string;
} | null;

export const getRecipeById = async (id: number): Promise<Recipe[]> => {
  return sql`
    SELECT *
    FROM recipes
    WHERE id = ${id}
  `;
};

export const getRecipes = async (): Promise<Recipe[]> =>
  sql`
    SELECT *
    FROM recipes
    ORDER BY created_at DESC
  `;

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
      likes
    )
    VALUES (
      ${recipe.name},
      ${recipe.description},
      ${recipe.snippet},
      ${recipe.time},
      ${recipe.ingredients},
      ${recipe.categories},
      ${recipe.image_url},
      ${Math.floor(Math.random() * 10 ** Math.floor((Math.random() + 1) * 3))}
    )
  `;
};

export const createRecipe = async (
  prevState: RecipeState,
  formData: FormData,
) => {
  const result = recipeSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    snippet: formData.get("snippet"),
    time: formData.get("time"),
    ingredients: formData.getAll("ingredients"),
    categories: formData.getAll("categories"),
    image_url: formData.get("image_url"),
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
        likes
      )
      VALUES (
        ${recipe.name},
        ${recipe.description},
        ${recipe.snippet},
        ${recipe.time},
        ${recipe.ingredients},
        ${recipe.categories},
        ${recipe.image_url},
        0
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

export const searchRecipes = async (search: string): Promise<Recipe[]> => {
  return sql`
    SELECT *
    FROM recipes
    WHERE name ILIKE ${`%${search}%`}
    ORDER BY created_at DESC
  `;
};

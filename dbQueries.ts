"use server";

import { sql } from "./db";

// async function request(para1, para2) {
//     return await sql`${para1}`
// }

export const getRecipeById = async (id: number) => sql`
    SELECT *
    FROM recipes
    WHERE id = ${id}
`;

export const getRecipes = async () =>
  sql`SELECT * FROM recipes ORDER BY created_at DESC`;

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
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const snippet = formData.get("snippet") as string;
  const time = Number(formData.get("time"));
  const ingredients = formData.getAll("ingredients") as string[];
  const categories = formData.getAll("categories") as string[];
  const image_url = formData.get("image_url") as string;
  const likes = 0;

  try {
    await sql`INSERT INTO recipes (name,description,snippet,time,ingredients,categories,image_url,likes)VALUES (${name},${description},${snippet},${time},${ingredients},${categories},${image_url},${likes})`;
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false };
  }
};

import { sql } from "./db";

type RecipeTypes = {
  name: string;
  description: string;
  snippet: string;
  time: number;
  ingredients: string[];
  categories: string[];
  image_url: string;
};

export const createRecipeDEV = async (recipe: RecipeTypes) => {
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

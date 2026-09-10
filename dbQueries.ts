import { sql } from "./db";

// async function request(para1, para2) {
//     return await sql`${para1}`
// }

export const getRecipeById = async (id: number) => sql`
    SELECT *
    FROM recipes
    WHERE id = ${id}
`;

export const getRecipes = async () => sql"SELECT * FROM recipes ORDER BY created_at DESC";

type RecipeTypes = {
    name: string;
    description: string;
    snippet: string;
    time: number;
    ingredients: string[];
    categories: string[];
    image_url: string;
    likes: number;
};

export const createRecipe = async (recipe:RecipeTypes )=> sql`INSERT INTO recipes (name,description,snippet,time,ingredients,categories,image_url,likes)VALUES (${recipe.name},${recipe.description},${recipe.snippet},${recipe.time},${recipe.ingredients},${recipe.categories},${recipe.image_url},${recipe.likes})`;

createRecipe({name: "Pudding",
    description: "Very good pudding. Everyone likes this pudding!",
    snippet: "Good pudding!",
    time: 120,
    ingredients: ["pudding", "spoon"],
    categories: ["tasty", "breakfast", "lunch", "dinner"],
    image_url: "https://www.oetker-shop.de/media/ff/3d/01/1721717551/a-1-39-250083-ppk-schokolade-1500x1500-jpg_e915bbb356e3556d.jpg?ts=1721717551",
    likes: 1
})
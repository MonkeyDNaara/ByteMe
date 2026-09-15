import { createRecipeDEV } from "./dbSeed";
import { recipes } from "./randomRecipes";

async function seed() {
  for (const recipe of recipes) {
    await createRecipeDEV(recipe);
  }
}

seed();

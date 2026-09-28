import { cache } from "react";

import { auth } from "@/lib/auth/server";
import { getMyFavoriteIds } from "@/lib/favorites";
import { getRecipeById, isRecipeOwner, type Recipe } from "@/lib/recipe";
import { getMyHaveItems, type CheckedItemKey } from "@/lib/shoppingList";

export type RecipeDetailsData = {
  recipe: Recipe;
  isOwner: boolean;
  /** Whether the signed-in user had favorited it when the page was rendered. */
  initiallyFavorite: boolean;
  /** Ingredients the user already has (ticked earlier), if the recipe is on their shopping list. */
  initialHave: CheckedItemKey[];
};

/**
 * Everything the detail page AND the modal need, loaded on the server.
 * React's `cache()` de-duplicates calls within one request, so
 * generateMetadata and the page can both call this without a second DB query.
 */
export const loadRecipeDetails = cache(async (id: string): Promise<RecipeDetailsData | null> => {
  const recipe = await getRecipeById(id);
  if (!recipe) return null;

  const [{ data: session }, favoriteIds, initialHave] = await Promise.all([
    auth.getSession(),
    getMyFavoriteIds(),
    getMyHaveItems(recipe.id),
  ]);

  return {
    recipe,
    isOwner: isRecipeOwner(recipe, session?.user?.id),
    initiallyFavorite: favoriteIds.includes(recipe.id),
    initialHave,
  };
});

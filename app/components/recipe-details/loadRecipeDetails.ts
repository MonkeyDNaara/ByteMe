import { cache } from "react";

import { auth } from "@/lib/auth/server";
import { getMyFavoriteIds } from "@/lib/favorites";
import { getRecipeById, isRecipeOwner, type Recipe } from "@/lib/recipe";

export type RecipeDetailsData = {
  recipe: Recipe;
  isOwner: boolean;
  /** Whether the signed-in user had favorited it when the page was rendered. */
  initiallyFavorite: boolean;
};

/**
 * Everything the detail page AND the modal need, loaded on the server.
 * React's `cache()` de-duplicates calls within one request, so
 * generateMetadata and the page can both call this without a second DB query.
 */
export const loadRecipeDetails = cache(async (id: string): Promise<RecipeDetailsData | null> => {
  const recipe = await getRecipeById(id);
  if (!recipe) return null;

  const [{ data: session }, favoriteIds] = await Promise.all([auth.getSession(), getMyFavoriteIds()]);

  return {
    recipe,
    isOwner: isRecipeOwner(recipe, session?.user?.id),
    initiallyFavorite: favoriteIds.includes(recipe.id),
  };
});

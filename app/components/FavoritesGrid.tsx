"use client";

import EmptyState from "@/app/components/EmptyState";
import type { FilterState } from "@/app/components/recipe-filters/filterParams";
import RecipeFilters from "@/app/components/recipe-filters/RecipeFilters";
import type { Recipe } from "@/lib/recipe";
import { useFavorites } from "@/lib/useFavorites";

type FavoritesGridProps = {
  /** The full recipe list, fetched server-side; filtered down to favorites here. */
  recipes: Recipe[];
  /** Favorite ids loaded on the server -- shown until the client hook has loaded. */
  initialFavoriteIds: string[];
  initialFilters: FilterState;
};

export default function FavoritesGrid({ recipes, initialFavoriteIds, initialFilters }: FavoritesGridProps) {
  const { favorites, isLoaded } = useFavorites();

  // Server ids first (no "no favorites" flash), then the live client list,
  // so un-hearting a recipe removes it right away.
  const favoriteIds = isLoaded ? favorites : initialFavoriteIds;
  const favoriteRecipes = recipes.filter((recipe) => favoriteIds.includes(recipe.id));

  if (favoriteRecipes.length === 0) {
    return (
      <EmptyState
        emoji="💜"
        title="No favorites yet"
        text="Tap the ♡ on any recipe you like — it lands right here, ready for later."
        primary={{ label: "Browse recipes", href: "/all-recipes" }}
        secondary={{ label: "🎲 or let us surprise you", href: "/random" }}
      />
    );
  }

  return <RecipeFilters recipes={favoriteRecipes} initialFilters={initialFilters} />;
}

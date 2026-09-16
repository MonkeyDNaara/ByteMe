"use client";

import Link from "next/link";

import RecipeFilters from "@/app/components/RecipeFilters";
import type { Recipe } from "@/lib/recipe";
import { useFavorites } from "@/lib/useFavorites";

type FavoritesGridProps = {
  /** The full recipe list, fetched server-side; filtered down to favourites here. */
  recipes: Recipe[];
};

export default function FavoritesGrid({ recipes }: FavoritesGridProps) {
  const { favorites } = useFavorites();
  const favoriteRecipes = recipes.filter((recipe) =>
    favorites.includes(recipe.id),
  );

  if (favoriteRecipes.length === 0) {
    return (
      <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">
        You haven&apos;t saved any favourites yet.{" "}
        <Link href="/all-recipes" className="link link-primary">
          Browse all recipes
        </Link>{" "}
        and tap the heart on one you like.
      </p>
    );
  }

  return <RecipeFilters recipes={favoriteRecipes} />;
}

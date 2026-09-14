"use client";

import Link from "next/link";

import RecipeCard from "@/app/components/RecipeCard";
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

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-base-content/60">
        {favoriteRecipes.length}{" "}
        {favoriteRecipes.length === 1 ? "favourite" : "favourites"}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favoriteRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            href={`/recipe/${recipe.id}`}
          />
        ))}
      </div>
    </div>
  );
}

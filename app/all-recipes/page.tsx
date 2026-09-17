import RecipeFilters from "@/app/components/RecipeFilters";
import { getRecipes, searchRecipes } from "@/dbQueries";
import SearchBar from "./SearchBar";
import { Recipe } from "@/lib/recipe";
import type { Metadata } from "next";

export default async function AllRecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;

  const allRecipes = await getRecipes();
  const recipes = search ? await searchRecipes(search) : allRecipes;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          All recipes
        </h1>

        <SearchBar recipes={allRecipes} />

        <p className="max-w-2xl text-sm text-base-content/70">
          Browse the full collection, or narrow it down by label and cook time.
          Pick a card to see the full recipe.
        </p>
      </header>

      {recipes.length === 0 ? (
        <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">
          No recipes yet.
        </p>
      ) : (
        <RecipeFilters recipes={recipes as unknown as Recipe[]} />
      )}
    </div>
  );
}

export const metadata: Metadata = {
  title: "All Recipes",
};

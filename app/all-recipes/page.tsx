import type { Metadata } from "next";

import RecipeFilters from "@/app/components/RecipeFilters";
import SearchBar from "@/app/components/SearchBar";
import { getAllRecipes, searchRecipes } from "@/lib/recipe";

export const metadata: Metadata = {
  title: "All Recipes",
};

type AllRecipesSearchParams = {
  search?: string;
  /** One or more labels, e.g. `?label=vegetarian&label=dessert`. */
  label?: string | string[];
  /** Upper time limit in minutes, e.g. `?maxTime=20`. */
  maxTime?: string;
};

export default async function AllRecipesPage({
  searchParams,
}: {
  searchParams: Promise<AllRecipesSearchParams>;
}) {
  const { search, label, maxTime } = await searchParams;

  const allRecipes = await getAllRecipes();
  const recipes = search ? await searchRecipes(search) : allRecipes;

  // URL params are strings (or arrays when repeated) -- normalize them here,
  // so RecipeFilters only ever receives clean, typed values.
  const initialCategories = label === undefined ? [] : Array.isArray(label) ? label : [label];
  const parsedMaxTime = Number(maxTime);
  const initialMaxTime = Number.isFinite(parsedMaxTime) && parsedMaxTime > 0 ? parsedMaxTime : undefined;

  // Only the fields the suggestions need are sent to the client component.
  const searchSuggestions = allRecipes.map(({ id, name, likes, image_url }) => ({ id, name, likes, image_url }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All recipes</h1>

        <SearchBar recipes={searchSuggestions} />

        <p className="max-w-2xl text-sm text-base-content/70">
          Browse the full collection, or narrow it down by label and cook time. Pick a card to see the full recipe.
        </p>
      </header>

      {recipes.length === 0 ? (
        <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">No recipes yet.</p>
      ) : (
        <RecipeFilters
          // A new key = a fresh component with fresh state, whenever the
          // filter link (or search) in the URL changes.
          key={`${search ?? ""}|${initialCategories.join(",")}|${initialMaxTime ?? ""}`}
          recipes={recipes}
          initialCategories={initialCategories}
          initialMaxTime={initialMaxTime}
        />
      )}
    </div>
  );
}

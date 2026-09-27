import type { Metadata } from "next";
import Link from "next/link";

import { filtersKey, parseFilterParams, type RawSearchParams } from "@/app/components/recipe-filters/filterParams";
import RecipeFilters from "@/app/components/recipe-filters/RecipeFilters";
import SearchBar from "@/app/components/SearchBar";
import { getAllRecipes, searchRecipes } from "@/lib/recipe";

export const metadata: Metadata = {
  title: "All Recipes",
};

export default async function AllRecipesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const initialFilters = parseFilterParams(params);

  const allRecipes = await getAllRecipes();
  const recipes = search ? await searchRecipes(search) : allRecipes;

  // Only the fields the suggestions need are sent to the client component.
  const searchSuggestions = allRecipes.map(({ id, name, likes, image_url }) => ({ id, name, likes, image_url }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">All recipes 📖</h1>
          <p className="text-sm text-base-content/70 sm:text-base">
            {search ? (
              <>
                Results for <strong className="text-base-content">“{search}”</strong> ·{" "}
                <Link href="/all-recipes" className="font-semibold text-link hover:underline">
                  Show all
                </Link>
              </>
            ) : (
              "Browse the full collection, or narrow it down by label, cook time and difficulty."
            )}
          </p>
        </div>

        <SearchBar recipes={searchSuggestions} placeholder="Search recipe… e.g. “pasta”" />
      </header>

      {recipes.length === 0 ? (
        <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">
          {search ? `No recipe name contains “${search}”.` : "No recipes yet."}
        </p>
      ) : (
        <RecipeFilters
          // A new key = a fresh component with fresh state whenever the page
          // is opened with a different search or filter link.
          key={`${search}|${filtersKey(initialFilters)}`}
          recipes={recipes}
          initialFilters={initialFilters}
        />
      )}
    </div>
  );
}

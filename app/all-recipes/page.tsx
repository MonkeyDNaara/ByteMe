import RecipeCard from "@/app/components/RecipeCard";
import { getAllRecipes } from "@/lib/recipe";

export default async function AllRecipesPage() {
  const recipes = await getAllRecipes();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          All recipes
        </h1>
        <p className="max-w-2xl text-sm text-base-content/70">
          Browse the full collection. Search and filters are coming soon —
          for now, pick a card to see the full recipe.
        </p>
        <p className="text-sm text-base-content/60">
          {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </p>
      </header>

      {recipes.length === 0 ? (
        <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">
          No recipes yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              href={`/recipe/${recipe.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

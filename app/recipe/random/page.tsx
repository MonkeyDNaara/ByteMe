import { redirect } from "next/navigation";

import RecipeCard from "@/app/components/RecipeCard";
import { getAllRecipes } from "@/lib/recipe";

export const dynamic = "force-dynamic";

export default async function RandomRecipePage() {
  const recipes = await getAllRecipes();

  if (recipes.length === 0) {
    redirect("/all-recipes");
  }

  const recipe = recipes[Math.floor(Math.random() * recipes.length)];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <section className="flex flex-col items-center gap-5">
        <div className="text-center">
          <h3 className="text-2xl font-semibold">Your random recipe</h3>
          <p className="mt-1 text-sm text-base-content/60">Not feeling it? Let byteMe pick another one.</p>
        </div>

        <div className="w-full max-w-md">
          <RecipeCard recipe={recipe} href={`/recipe/${recipe.id}`} />
        </div>

        <form action="/recipe/random" method="get">
          <button type="submit" className="btn btn-primary">
            Try again
          </button>
        </form>
      </section>
    </div>
  );
}

import { redirect } from "next/navigation";

import RecipeCard from "@/app/components/RecipeCard";
import { getRandomRecipe } from "@/lib/recipe";

export const dynamic = "force-dynamic";

// Lives at /random, NOT /recipe/random: the recipe modal intercepts every
// soft navigation to /recipe/<anything> via app/@modal/(.)recipe/[id], and
// interception doesn't care that a static "random" folder exists next to [id].
// "random" would have been treated as a recipe id -> "not found".
export default async function RandomRecipePage() {
  // The random pick happens in the database, not during render: a component
  // must return the same output for the same input (React's purity rule).
  const recipe = await getRandomRecipe();

  if (!recipe) {
    redirect("/all-recipes");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <section className="flex flex-col items-center gap-5">
        <div className="text-center">
          <h3 className="text-2xl font-semibold">Your random recipe</h3>
          <p className="mt-1 text-sm text-base-content/60">Not feeling it? Let byteMe pick another one.</p>
        </div>

        <div className="w-full max-w-md">
          <RecipeCard recipe={recipe} />
        </div>

        <form action="/random" method="get">
          <button type="submit" className="btn btn-primary">
            Try again
          </button>
        </form>
      </section>
    </div>
  );
}

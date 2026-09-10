import RecipeCard from "@/app/components/RecipeCard";
import { getRecipesOfTheDay } from "@/lib/recipe";

export default async function Home() {
  const recipesOfTheDay = await getRecipesOfTheDay();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          byte me
        </h1>
        <h2 className="text-lg font-medium text-base-content/80">
          Description of the page
        </h2>
        <p className="max-w-2xl text-sm text-base-content/70">
          Your daily kitchen companion. Every day we pick three recipes for you
          — one for breakfast, one for lunch and one for dinner — so you always
          have a plan. Browse all recipes, save your favourites, or add your
          own.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-semibold">Recipes of the day</h3>
          <span className="hidden text-sm text-base-content/60 sm:inline">
            Updated daily
          </span>
        </div>

        {recipesOfTheDay.length === 0 ? (
          <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">
            No recipes to show yet.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {recipesOfTheDay.map(({ meal, recipe }) => (
              <RecipeCard
                key={recipe.id}
                meal={meal}
                recipe={recipe}
                href={`/recipe/${recipe.id}`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col items-center gap-3 rounded-box bg-base-300 px-6 py-10 text-center">
        <h3 className="text-xl font-semibold">Can&apos;t decide?</h3>
        <p className="max-w-md text-sm text-base-content/70">
          Let us pick a random recipe for you from the whole collection.
        </p>
        <button className="btn btn-primary cursor-pointer">Surprise Me</button>
      </section>
    </div>
  );
}

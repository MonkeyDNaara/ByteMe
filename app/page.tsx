import Link from "next/link";

import RecipeCard from "@/app/components/RecipeCard";
import { getRecipesOfTheDay } from "@/lib/recipe";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recipesOfTheDay = await getRecipesOfTheDay();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          byteMe
        </h1>
        <p className="max-w-2xl text-sm text-base-content/70">
          Your daily kitchen companion. Discover recipes, cook with step-by-step
          timers, and keep your favorites organized.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Recipes of the day</h2>
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
        <h2 className="text-xl font-semibold">Can&apos;t decide?</h2>
        <p className="max-w-md text-sm text-base-content/70">
          Let us pick a random recipe for you from the whole collection.
        </p>
        <Link href="/recipe/random" className="btn btn-primary">
          Surprise Me
        </Link>
      </section>

      <section className="relative -mx-[50vw] left-1/2 right-1/2 w-screen bg-base-200 shadow-md">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">
            ✨🍱 Welcome to YOUR new Kitchen! 🍳✨
          </h2>
          <p className="my-4">
            Whether you are looking for a quick dinner after a long day, craving
            something sweet, or simply curious about what you can create with a
            handful of good ingredients — we are happy to have you here! This
            recipe collection is a place to explore, discover new ideas, and
            maybe even find your next favorite dish.
          </p>
          <p className="my-4">
            Cooking and baking do not have to be complicated or perfect.
            Sometimes all you need are a few ingredients, a little time, and the
            willingness to try something new. Simple ingredients can turn into
            surprisingly delicious meals, and that is what makes cooking so
            exciting: there is always something new to discover. A recipe can be
            a starting point, but there is nothing wrong with making it your own
            along the way.
          </p>
          <p className="my-4">
            Here you will find a growing collection of recipes for all kinds of
            tastes and occasions. From quick and easy meals for busy days to
            recipes that invite you to slow down and enjoy the process. Whether
            you are looking for breakfast, lunch, dinner, vegetarian or vegan
            ideas, meat and fish dishes, or something sweet to enjoy afterwards
            — there is always something worth exploring.
          </p>
          <p className="my-4">
            Not quite sure what you are looking for? That is perfectly fine.
            Take your time, browse through the collection, filter recipes by
            category or cooking time, and let yourself be inspired. You might
            come across a dish you would never have thought of making. And who
            knows — that unexpected discovery might just become your new
            favorite.
          </p>
          <p className="my-4">
            One of the best things about cooking is that it is about much more
            than simply preparing food. It can be creative, relaxing, exciting,
            and sometimes even a little chaotic. A dinner shared with friends, a
            homemade cake made for someone special, or a comforting meal after a
            long day can turn ordinary moments into memorable ones. Food has a
            wonderful way of bringing people together.
          </p>
          <p className="my-4">
            So make yourself comfortable and feel at home. Browse around, save
            the recipes that catch your eye, and do not be afraid to try
            something new. You do not have to be a professional, and you
            certainly do not have to get everything right on the first try.
            Everyone starts somewhere — and sometimes the little mistakes along
            the way make the best stories.
          </p>
          <p className="my-4">
            Maybe you are here because you simply need an idea for
            tonight&apos;s dinner. Maybe you want to try baking your first cake,
            discover a new vegetarian dish, surprise your friends with something
            homemade, or challenge yourself with a recipe that takes a little
            more time. Whatever brought you here, we hope you find something
            that makes you want to head into the kitchen and give it a try.
          </p>
          <p className="my-4">
            Because at the end of the day, cooking and baking are about one
            simple thing: making something delicious and having fun along the
            way. ❤️
          </p>
          <p className="my-4">
            So take a look around, pick a recipe that catches your attention,
            and give it a shot.{" "}
          </p>
          <p className="mt-12 text-center">
            {" "}
            <strong>
              Roll up your sleeves, turn on the oven, sharpen those knives — and
              let the cooking begin. 👨‍🍳👩‍🍳
            </strong>
          </p>
        </div>
      </section>
    </div>
  );
}

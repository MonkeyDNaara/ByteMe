import Link from "next/link";

import PixelReveal from "@/app/components/PixelReveal";
import RecipeCard from "@/app/components/RecipeCard";
import SearchBar from "@/app/components/SearchBar";
import { getAllRecipes, pickRecipesOfTheDay } from "@/lib/recipe";

export const dynamic = "force-dynamic";

// Quick filters under the search -- they open /all-recipes with the filter preselected.
const QUICK_FILTERS = [
  { label: "Breakfast", href: "/all-recipes?label=breakfast" },
  { label: "Under 20 min", href: "/all-recipes?maxTime=20" },
  { label: "Vegetarian", href: "/all-recipes?label=vegetarian" },
  { label: "One-pot", href: "/all-recipes?label=one-pot" },
  { label: "Dessert", href: "/all-recipes?label=dessert" },
];

const FEATURES = [
  {
    emoji: "🔍",
    title: "Find",
    text: "Search the collection and filter by label, cook time and difficulty.",
    cta: "Browse recipes",
    href: "/all-recipes",
  },
  {
    emoji: "⏲️",
    title: "Cook",
    text: "Cooking mode walks you through every step — with timers that keep running in the background.",
    cta: "Try a recipe",
    href: "/random",
  },
  {
    emoji: "🛒",
    title: "Shop",
    text: "Add recipes to your shopping list — matching ingredients are combined automatically.",
    cta: "Open shopping list",
    href: "/shopping-list",
  },
];

const STORIES = [
  {
    emoji: "🥄",
    title: "Keep it simple",
    paragraphs: [
      "Cooking and baking do not have to be complicated or perfect. Sometimes all you need are a few ingredients, a little time, and the willingness to try something new. Simple ingredients can turn into surprisingly delicious meals, and that is what makes cooking so exciting: there is always something new to discover. A recipe can be a starting point, but there is nothing wrong with making it your own along the way.",
    ],
  },
  {
    emoji: "📚",
    title: "Something for every taste",
    paragraphs: [
      "Here you will find a growing collection of recipes for all kinds of tastes and occasions. From quick and easy meals for busy days to recipes that invite you to slow down and enjoy the process. Whether you are looking for breakfast, lunch, dinner, vegetarian or vegan ideas, meat and fish dishes, or something sweet to enjoy afterwards — there is always something worth exploring.",
      "Not quite sure what you are looking for? That is perfectly fine. Take your time, browse through the collection, filter recipes by category or cooking time, and let yourself be inspired.",
    ],
  },
  {
    emoji: "❤️",
    title: "More than just food",
    paragraphs: [
      "One of the best things about cooking is that it is about much more than simply preparing food. It can be creative, relaxing, exciting, and sometimes even a little chaotic. A dinner shared with friends, a homemade cake made for someone special, or a comforting meal after a long day can turn ordinary moments into memorable ones.",
      "So make yourself comfortable and feel at home. You do not have to be a professional — everyone starts somewhere, and sometimes the little mistakes along the way make the best stories.",
    ],
  },
  {
    emoji: "🍰",
    title: "Whatever brought you here",
    paragraphs: [
      "Maybe you simply need an idea for tonight’s dinner. Maybe you want to bake your first cake, discover a new vegetarian dish, surprise your friends with something homemade, or challenge yourself with a recipe that takes a little more time.",
      "Because at the end of the day, cooking and baking are about one simple thing: making something delicious and having fun along the way. ❤️ So take a look around, pick a recipe that catches your attention, and give it a shot.",
    ],
  },
];

const chipClass =
  "flex h-9 shrink-0 items-center rounded-full border border-base-300 bg-base-200 px-3.5 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/25";

export default async function Home() {
  // Load all recipes ONCE: the search suggestions need them, and the
  // recipes of the day are picked from the same list (no second DB query).
  const recipes = await getAllRecipes();
  const recipesOfTheDay = pickRecipesOfTheDay(recipes);
  const searchSuggestions = recipes.map(({ id, name, likes, image_url }) => ({ id, name, likes, image_url }));

  return (
    <div className="flex flex-col gap-14 sm:gap-20">
      {/* Home only: pixel intro animation. Uses this div as its reference container. */}
      <PixelReveal />

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 pt-8 sm:px-6 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center lg:gap-12">
        <div className="flex min-w-0 flex-col gap-5">
          <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-content">
            Your daily kitchen companion
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            What are we cooking today?
          </h1>
          <p className="hidden max-w-xl text-base text-base-content/70 sm:block">
            Discover recipes, cook with step-by-step timers, and keep your favorites and shopping list organized.
          </p>

          <div className="max-w-2xl">
            <SearchBar
              recipes={searchSuggestions}
              defaultOpen
              placeholder={`Search ${recipes.length} recipes, e.g. “pasta”`}
            />
          </div>

          {/* Mobile: one scrollable row; from sm: wrapping chips */}
          <nav
            aria-label="Quick filters"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          >
            {QUICK_FILTERS.map((filter) => (
              <Link key={filter.href} href={filter.href} className={chipClass}>
                {filter.label}
              </Link>
            ))}
            <Link href="/all-recipes" className={`${chipClass} text-link`}>
              All labels →
            </Link>
          </nav>

          {/* Mobile version of "Can't decide?" */}
          <Link
            href="/random"
            className="flex h-13 items-center gap-3 rounded-2xl bg-base-300 px-4 font-semibold lg:hidden"
          >
            <span aria-hidden="true" className="text-xl">
              🎲
            </span>
            <span className="flex-1">Can’t decide? Surprise me</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Desktop version of "Can't decide?" */}
        <aside className="hidden flex-col gap-5 rounded-[2rem] border border-base-300 bg-base-300 p-8 lg:flex">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-200 text-4xl shadow-sm"
          >
            🎲
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Can’t decide?</h2>
            <p className="text-base-content/70">Let us pick a random recipe for you from the whole collection.</p>
          </div>
          <Link
            href="/random"
            className="btn h-12 w-fit rounded-full border-none bg-base-content px-6 text-base-100 hover:bg-base-content/85"
          >
            Surprise me →
          </Link>
        </aside>
      </section>

      {/* Recipes of the day */}
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold sm:text-3xl">Recipes of the day</h2>
            <p className="hidden text-sm text-base-content/70 sm:block">
              A fresh breakfast, lunch and dinner pick — every day.
            </p>
          </div>
          <Link href="/all-recipes" className="shrink-0 text-sm font-semibold text-link hover:underline">
            <span className="sm:hidden">See all</span>
            <span className="hidden sm:inline">See all recipes →</span>
          </Link>
        </div>

        {recipesOfTheDay.length === 0 ? (
          <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">No recipes to show yet.</p>
        ) : (
          // Mobile: horizontal swipe row with scroll snapping.
          // From md: a normal 3-column grid.
          <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
            {recipesOfTheDay.map(({ meal, recipe }) => (
              <div key={recipe.id} className="grid w-[290px] shrink-0 snap-start md:w-auto">
                <RecipeCard meal={meal} recipe={recipe} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Welcome */}
      <section className="bg-base-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">✨🍱 Welcome to YOUR new Kitchen! 🍳✨</h2>
            <p className="leading-relaxed text-base-content/80">
              Whether you are looking for a quick dinner after a long day, craving something sweet, or simply curious
              about what you can create with a handful of good ingredients — we are happy to have you here! This recipe
              collection is a place to explore, discover new ideas, and maybe even find your next favorite dish.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group flex flex-col gap-2 rounded-box border border-base-300 bg-base-200 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span aria-hidden="true" className="text-3xl">
                  {feature.emoji}
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="flex-1 text-sm text-base-content/70">{feature.text}</p>
                <span className="text-sm font-semibold text-link group-hover:underline">{feature.cta} →</span>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {STORIES.map((story) => (
              <article key={story.title} className="flex flex-col gap-3 rounded-box bg-base-200 p-6 sm:p-7">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <span aria-hidden="true">{story.emoji}</span>
                  {story.title}
                </h3>
                {story.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="text-sm leading-relaxed text-base-content/80">
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>

          <p className="mx-auto max-w-3xl rounded-3xl bg-base-200 px-6 py-4 text-center font-semibold shadow-sm sm:rounded-full">
            Roll up your sleeves, turn on the oven, sharpen those knives — and let the cooking begin. 👨‍🍳👩‍🍳
          </p>
        </div>
      </section>
    </div>
  );
}

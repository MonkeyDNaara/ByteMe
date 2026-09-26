import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import EmptyState from "@/app/components/EmptyState";
import { auth } from "@/lib/auth/server";
import { getAllRecipes, isOptimizableImageUrl, type Recipe } from "@/lib/recipe";
import { getMyCustomShoppingListItems, getMyShoppingListItems, getMyShoppingListRecipeIds } from "@/lib/shoppingList";

import RemoveFromShoppingListButton from "./RemoveFromShoppingListButton";
import ShoppingListBoard from "./ShoppingListBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shopping List",
};

export default async function ShoppingListPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Shopping list 🛒</h1>
        <EmptyState
          emoji="🛒"
          title="Sign in to unlock this"
          text="Favorites and your shopping list live in your account — saved on every device."
          primary={{ label: "Sign in", href: "/auth/sign-in" }}
          secondary={{ label: "Create account", href: "/auth/sign-up" }}
        />
      </div>
    );
  }

  const [recipeIds, items, allRecipes, customItems] = await Promise.all([
    getMyShoppingListRecipeIds(),
    getMyShoppingListItems(),
    getAllRecipes(),
    getMyCustomShoppingListItems(),
  ]);
  const recipes = allRecipes.filter((recipe) => recipeIds.includes(recipe.id));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <ShoppingListBoard
        // useState(initialItems) only reads its prop ONCE. After a recipe is
        // removed, router.refresh() brings new ingredients -- the new key
        // makes React create a fresh board with those new values.
        key={recipeIds.join(",")}
        initialItems={items}
        initialCustomItems={customItems}
        recipeCount={recipes.length}
        // A Server Component rendered here and handed to a Client Component
        // as a prop ("interleaving"): it stays server-rendered.
        sidebar={<RecipesSidebar recipes={recipes} />}
      />
    </div>
  );
}

function RecipesSidebar({ recipes }: { recipes: Recipe[] }) {
  return (
    <aside
      aria-labelledby="list-recipes-title"
      className="flex flex-col gap-3 rounded-box border border-base-300 bg-base-200 p-5 sm:p-6 lg:sticky lg:top-24"
    >
      <div className="flex items-baseline justify-between">
        <h2 id="list-recipes-title" className="text-xl font-bold">
          📖 Recipes on your list
        </h2>
        <span className="text-sm text-base-content/50">{recipes.length}</span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-2.5">
            <span className="relative h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-base-300">
              <Image
                src={recipe.image_url}
                alt=""
                fill
                sizes="52px"
                className="object-cover"
                unoptimized={!isOptimizableImageUrl(recipe.image_url)}
              />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              {/* Opens the recipe as a modal over the list (intercepting route) */}
              <Link href={`/recipe/${recipe.id}`} className="truncate font-semibold hover:text-link hover:underline">
                {recipe.name}
              </Link>
              <span className="text-sm text-base-content/60">
                ⏱ {recipe.time} min · {recipe.ingredientDetails.length}{" "}
                {recipe.ingredientDetails.length === 1 ? "ingredient" : "ingredients"}
              </span>
            </div>
            <RemoveFromShoppingListButton recipeId={recipe.id} recipeName={recipe.name} />
          </li>
        ))}
      </ul>

      <Link
        href="/all-recipes"
        className="mt-1 flex h-11 items-center justify-center rounded-full border border-dashed border-primary text-sm font-semibold text-link transition-colors hover:bg-primary/15"
      >
        + Add more recipes
      </Link>
    </aside>
  );
}

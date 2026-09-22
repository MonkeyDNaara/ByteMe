import Link from "next/link";
import type { Metadata } from "next";

import RemoveFromShoppingListButton from "@/app/shopping-list/RemoveFromShoppingListButton";
import ShoppingListItemRow from "@/app/shopping-list/ShoppingListItemRow";
import { auth } from "@/lib/auth/server";
import { getAllRecipes } from "@/lib/recipe";
import { getMyShoppingListItems, getMyShoppingListRecipeIds } from "@/lib/shoppingList";

export const dynamic = "force-dynamic";

export default async function ShoppingListPage() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Shopping list
          </h1>
        </header>

        <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">
          <Link href="/auth/sign-in" className="link link-primary">
            Sign in
          </Link>{" "}
          to build a shopping list from your recipes.
        </p>
      </div>
    );
  }

  const [recipeIds, items, allRecipes] = await Promise.all([
    getMyShoppingListRecipeIds(),
    getMyShoppingListItems(),
    getAllRecipes(),
  ]);
  const recipes = allRecipes.filter((recipe) => recipeIds.includes(recipe.id));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Shopping list
        </h1>
        <p className="text-sm text-base-content/70">
          Ingredients from the recipes below, combined automatically. Matching
          only works for the exact same ingredient name and unit, so
          &ldquo;Milk&rdquo; (ml) from two recipes will add up, but
          &ldquo;Milk&rdquo; and &ldquo;Whole milk&rdquo; won&apos;t.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Recipes on your list</h2>

        {recipes.length === 0 ? (
          <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">
            No recipes yet.{" "}
            <Link href="/all-recipes" className="link link-primary">
              Browse all recipes
            </Link>{" "}
            and tap the cart icon on ones you want to cook.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recipes.map((recipe) => (
              <li
                key={recipe.id}
                className="flex items-center justify-between rounded-box bg-base-200 px-4 py-3"
              >
                <Link
                  href={`/recipe/${recipe.id}`}
                  className="link link-hover"
                >
                  {recipe.name}
                </Link>
                <RemoveFromShoppingListButton recipeId={recipe.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {items.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Ingredients to buy</h2>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <ShoppingListItemRow
                key={`${item.name}-${item.unit}`}
                item={item}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export const metadata: Metadata = {
  title: "Shopping List",
};

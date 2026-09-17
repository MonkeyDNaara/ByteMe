import FavoritesGrid from "@/app/components/FavoritesGrid";
import { getAllRecipes } from "@/lib/recipe";
import type { Metadata } from "next";

export default async function FavoritesPage() {
  const recipes = await getAllRecipes();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Favorites</h1>
        <p className="max-w-2xl text-sm text-base-content/70">
          The recipes you&apos;ve saved with the heart button, all in one place.
        </p>
      </header>

      <FavoritesGrid recipes={recipes} />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Favorites",
};

import type { Metadata } from "next";

import EmptyState from "@/app/components/EmptyState";
import FavoritesGrid from "@/app/components/FavoritesGrid";
import { filtersKey, parseFilterParams, type RawSearchParams } from "@/app/components/recipe-filters/filterParams";
import { auth } from "@/lib/auth/server";
import { getMyFavoriteIds } from "@/lib/favorites";
import { getAllRecipes } from "@/lib/recipe";

export const metadata: Metadata = {
  title: "Favorites",
};

export default async function FavoritesPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const { data: session } = await auth.getSession();
  const initialFilters = parseFilterParams(await searchParams);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Favorites 💜</h1>
        <p className="text-sm text-base-content/70 sm:text-base">
          The recipes you&apos;ve saved with the heart button, all in one place.
        </p>
      </header>

      {session?.user ? (
        <SignedInFavorites initialFilters={initialFilters} />
      ) : (
        <EmptyState
          emoji="💜"
          title="Sign in to unlock this"
          text="Favorites and your shopping list live in your account — saved on every device."
          primary={{ label: "Sign in", href: "/auth/sign-in" }}
          secondary={{ label: "Create account", href: "/auth/sign-up" }}
        />
      )}
    </div>
  );
}

async function SignedInFavorites({ initialFilters }: { initialFilters: ReturnType<typeof parseFilterParams> }) {
  // Both requests are independent, so they run in parallel instead of one after the other.
  const [recipes, favoriteIds] = await Promise.all([getAllRecipes(), getMyFavoriteIds()]);

  return (
    <FavoritesGrid
      key={filtersKey(initialFilters)}
      recipes={recipes}
      initialFavoriteIds={favoriteIds}
      initialFilters={initialFilters}
    />
  );
}

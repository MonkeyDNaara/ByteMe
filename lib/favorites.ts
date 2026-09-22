"use server";

import {
  addFavorite,
  getFavoriteRecipeIds,
  importFavorites,
  removeFavorite,
} from "@/dbQueries";
import { auth } from "@/lib/auth/server";

/**
 * This is its own "use server" file (rather than living in lib/recipe.ts) so
 * it can be imported directly into Client Components (FavoriteButton,
 * useFavorites), the same reasoning the old lib/likes.ts followed.
 */

/** The signed-in user's favorite recipe ids, or `[]` if there's no session. */
export async function getMyFavoriteIds(): Promise<string[]> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return [];

  const ids = await getFavoriteRecipeIds(session.user.id);
  return ids.map(String);
}

/**
 * Adds or removes a favorite for the signed-in user. Best-effort: the
 * optimistic UI update in useFavorites doesn't wait on this, so a failure
 * here is logged rather than surfaced.
 */
export async function setFavorite(
  recipeId: string,
  isFavorite: boolean,
): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return;

  const numericId = Number(recipeId);
  if (!Number.isFinite(numericId)) return;

  try {
    if (isFavorite) {
      await addFavorite(session.user.id, numericId);
    } else {
      await removeFavorite(session.user.id, numericId);
    }
  } catch (error) {
    console.error(`Failed to update favorite for recipe ${recipeId}:`, error);
  }
}

/**
 * One-time import of favorites saved in localStorage before accounts
 * existed. Called by useFavorites the first time it runs for a signed-in
 * user; ids for recipes that no longer exist are silently skipped rather
 * than failing the whole import (see importFavorites in dbQueries.ts).
 */
export async function importLocalFavorites(
  recipeIds: string[],
): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return;

  const numericIds = recipeIds.map(Number).filter(Number.isFinite);
  if (numericIds.length === 0) return;

  try {
    await importFavorites(session.user.id, numericIds);
  } catch (error) {
    console.error("Failed to import local favorites:", error);
  }
}

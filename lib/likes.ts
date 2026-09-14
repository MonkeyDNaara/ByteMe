"use server";

import { updateRecipeLikes } from "@/dbQueries";

/**
 * Keeps a recipe's `likes` count in sync with its favourite state: +1 when
 * it's favourited, -1 (clamped at 0 in SQL) when un-favourited.
 *
 * Best-effort: favouriting itself lives in localStorage (see
 * `lib/useFavorites.ts`) and doesn't depend on this succeeding — a failed
 * write here is logged, not surfaced to the user.
 *
 * This is its own "use server" file (rather than living in lib/recipe.ts)
 * so it can be imported directly into a Client Component (FavoriteButton).
 */
export async function setRecipeLiked(
  id: string,
  liked: boolean,
): Promise<void> {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return;

  try {
    await updateRecipeLikes(numericId, liked ? 1 : -1);
  } catch (error) {
    console.error(`Failed to update likes for recipe ${id}:`, error);
  }
}

"use client";

import { useFavorites } from "@/lib/useFavorites";

type LikesCountProps = {
  recipeId: string;
  /** Like count from the server render. */
  likes: number;
  /** Whether the user's own like was already included in `likes`. */
  initiallyFavorite: boolean;
};

/**
 * A tiny client "island" in an otherwise server-rendered page: the count
 * follows the ♡ button live, without a server round trip.
 * Count = server count - my old like + my current like.
 */
export default function LikesCount({ recipeId, likes, initiallyFavorite }: LikesCountProps) {
  const { isFavorite, isLoaded } = useFavorites();
  const isFavoriteNow = isLoaded ? isFavorite(recipeId) : initiallyFavorite;
  const count = Math.max(likes - (initiallyFavorite ? 1 : 0) + (isFavoriteNow ? 1 : 0), 0);

  return <>{count}</>;
}

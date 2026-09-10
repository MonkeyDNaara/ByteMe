"use client";

import type { MouseEvent } from "react";

import { useFavorites } from "@/lib/useFavorites";

type FavoriteButtonProps = {
  recipeId: string;
  /** "sm" for recipe cards, "md" for the recipe detail page. */
  size?: "sm" | "md";
  className?: string;
};

export default function FavoriteButton({
  recipeId,
  size = "sm",
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(recipeId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // The button can sit inside a card that is itself a link.
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(recipeId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remove from favourites" : "Save to favourites"}
      className={`btn btn-circle border-none bg-base-100/80 text-error shadow-sm hover:bg-base-100 ${
        size === "md" ? "btn-md text-2xl" : "btn-sm text-lg"
      } ${className}`}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}

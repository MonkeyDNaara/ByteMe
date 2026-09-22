"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { useFavorites } from "@/lib/useFavorites";

type FavoriteButtonProps = {
  recipeId: string;
  /** "sm" for recipe cards, "md" for the recipe detail page. */
  size?: "sm" | "md";
  className?: string;
  /** Called with the new favourite state right when the button is pressed, so a caller can update a displayed like count optimistically. */
  onToggle?: (isFavorite: boolean) => void;
};

export default function FavoriteButton({
  recipeId,
  size = "sm",
  className = "",
  onToggle,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite, isLoggedIn } = useFavorites();
  const active = isFavorite(recipeId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // The button can sit inside a card that is itself a link.
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      router.push("/auth/sign-in");
      return;
    }

    const nextActive = !active;
    toggleFavorite(recipeId);
    onToggle?.(nextActive);
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

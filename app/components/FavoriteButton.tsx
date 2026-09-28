"use client";

import { useState, type MouseEvent } from "react";

import { useToast } from "@/app/components/toast/ToastProvider";
import { currentPath, withNext } from "@/lib/auth/safeNext";
import { useFavorites } from "@/lib/useFavorites";

type FavoriteButtonProps = {
  recipeId: string;
  /** "sm" for recipe cards, "md" for the recipe detail page. */
  size?: "sm" | "md";
  className?: string;
  /** Called with the new favourite state right when the button is pressed, so a caller can update a displayed like count optimistically. */
  onToggle?: (isFavorite: boolean) => void;
};

export default function FavoriteButton({ recipeId, size = "sm", className = "", onToggle }: FavoriteButtonProps) {
  const showToast = useToast();
  const { isFavorite, toggleFavorite, setFavoriteState, isLoggedIn } = useFavorites();
  const active = isFavorite(recipeId);
  // Changing this key remounts the icon, which restarts its CSS animation.
  const [popKey, setPopKey] = useState(0);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // The button can sit inside a card that is itself a link.
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      showToast({
        message: "Sign in to save your favorite recipes",
        action: { label: "Sign in", href: withNext("/auth/sign-in", currentPath()) },
      });
      return;
    }

    const nextActive = !active;
    toggleFavorite(recipeId);
    onToggle?.(nextActive);

    if (nextActive) {
      setPopKey((key) => key + 1);
      showToast({ message: "💜 Saved to favorites", action: { label: "View", href: "/favorites" } });
    } else {
      showToast({
        message: "Removed from favorites",
        action: {
          label: "Undo",
          onClick: () => {
            // Only adjust the like count if the undo really changed something.
            if (setFavoriteState(recipeId, true)) onToggle?.(true);
          },
        },
      });
    }
  };

  // Size via daisyUI's `--size` variable (btn-circle uses it for width AND
  // height), so a caller's `className="h-14 w-14"` can still override it.
  // md = 44px; sm = 40px visible + `hit-area` for a 44px touch target.
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Save to favorites"}
      className={`btn btn-circle relative border-none bg-base-100/90 ring-1 ring-base-content/10 text-error shadow-md hover:bg-base-100 ${
        size === "md" ? "text-2xl [--size:2.75rem]" : "hit-area text-lg [--size:2.5rem]"
      } ${className}`}
    >
      <span key={popKey} aria-hidden="true" className={`inline-block ${popKey > 0 ? "motion-safe:animate-pop" : ""}`}>
        {active ? "♥" : "♡"}
      </span>
    </button>
  );
}

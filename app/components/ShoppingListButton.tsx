"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";

import { useShoppingList } from "@/lib/useShoppingList";

type ShoppingListButtonProps = {
  recipeId: string;
  /** "sm" for recipe cards, "md" for the recipe detail page. */
  size?: "sm" | "md";
  className?: string;
};

export default function ShoppingListButton({
  recipeId,
  size = "sm",
  className = "",
}: ShoppingListButtonProps) {
  const router = useRouter();
  const { isOnList, toggleOnList, isLoggedIn } = useShoppingList();
  const active = isOnList(recipeId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // The button can sit inside a card that is itself a link.
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      router.push("/auth/sign-in");
      return;
    }

    toggleOnList(recipeId);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? "Remove from shopping list" : "Add to shopping list"}
      className={`btn btn-circle border-none bg-base-100/80 shadow-sm hover:bg-base-100 ${
        active ? "text-primary" : "text-base-content/70"
      } ${size === "md" ? "btn-md text-2xl" : "btn-sm text-lg"} ${className}`}
    >
      🛒
    </button>
  );
}

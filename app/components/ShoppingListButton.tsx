"use client";

import { useState, type MouseEvent } from "react";

import { useToast } from "@/app/components/toast/ToastProvider";
import { useShoppingList } from "@/lib/useShoppingList";

type ShoppingListButtonProps = {
  recipeId: string;
  /** "sm" for recipe cards, "md" for the recipe detail page. */
  size?: "sm" | "md";
  /** Show a text label: "full" = "Add to shopping list", "short" = "Add". Default: icon only. */
  label?: "full" | "short";
  className?: string;
};

export default function ShoppingListButton({ recipeId, size = "sm", label, className = "" }: ShoppingListButtonProps) {
  const showToast = useToast();
  const { isOnList, toggleOnList, setOnListState, isLoggedIn } = useShoppingList();
  const active = isOnList(recipeId);
  // Changing this key remounts the icon, which restarts its CSS animation.
  const [hopKey, setHopKey] = useState(0);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // The button can sit inside a card that is itself a link.
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn) {
      showToast({
        message: "Sign in to use your shopping list",
        action: { label: "Sign in", href: "/auth/sign-in" },
      });
      return;
    }

    const nextActive = !active;
    toggleOnList(recipeId);

    if (nextActive) {
      setHopKey((key) => key + 1);
      showToast({ message: "🛒 Added to your shopping list", action: { label: "View list", href: "/shopping-list" } });
    } else {
      showToast({
        message: "Removed from your shopping list",
        action: { label: "Undo", onClick: () => setOnListState(recipeId, true) },
      });
    }
  };

  const icon = (
    <span key={hopKey} aria-hidden="true" className={`inline-block ${hopKey > 0 ? "motion-safe:animate-hop" : ""}`}>
      🛒
    </span>
  );

  if (label) {
    const text = active
      ? label === "full"
        ? "On your shopping list"
        : "Added"
      : label === "full"
        ? "Add to shopping list"
        : "Add";
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        className={`btn h-12 gap-2 rounded-full px-5 font-semibold ${
          active ? "border-primary bg-primary/25" : "border-primary bg-base-100 hover:bg-primary/15"
        } ${className}`}
      >
        {icon}
        {text}
        {active && <span aria-hidden="true">✓</span>}
      </button>
    );
  }

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
      {icon}
    </button>
  );
}

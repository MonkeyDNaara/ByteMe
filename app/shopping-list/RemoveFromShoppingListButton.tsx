"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setOnShoppingList } from "@/lib/shoppingList";

type RemoveFromShoppingListButtonProps = {
  recipeId: string;
};

export default function RemoveFromShoppingListButton({
  recipeId,
}: RemoveFromShoppingListButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await setOnShoppingList(recipeId, false);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="btn btn-ghost btn-sm"
    >
      Remove
    </button>
  );
}

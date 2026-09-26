"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/app/components/toast/ToastProvider";
import { setOnShoppingList } from "@/lib/shoppingList";
import { useShoppingList } from "@/lib/useShoppingList";

type RemoveFromShoppingListButtonProps = {
  recipeId: string;
  recipeName: string;
};

export default function RemoveFromShoppingListButton({ recipeId, recipeName }: RemoveFromShoppingListButtonProps) {
  const router = useRouter();
  const showToast = useToast();
  const { setOnListState } = useShoppingList();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // Keeps the 🛒 buttons on other pages in sync (shared client cache).
    setOnListState(recipeId, false);
    startTransition(async () => {
      // Awaited on purpose: the refresh below must see the updated database,
      // otherwise the removed recipe's ingredients would still be listed.
      await setOnShoppingList(recipeId, false);
      router.refresh();
      showToast({ message: `Removed “${recipeName}” from your shopping list` });
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Remove ${recipeName} from the shopping list`}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-sm text-base-content/60 transition-colors hover:bg-error/15 hover:text-error disabled:opacity-50"
    >
      {isPending ? <span className="loading loading-spinner loading-xs" /> : "✕"}
    </button>
  );
}

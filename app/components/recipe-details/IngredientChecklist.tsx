"use client";

import { useState, useTransition } from "react";

import { useToast } from "@/app/components/toast/ToastProvider";
import { currentPath, withNext } from "@/lib/auth/safeNext";
import type { IngredientDetail } from "@/lib/recipe";
import { saveMyRecipeToShoppingList, type CheckedItemKey } from "@/lib/shoppingList";
import { useShoppingList } from "@/lib/useShoppingList";

import { formatAmount } from "./IngredientList";

type IngredientChecklistProps = {
  recipeId: string;
  ingredients: IngredientDetail[];
  /** What the user already has, loaded from the DB (only if the recipe is on their list). */
  initialHave: CheckedItemKey[];
};

// The DB identifies an ingredient by (name, unit), so the UI does too.
// \u0000 can't appear in a name, so the key can't collide ("a b" + "c" vs "a" + "b c").
const keyOf = ({ name, unit }: CheckedItemKey) => `${name}\u0000${unit}`;
// Order-independent snapshot of a Set, to compare "ticked now" with "saved".
const snapshot = (keys: Set<string>) => [...keys].sort().join("\u0001");

/**
 * Detail page ingredient card: tick off what you already have, then
 * "Add missing to shopping list". Ticks are saved per recipe in
 * shopping_list_have_items, and the shopping list only shows the rest.
 */
export default function IngredientChecklist({ recipeId, ingredients, initialHave }: IngredientChecklistProps) {
  const showToast = useToast();
  const { isOnList, markOnList, isLoggedIn } = useShoppingList();
  const onList = isOnList(recipeId);
  const [isPending, startTransition] = useTransition();

  const [have, setHave] = useState(() => new Set(initialHave.map(keyOf)));
  // What the DB currently has -- compared with `have` to know if there are unsaved ticks.
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(new Set(initialHave.map(keyOf))));

  // If the recipe gets removed from the list (e.g. the 🛒 button above), the
  // DB deletes its "have" rows (ON DELETE CASCADE), so nothing is saved anymore.
  // Adjusting state during render when a value changes -- no useEffect needed:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevOnList, setPrevOnList] = useState(onList);
  if (onList !== prevOnList) {
    setPrevOnList(onList);
    if (!onList) setSavedSnapshot("");
  }

  if (ingredients.length === 0) {
    return <p className="text-sm text-base-content/70">No ingredients listed.</p>;
  }

  // A recipe can list the same (name, unit) twice -- count it once.
  const uniqueKeys = [...new Set(ingredients.map(keyOf))];
  const missing = uniqueKeys.filter((key) => !have.has(key)).length;
  const isDirty = snapshot(have) !== savedSnapshot;

  const toggle = (key: string) => {
    setHave((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSave = () => {
    if (!isLoggedIn) {
      showToast({
        message: "Sign in to use your shopping list",
        action: { label: "Sign in", href: withNext("/auth/sign-in", currentPath()) },
      });
      return;
    }

    const wasOnList = onList;
    const haveItems = ingredients.filter((item) => have.has(keyOf(item))).map(({ name, unit }) => ({ name, unit }));
    const savedAs = snapshot(have);

    startTransition(async () => {
      const ok = await saveMyRecipeToShoppingList(recipeId, haveItems);
      if (!ok) {
        showToast({ message: "Couldn't update your shopping list. Please try again." });
        return;
      }
      markOnList(recipeId);
      setSavedSnapshot(savedAs);
      showToast({
        message: wasOnList
          ? "🛒 Shopping list updated"
          : `🛒 Added ${missing} missing ${missing === 1 ? "ingredient" : "ingredients"}`,
        action: { label: "View list", href: "/shopping-list" },
      });
    });
  };

  let buttonText: string;
  let disabled = isPending;
  if (onList) {
    buttonText = isDirty ? "🛒 Update shopping list" : "✓ On your shopping list";
    disabled ||= !isDirty;
  } else if (missing === 0) {
    buttonText = "✓ You have everything";
    disabled = true;
  } else if (missing === uniqueKeys.length) {
    buttonText = "🛒 Add all to shopping list";
  } else {
    buttonText = `🛒 Add ${missing} missing to shopping list`;
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid">
        {ingredients.map((ingredient, index) => {
          const key = keyOf(ingredient);
          const checked = have.has(key);
          const faded = checked ? "text-base-content/40 line-through" : "";
          return (
            <li key={`${key}-${index}`} className="border-b border-base-300 last:border-b-0">
              {/* The whole row is the <label>: a big touch target that toggles the checkbox. */}
              <label className="grid min-h-11 cursor-pointer grid-cols-[auto_5.5rem_minmax(0,1fr)] items-center gap-3 py-2 text-[15px]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className={`font-bold ${faded}`}>{formatAmount(ingredient)}</span>
                <span className={faded}>{ingredient.name}</span>
              </label>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleSave}
        disabled={disabled}
        className="btn h-11 min-h-11 rounded-full border-primary bg-base-100 font-semibold hover:bg-primary/15"
      >
        {isPending && <span className="loading loading-spinner loading-xs" aria-hidden="true" />}
        {buttonText}
      </button>
    </div>
  );
}

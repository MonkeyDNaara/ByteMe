"use client";

import { useState } from "react";

import { formatIngredientLine } from "@/lib/recipe";
import { setShoppingListItemCheckedAction } from "@/lib/shoppingList";

type ShoppingListItemRowProps = {
  item: { name: string; unit: string; amount: number | null; checked: boolean };
};

export default function ShoppingListItemRow({ item }: ShoppingListItemRowProps) {
  const [checked, setChecked] = useState(item.checked);

  const handleChange = () => {
    const next = !checked;
    setChecked(next);
    // Best-effort DB sync, same as the favorite/shopping-list toggle buttons.
    void setShoppingListItemCheckedAction(item.name, item.unit, next);
  };

  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-field px-2 py-1.5 text-sm hover:bg-base-200 ${
        checked ? "text-base-content/40 line-through" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="checkbox checkbox-sm"
      />
      {formatIngredientLine(item)}
    </label>
  );
}

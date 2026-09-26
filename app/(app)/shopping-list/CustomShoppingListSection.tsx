"use client";

import { useState } from "react";

import { formatIngredientLine, INGREDIENT_UNITS } from "@/lib/recipe";
import {
  addMyCustomShoppingListItem,
  removeMyCustomShoppingListItem,
  setMyCustomShoppingListItemChecked,
  type CustomShoppingListItem,
} from "@/lib/shoppingList";

type CustomShoppingListSectionProps = {
  initialItems: CustomShoppingListItem[];
};

export default function CustomShoppingListSection({
  initialItems,
}: CustomShoppingListSectionProps) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");

  const handleAdd = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const parsedAmount = amount.trim() === "" ? null : Number(amount);
    const finalAmount =
      parsedAmount != null && Number.isFinite(parsedAmount)
        ? parsedAmount
        : null;

    setName("");
    setAmount("");
    setUnit("");

    const created = await addMyCustomShoppingListItem(
      trimmedName,
      finalAmount,
      unit,
    );
    if (created) setItems((current) => [...current, created]);
  };

  const handleToggle = (item: CustomShoppingListItem) => {
    const next = !item.checked;
    setItems((current) =>
      current.map((existing) =>
        existing.id === item.id ? { ...existing, checked: next } : existing,
      ),
    );
    // Best-effort DB sync, same as the favorite/shopping-list toggle buttons.
    void setMyCustomShoppingListItemChecked(item.id, next);
  };

  const handleRemove = (item: CustomShoppingListItem) => {
    setItems((current) => current.filter((existing) => existing.id !== item.id));
    void removeMyCustomShoppingListItem(item.id);
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Your own items</h2>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="number"
          step="any"
          min="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
          aria-label="Item amount"
          className="input input-bordered w-full sm:w-24"
        />
        <select
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          aria-label="Item unit"
          className="select select-bordered w-full sm:w-32"
        >
          <option value="">(no unit)</option>
          {INGREDIENT_UNITS.map((unitOption) => (
            <option key={unitOption} value={unitOption}>
              {unitOption}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Paper towels"
          aria-label="Item name"
          className="input input-bordered w-full"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-primary btn-sm shrink-0"
        >
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-base-content/60">No items added yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between gap-2 rounded-field px-2 py-1.5 text-sm hover:bg-base-200 ${
                item.checked ? "text-base-content/40 line-through" : ""
              }`}
            >
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleToggle(item)}
                  className="checkbox checkbox-sm"
                />
                {formatIngredientLine(item)}
              </label>
              <button
                type="button"
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item.name}`}
                className="text-base-content/60 hover:text-error"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

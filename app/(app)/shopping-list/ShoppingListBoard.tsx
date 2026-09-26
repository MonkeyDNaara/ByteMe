"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import EmptyState from "@/app/components/EmptyState";
import { INGREDIENT_UNITS } from "@/lib/recipe";
import {
  addMyCustomShoppingListItem,
  removeMyCustomShoppingListItem,
  setMyCustomShoppingListItemChecked,
  setShoppingListItemCheckedAction,
  type CustomShoppingListItem,
  type ShoppingListSummaryItem,
} from "@/lib/shoppingList";

import CheckRow from "./CheckRow";

type ShoppingListBoardProps = {
  initialItems: ShoppingListSummaryItem[];
  initialCustomItems: CustomShoppingListItem[];
  recipeCount: number;
  /** Server-rendered "Recipes on your list" card, passed through as a prop. */
  sidebar: ReactNode;
};

const cardClass = "flex flex-col gap-1 rounded-box border border-base-300 bg-base-200 p-5 sm:p-7";
const fieldClass = "h-11 rounded-full border border-base-300 bg-base-100 px-4 text-[15px] outline-none focus:border-primary";

/**
 * ALL checked states of the page live here ("lifting state up"), so the
 * progress bar, the open list and "Already in the cart" always agree.
 */
export default function ShoppingListBoard({
  initialItems,
  initialCustomItems,
  recipeCount,
  sidebar,
}: ShoppingListBoardProps) {
  const [items, setItems] = useState(initialItems);
  const [customItems, setCustomItems] = useState(initialCustomItems);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");

  // --- Recipe ingredients ---------------------------------------------------
  const toggleItem = (item: ShoppingListSummaryItem) => {
    const next = !item.checked;
    setItems((current) =>
      current.map((existing) =>
        existing.name === item.name && existing.unit === item.unit ? { ...existing, checked: next } : existing,
      ),
    );
    // Optimistic: the UI updates immediately, the DB write runs in the background.
    void setShoppingListItemCheckedAction(item.name, item.unit, next);
  };

  // --- Own items ------------------------------------------------------------
  const toggleCustom = (item: CustomShoppingListItem) => {
    const next = !item.checked;
    setCustomItems((current) => current.map((existing) => (existing.id === item.id ? { ...existing, checked: next } : existing)));
    void setMyCustomShoppingListItemChecked(item.id, next);
  };

  const removeCustom = (item: CustomShoppingListItem) => {
    setCustomItems((current) => current.filter((existing) => existing.id !== item.id));
    void removeMyCustomShoppingListItem(item.id);
  };

  // A real <form>: Enter in any field adds the item, no extra key handling.
  const addCustom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const parsedAmount = amount.trim() === "" ? null : Number(amount);
    const finalAmount = parsedAmount != null && Number.isFinite(parsedAmount) ? parsedAmount : null;

    setName("");
    setAmount("");
    setUnit("");

    const created = await addMyCustomShoppingListItem(trimmedName, finalAmount, unit);
    if (created) setCustomItems((current) => [...current, created]);
  };

  // --- Derived values (computed on every render, never stored) -------------
  const openItems = items.filter((item) => !item.checked);
  const doneItems = items.filter((item) => item.checked);
  // Unchecked own items first, ticked ones sink to the bottom.
  const sortedCustom = [...customItems].sort((a, b) => Number(a.checked) - Number(b.checked));

  const total = items.length + customItems.length;
  const done = doneItems.length + customItems.filter((item) => item.checked).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const hasRecipeContent = recipeCount > 0 || items.length > 0;

  return (
    <div className="flex flex-col gap-7">
      {/* Title + progress */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Shopping list 🛒</h1>
          <p className="text-base-content/70">
            {recipeCount > 0
              ? `Everything you need for your ${recipeCount} ${recipeCount === 1 ? "recipe" : "recipes"} — combined automatically.`
              : "Tap 🛒 on a recipe, or add your own items below."}
          </p>
        </div>

        {total > 0 && (
          <div className="flex w-full flex-col gap-2 sm:w-80">
            <div className="flex justify-between text-sm">
              <span className="font-bold">
                {done === total ? "🎉 Everything's in the cart!" : `${done} of ${total} in the cart`}
              </span>
              <span className="text-base-content/50">{percent} %</span>
            </div>
            <div
              role="progressbar"
              aria-label="Items in the cart"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={done}
              className="h-2.5 overflow-hidden rounded-full bg-base-300"
            >
              <div
                className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300 ${
                  done === total ? "bg-success" : "bg-link"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className={`grid items-start gap-7 ${recipeCount > 0 ? "lg:grid-cols-[minmax(0,1fr)_360px]" : ""}`}>
        <div className="flex flex-col gap-6">
          {hasRecipeContent ? (
            <section className={cardClass} aria-labelledby="ingredients-title">
              <div className="flex items-baseline justify-between pb-2">
                <h2 id="ingredients-title" className="text-xl font-bold">
                  🥕 Ingredients to buy
                </h2>
                <span className="text-sm text-base-content/50">{openItems.length} left</span>
              </div>

              {openItems.length > 0 ? (
                <ul>
                  {openItems.map((item) => (
                    <CheckRow
                      key={`${item.name}-${item.unit}`}
                      name={item.name}
                      amount={item.amount}
                      unit={item.unit}
                      checked={false}
                      onToggle={() => toggleItem(item)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="px-2 py-3 text-base-content/60">All recipe ingredients are in the cart. 🎉</p>
              )}

              {doneItems.length > 0 && (
                // Native <details>: collapsible without any state or JavaScript.
                <details className="mt-2 border-t border-dashed border-base-300 pt-3">
                  <summary className="cursor-pointer rounded-xl px-2 py-1.5 text-sm font-semibold text-base-content/70 hover:bg-base-300/60">
                    ✓ Already in the cart ({doneItems.length})
                  </summary>
                  <ul className="mt-1">
                    {doneItems.map((item) => (
                      <CheckRow
                        key={`${item.name}-${item.unit}`}
                        name={item.name}
                        amount={item.amount}
                        unit={item.unit}
                        checked
                        onToggle={() => toggleItem(item)}
                      />
                    ))}
                  </ul>
                </details>
              )}

              <p className="mt-3 rounded-2xl bg-base-300 px-4 py-3 text-sm leading-relaxed text-base-content/70">
                💡 Same name + same unit add up: &ldquo;Milk (ml)&rdquo; from two recipes becomes one line —
                &ldquo;Milk&rdquo; and &ldquo;Whole milk&rdquo; stay separate.
              </p>
            </section>
          ) : (
            <EmptyState
              emoji="📝"
              title="Nothing to buy yet"
              text="Tap 🛒 on a recipe and its ingredients show up here — or add your own items below."
              primary={{ label: "Find a recipe", href: "/all-recipes" }}
            />
          )}

          <section className={cardClass} aria-labelledby="own-items-title">
            <h2 id="own-items-title" className="pb-2 text-xl font-bold">
              🧻 Your own items
            </h2>

            <form onSubmit={addCustom} className="flex flex-wrap gap-2 sm:flex-nowrap">
              <label htmlFor="own-amount" className="sr-only">
                Amount
              </label>
              <input
                id="own-amount"
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="2"
                className={`${fieldClass} w-20`}
              />
              <label htmlFor="own-unit" className="sr-only">
                Unit
              </label>
              <select
                id="own-unit"
                value={unit}
                onChange={(event) => setUnit(event.target.value)}
                className={`${fieldClass} w-28`}
              >
                <option value="">no unit</option>
                {INGREDIENT_UNITS.map((unitOption) => (
                  <option key={unitOption} value={unitOption}>
                    {unitOption}
                  </option>
                ))}
              </select>
              <label htmlFor="own-name" className="sr-only">
                Item
              </label>
              <input
                id="own-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Paper towels, coffee, …"
                className={`${fieldClass} min-w-40 flex-1`}
              />
              <button type="submit" className="btn btn-primary h-11 min-h-11 rounded-full px-5 font-bold max-sm:w-full">
                + Add
              </button>
            </form>

            {sortedCustom.length > 0 ? (
              <ul className="mt-2">
                {sortedCustom.map((item) => (
                  <CheckRow
                    key={item.id}
                    name={item.name}
                    amount={item.amount}
                    unit={item.unit}
                    checked={item.checked}
                    onToggle={() => toggleCustom(item)}
                    onRemove={() => removeCustom(item)}
                  />
                ))}
              </ul>
            ) : (
              <p className="px-2 pt-3 text-sm text-base-content/60">Nothing added yet.</p>
            )}
          </section>
        </div>

        {recipeCount > 0 && sidebar}
      </div>
    </div>
  );
}

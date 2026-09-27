"use client";

import { useState, type KeyboardEvent } from "react";

import { formatAmount } from "@/app/components/recipe-details/IngredientList";
import { INGREDIENT_UNITS, type IngredientDetail } from "@/lib/recipe";

import { fieldClass } from "./fieldStyles";

type IngredientsEditorProps = {
  value: IngredientDetail[];
  onChange: (ingredients: IngredientDetail[]) => void;
};

/**
 * Controlled component: the list itself lives in the parent (the preview and
 * checklist need it); this component only owns the half-typed "draft" row.
 */
export default function IngredientsEditor({ value, onChange }: IngredientsEditorProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");

  const add = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const parsed = amount.trim() === "" ? null : Number(amount);
    const finalAmount = parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    onChange([...value, { name: trimmedName, amount: finalAmount, unit }]);
    setName("");
    setAmount("");
    setUnit("");
  };

  // Enter adds the ingredient instead of submitting the whole recipe form.
  const addOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      add();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <label htmlFor="ingredient-amount" className="sr-only">
          Amount
        </label>
        <input
          id="ingredient-amount"
          type="number"
          step="any"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          onKeyDown={addOnEnter}
          placeholder="400"
          className={`${fieldClass} w-24`}
        />
        <label htmlFor="ingredient-unit" className="sr-only">
          Unit
        </label>
        <select
          id="ingredient-unit"
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
        <label htmlFor="ingredient-name" className="sr-only">
          Ingredient
        </label>
        <input
          id="ingredient-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={addOnEnter}
          placeholder="spaghetti"
          className={`${fieldClass} min-w-40 flex-1`}
        />
        <button type="button" onClick={add} className="btn btn-primary h-12 rounded-full px-5 font-bold max-sm:w-full">
          + Add
        </button>
      </div>

      {value.length > 0 ? (
        <ul className="grid gap-x-6 sm:grid-cols-2">
          {value.map((ingredient, index) => (
            <li
              key={`${ingredient.name}-${ingredient.unit}-${index}`}
              className="flex items-center gap-3 border-b border-base-300 py-2"
            >
              <span className="w-20 shrink-0 font-bold">{formatAmount(ingredient)}</span>
              <span className="min-w-0 flex-1 truncate">{ingredient.name}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                aria-label={`Remove ${ingredient.name}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-base-content/60 hover:bg-error/15 hover:text-error"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-base-content/60">No ingredients yet — tip: press Enter to add quickly.</p>
      )}

      {/* The server action reads repeated "ingredients" fields with JSON (unchanged format). */}
      {value.map((ingredient, index) => (
        <input key={index} type="hidden" name="ingredients" value={JSON.stringify(ingredient)} />
      ))}
    </div>
  );
}

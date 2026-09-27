"use client";

import { formatAmount } from "@/app/components/recipe-details/IngredientList";

type CheckRowProps = {
  name: string;
  amount: number | null;
  unit: string;
  checked: boolean;
  onToggle: () => void;
  /** Optional ✕ button (own items only). */
  onRemove?: () => void;
};

/** One tickable shopping-list line: checkbox · bold amount · name. 44px+ tall for one-handed use in the store. */
export default function CheckRow({ name, amount, unit, checked, onToggle, onRemove }: CheckRowProps) {
  return (
    <li className="flex items-center gap-2 border-b border-base-300 last:border-b-0">
      <label className="flex min-h-12 flex-1 cursor-pointer items-center gap-3.5 rounded-xl px-2 transition-colors hover:bg-base-300/60">
        <input type="checkbox" checked={checked} onChange={onToggle} className="checkbox checkbox-primary checkbox-sm" />
        <span className={`w-20 shrink-0 font-bold ${checked ? "text-base-content/40 line-through" : ""}`}>
          {formatAmount({ amount, unit })}
        </span>
        <span className={checked ? "text-base-content/40 line-through" : ""}>{name}</span>
      </label>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-100 text-sm text-base-content/60 transition-colors hover:bg-error/15 hover:text-error"
        >
          ✕
        </button>
      )}
    </li>
  );
}

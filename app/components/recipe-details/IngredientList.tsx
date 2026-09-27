import type { IngredientDetail } from "@/lib/recipe";

function formatAmount({ amount, unit }: IngredientDetail): string {
  if (amount == null) return "";
  return unit ? `${amount} ${unit}` : String(amount);
}

type IngredientListProps = {
  ingredients: IngredientDetail[];
  /** Two columns from `sm` (used in the modal). */
  twoColumns?: boolean;
};

/** Rows with a bold amount column + the name, e.g. "400 g | spaghetti". */
export default function IngredientList({ ingredients, twoColumns = false }: IngredientListProps) {
  if (ingredients.length === 0) {
    return <p className="text-sm text-base-content/60">No ingredients listed.</p>;
  }

  return (
    <ul className={`grid ${twoColumns ? "sm:grid-cols-2 sm:gap-x-7" : ""}`}>
      {ingredients.map((ingredient, index) => (
        <li
          key={`${ingredient.name}-${index}`}
          className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-b border-base-300 py-2.5 text-[15px] last:border-b-0"
        >
          <span className="font-bold">{formatAmount(ingredient)}</span>
          <span>{ingredient.name}</span>
        </li>
      ))}
    </ul>
  );
}

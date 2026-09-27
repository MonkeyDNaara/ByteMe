import { CATEGORY_GROUPS, formatLabel, getCategoryGroup, OTHER_CATEGORY_GROUP } from "@/lib/recipe";

import { chipClass } from "./chipClass";

type LabelsPanelProps = {
  /** Every label that exists in the current recipe list (any casing). */
  categories: string[];
  /** Selected label keys (lowercase). */
  selected: string[];
  onToggle: (labelKey: string) => void;
};

/**
 * Labels grouped by the same taxonomy as the create-recipe form, plus an
 * "Other" group for labels that exist in the data but not in the taxonomy.
 * A "dumb" component: it owns no state, it only shows values and reports clicks.
 */
export default function LabelsPanel({ categories, selected, onToggle }: LabelsPanelProps) {
  const byGroup = new Map<string, string[]>();
  for (const category of categories) {
    const group = getCategoryGroup(category);
    byGroup.set(group, [...(byGroup.get(group) ?? []), category]);
  }

  const groups = [...CATEGORY_GROUPS.map((group) => group.name), OTHER_CATEGORY_GROUP]
    .map((name) => ({ name, categories: byGroup.get(name) ?? [] }))
    .filter((group) => group.categories.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <fieldset key={group.name} className="flex flex-col gap-2">
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
            {group.name}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.categories.map((category) => {
              const key = category.toLowerCase();
              const active = selected.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onToggle(key)}
                  className={chipClass(active)}
                >
                  {formatLabel(category)}
                  {active && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

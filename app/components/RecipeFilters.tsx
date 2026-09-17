"use client";

import { useMemo, useState } from "react";

import RecipeCard from "@/app/components/RecipeCard";
import {
  CATEGORY_GROUPS,
  filterRecipes,
  formatLabel,
  getCategoryGroup,
  getDistinctCategories,
  getTimeBounds,
  OTHER_CATEGORY_GROUP,
  type Recipe,
  type TimeRange,
} from "@/lib/recipe";

type RecipeFiltersProps = {
  recipes: Recipe[];
};

export default function RecipeFilters({ recipes }: RecipeFiltersProps) {
  const allCategories = useMemo(
    () => getDistinctCategories(recipes),
    [recipes],
  );
  const bounds = useMemo(() => getTimeBounds(recipes), [recipes]);

  // Cluster whatever categories actually exist in the data under the same
  // taxonomy the create-recipe form offers, in the same order, plus an
  // "Other" bucket (non-empty today: real seeded categories like "tasty" or
  // "comfort food" aren't in the taxonomy) for anything unrecognized.
  const groupedCategories = useMemo(() => {
    const byGroup = new Map<string, string[]>();
    for (const category of allCategories) {
      const groupName = getCategoryGroup(category);
      const list = byGroup.get(groupName) ?? [];
      list.push(category);
      byGroup.set(groupName, list);
    }

    const orderedGroupNames = [
      ...CATEGORY_GROUPS.map((group) => group.name),
      OTHER_CATEGORY_GROUP,
    ];

    return orderedGroupNames
      .map((name) => ({ name, categories: byGroup.get(name) ?? [] }))
      .filter((group) => group.categories.length > 0);
  }, [allCategories]);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [timeRange, setTimeRange] = useState<TimeRange>(bounds);

  const toggleCategory = (category: string) => {
    const key = category.toLowerCase();
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Shared clamp logic for both the slider and the number input on each side,
  // so "From" can never exceed "To" (and vice versa) and neither can leave
  // the dataset's actual min/max, however the value was entered.
  const setMinTime = (value: number) => {
    if (Number.isNaN(value)) return;
    setTimeRange((range) => ({
      ...range,
      min: Math.min(Math.max(value, bounds.min), range.max),
    }));
  };

  const setMaxTime = (value: number) => {
    if (Number.isNaN(value)) return;
    setTimeRange((range) => ({
      ...range,
      max: Math.max(Math.min(value, bounds.max), range.min),
    }));
  };

  const filtered = useMemo(
    () =>
      filterRecipes(recipes, {
        categories: [...selectedCategories],
        timeRange,
      }),
    [recipes, selectedCategories, timeRange],
  );

  const isFullTimeRange =
    timeRange.min === bounds.min && timeRange.max === bounds.max;
  const hasActiveFilters = selectedCategories.size > 0 || !isFullTimeRange;

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setTimeRange(bounds);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-3">
        {allCategories.length > 0 && (
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
              Labels
              {selectedCategories.size > 0 ? ` (${selectedCategories.size})` : ""}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-20 max-h-72 w-56 overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow"
            >
              {/* daisyUI hides a closed dropdown-content via `display:none`;
                  a `flex` utility directly on this element would win the
                  cascade and keep it laid out (and clickable) even while
                  "closed", so the flex layout lives on this inner div instead. */}
              <div className="flex flex-col gap-1 p-3">
                {groupedCategories.map((group) => (
                  <div key={group.name} className="flex flex-col gap-1">
                    <p className="px-1 pt-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                      {group.name}
                    </p>
                    {group.categories.map((category) => {
                      const key = category.toLowerCase();
                      const active = selectedCategories.has(key);
                      return (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-2 rounded-field px-1 py-1 text-sm hover:bg-base-200"
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={active}
                            onChange={() => toggleCategory(category)}
                          />
                          {formatLabel(category)}
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {bounds.max > bounds.min && (
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
              {isFullTimeRange
                ? "Time"
                : `Time: ${timeRange.min}–${timeRange.max} min`}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-20 w-72 rounded-box border border-base-300 bg-base-100 shadow"
            >
              {/* See the comment on the Labels dropdown-content above: the
                  flex layout lives on this inner div, not on dropdown-content
                  itself. */}
              <div className="flex flex-col gap-4 p-4">
                <label className="flex flex-col gap-1 text-xs text-base-content/70">
                  From (min)
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={bounds.min}
                      max={bounds.max}
                      value={timeRange.min}
                      onChange={(event) =>
                        setMinTime(Number(event.target.value))
                      }
                      className="range range-primary range-sm flex-1"
                    />
                    <input
                      type="number"
                      min={bounds.min}
                      max={bounds.max}
                      value={timeRange.min}
                      onChange={(event) =>
                        setMinTime(Number(event.target.value))
                      }
                      className="input input-bordered input-sm w-20"
                    />
                  </div>
                </label>

                <label className="flex flex-col gap-1 text-xs text-base-content/70">
                  To (min)
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={bounds.min}
                      max={bounds.max}
                      value={timeRange.max}
                      onChange={(event) =>
                        setMaxTime(Number(event.target.value))
                      }
                      className="range range-primary range-sm flex-1"
                    />
                    <input
                      type="number"
                      min={bounds.min}
                      max={bounds.max}
                      value={timeRange.max}
                      onChange={(event) =>
                        setMaxTime(Number(event.target.value))
                      }
                      className="input input-bordered input-sm w-20"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-ghost btn-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-base-content/60">
        {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-box bg-base-200 px-6 py-10 text-center text-base-content/70">
          No recipes match these filters.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              href={`/recipe/${recipe.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

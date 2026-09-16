"use client";

import { useMemo, useState } from "react";

import RecipeCard from "@/app/components/RecipeCard";
import {
  filterRecipes,
  formatLabel,
  getDistinctCategories,
  getTimeBounds,
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

  const filtered = useMemo(
    () =>
      filterRecipes(recipes, {
        categories: [...selectedCategories],
        timeRange,
      }),
    [recipes, selectedCategories, timeRange],
  );

  const hasActiveFilters =
    selectedCategories.size > 0 ||
    timeRange.min !== bounds.min ||
    timeRange.max !== bounds.max;

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setTimeRange(bounds);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-box bg-base-200 p-4 sm:p-6">
        {allCategories.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Labels</p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => {
                const key = category.toLowerCase();
                const active = selectedCategories.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    aria-pressed={active}
                    className={`badge badge-lg cursor-pointer ${
                      active ? "badge-primary" : "badge-outline"
                    }`}
                  >
                    {formatLabel(category)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {bounds.max > bounds.min && (
          <div className="flex flex-col gap-3 sm:max-w-sm">
            <p className="text-sm font-semibold">
              Time: {timeRange.min}–{timeRange.max} min
            </p>

            <label className="flex flex-col gap-1 text-xs text-base-content/70">
              From: {timeRange.min} min
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
                value={timeRange.min}
                onChange={(event) => {
                  const value = Math.min(
                    Number(event.target.value),
                    timeRange.max,
                  );
                  setTimeRange((range) => ({ ...range, min: value }));
                }}
                className="range range-primary range-sm"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs text-base-content/70">
              To: {timeRange.max} min
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
                value={timeRange.max}
                onChange={(event) => {
                  const value = Math.max(
                    Number(event.target.value),
                    timeRange.min,
                  );
                  setTimeRange((range) => ({ ...range, max: value }));
                }}
                className="range range-primary range-sm"
              />
            </label>
          </div>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-ghost btn-sm w-fit"
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

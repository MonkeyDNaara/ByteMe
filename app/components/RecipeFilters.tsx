"use client";

import { useMemo, useState } from "react";

import RecipeCard from "@/app/components/RecipeCard";
import {
  CATEGORY_GROUPS,
  DIFFICULTY_EMOJI,
  DIFFICULTY_LABELS,
  filterRecipes,
  formatLabel,
  getCategoryGroup,
  getDistinctCategories,
  getDistinctDifficulties,
  getTimeBounds,
  OTHER_CATEGORY_GROUP,
  type DifficultyLevel,
  type Recipe,
  type TimeRange,
} from "@/lib/recipe";

export type RecipeFiltersProps = {
  recipes: Recipe[];
  /** Labels to preselect, e.g. from `/all-recipes?label=vegetarian`. */
  initialCategories?: string[];
  /** Upper time limit to preselect, e.g. from `/all-recipes?maxTime=20`. */
  initialMaxTime?: number;
};

type SortOption = "newest" | "time" | "difficulty" | "likes" | "alphabetical";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  time: "Time (quickest first)",
  difficulty: "Difficulty (easiest first)",
  likes: "Most liked",
  alphabetical: "Alphabetical (A–Z)",
};

/**
 * Kept local to this component rather than lib/recipe.ts (unlike
 * filterRecipes/getTimeBounds etc.) since it's not needed anywhere else.
 * "newest" uses `Number(id)` as a proxy for creation order -- ids are
 * assigned sequentially by the DB and the validated `Recipe` type doesn't
 * carry a real timestamp. For "difficulty", unrated recipes (`null`) are
 * always sorted to the end -- they aren't comparable to a rated one.
 */
function sortRecipes(recipes: Recipe[], sortOption: SortOption): Recipe[] {
  const sorted = [...recipes];
  switch (sortOption) {
    case "newest":
      sorted.sort((a, b) => Number(b.id) - Number(a.id));
      break;
    case "time":
      sorted.sort((a, b) => a.time - b.time);
      break;
    case "difficulty":
      sorted.sort((a, b) => {
        if (a.difficulty == null) return b.difficulty == null ? 0 : 1;
        if (b.difficulty == null) return -1;
        return a.difficulty - b.difficulty;
      });
      break;
    case "likes":
      sorted.sort((a, b) => b.likes - a.likes);
      break;
    case "alphabetical":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
  return sorted;
}

export default function RecipeFilters({
  recipes,
  initialCategories = [],
  initialMaxTime,
}: RecipeFiltersProps) {
  const allCategories = useMemo(
    () => getDistinctCategories(recipes),
    [recipes],
  );
  const bounds = useMemo(() => getTimeBounds(recipes), [recipes]);
  const distinctDifficulties = useMemo(
    () => getDistinctDifficulties(recipes),
    [recipes],
  );

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

  // Initial values from the URL are only read on the first render (lazy
  // useState initializer). The page passes a `key` built from the URL params,
  // so navigating to a different filter link remounts this component and the
  // initializers run again. Unknown labels are ignored -- otherwise an old or
  // mistyped link would silently filter the list down to zero recipes.
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => {
      const known = new Set(allCategories.map((category) => category.toLowerCase()));
      return new Set(
        initialCategories
          .map((category) => category.toLowerCase())
          .filter((category) => known.has(category)),
      );
    },
  );
  const [selectedDifficulties, setSelectedDifficulties] = useState<Set<number>>(
    new Set(),
  );
  const [timeRange, setTimeRange] = useState<TimeRange>(() =>
    initialMaxTime === undefined
      ? bounds
      : {
          min: bounds.min,
          // Clamp into the real range, so e.g. "Under 20 min" still works
          // when the quickest recipe takes 25 min (it then shows none of
          // them, which is honest, but the slider stays valid).
          max: Math.min(Math.max(initialMaxTime, bounds.min), bounds.max),
        },
  );
  const [sortOption, setSortOption] = useState<SortOption>("newest");

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

  const toggleDifficulty = (level: number) => {
    setSelectedDifficulties((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
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
        difficulties: [...selectedDifficulties],
      }),
    [recipes, selectedCategories, selectedDifficulties, timeRange],
  );

  const sorted = useMemo(
    () => sortRecipes(filtered, sortOption),
    [filtered, sortOption],
  );

  const isFullTimeRange =
    timeRange.min === bounds.min && timeRange.max === bounds.max;
  const hasActiveFilters =
    selectedCategories.size > 0 ||
    selectedDifficulties.size > 0 ||
    !isFullTimeRange;

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedDifficulties(new Set());
    setTimeRange(bounds);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start gap-3">
        {allCategories.length > 0 && (
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
              Labels
              {selectedCategories.size > 0
                ? ` (${selectedCategories.size})`
                : ""}
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
          // Time sits close enough to the left of this row that its default
          // (left-anchored) panel only needs to be slightly narrower than it
          // was (w-64 instead of w-72) to stay fully inside a 375px viewport.
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
              {isFullTimeRange
                ? "Time"
                : `Time: ${timeRange.min}–${timeRange.max} min`}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-20 w-64 rounded-box border border-base-300 bg-base-100 shadow"
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

        {distinctDifficulties.length > 0 && (
          // dropdown-end anchors the panel to this trigger's *right* edge:
          // Difficulty sits furthest right in this row, so its default
          // left-anchored panel overflowed the most. Narrowed to w-56 (from
          // w-64) so the right-anchored panel's left edge also stays inside
          // the viewport, not just its right edge.
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-outline btn-sm">
              Difficulty
              {selectedDifficulties.size > 0
                ? ` (${selectedDifficulties.size})`
                : ""}
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-20 w-56 rounded-box border border-base-300 bg-base-100 shadow"
            >
              {/* See the comment on the Labels dropdown-content above: the
                  flex layout lives on this inner div, not on dropdown-content
                  itself. */}
              <div className="flex flex-col gap-1 p-3">
                {distinctDifficulties.map((level) => {
                  const active = selectedDifficulties.has(level);
                  return (
                    <label
                      key={level}
                      className="flex cursor-pointer items-center gap-2 rounded-field px-1 py-1 text-sm hover:bg-base-200"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={active}
                        onChange={() => toggleDifficulty(level)}
                      />
                      <span aria-hidden>{DIFFICULTY_EMOJI.repeat(level)}</span>
                      <span>{DIFFICULTY_LABELS[level as DifficultyLevel]}</span>
                    </label>
                  );
                })}
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

        <label className="ml-auto flex items-center gap-2 whitespace-nowrap text-sm text-base-content/70">
          Sort by
          <select
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value as SortOption)
            }
            className="select select-bordered select-sm"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
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
          {sorted.map((recipe) => (
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

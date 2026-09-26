"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import RecipeCard from "@/app/components/RecipeCard";
import {
  DIFFICULTY_LABELS,
  filterRecipes,
  formatLabel,
  getCategoryGroup,
  getDistinctCategories,
  getDistinctDifficulties,
  type DifficultyLevel,
  type Recipe,
} from "@/lib/recipe";

import ActiveFilterPills, { type FilterPill } from "./ActiveFilterPills";
import { chipClass } from "./chipClass";
import DifficultyPanel from "./DifficultyPanel";
import {
  countActiveFilters,
  filtersToSearchParams,
  SORT_LABELS,
  SORT_OPTIONS,
  type FilterState,
  type SortOption,
} from "./filterParams";
import LabelsPanel from "./LabelsPanel";
import TimePanel from "./TimePanel";

export type RecipeFiltersProps = {
  recipes: Recipe[];
  /** Parsed from the URL on the server (see filterParams.ts). */
  initialFilters: FilterState;
};

const PAGE_SIZE = 12;
const TOP_LABEL_COUNT = 5;

// Only these taxonomy groups (see CATEGORY_GROUPS in lib/recipe.ts) can
// become quick-filter chips. Flavor ("Salty"), main ingredient or unknown
// labels are still available in the Labels dropdown.
const QUICK_FILTER_GROUPS = new Set(["Meal & Course Type", "Diet & Nutrition", "Cooking Method & Prep"]);

/**
 * "newest" uses `Number(id)` as a proxy for creation order -- ids are
 * assigned sequentially by the DB. For "difficulty", unrated recipes (`null`)
 * always go to the end -- they aren't comparable to a rated one.
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

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** Pill-shaped trigger + panel, using daisyUI's focus-based dropdown. */
function FilterDropdown({
  label,
  active,
  width = "w-72",
  children,
}: {
  label: ReactNode;
  active: boolean;
  width?: string;
  children: ReactNode;
}) {
  return (
    <div className="dropdown">
      <div
        tabIndex={0}
        role="button"
        className={`btn h-10 min-h-10 gap-1.5 rounded-full px-4 font-medium shadow-none ${
          active ? "border-primary bg-primary/25" : "border-base-300 bg-base-100 hover:border-primary"
        }`}
      >
        {label}
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {/* daisyUI hides a closed dropdown-content via `display:none`; a `flex`
          utility directly on it would win the cascade and keep it visible,
          so any layout lives on the inner div. */}
      <div
        tabIndex={0}
        className={`dropdown-content z-30 mt-2 ${width} max-h-96 overflow-y-auto rounded-box border border-base-300 bg-base-200 shadow-lg`}
      >
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

function SortSelect({
  value,
  onChange,
  compact = false,
}: {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  compact?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 whitespace-nowrap text-sm text-base-content/70">
      <span className={compact ? "sr-only" : ""}>Sort</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="select select-sm h-10 rounded-full border-base-300 bg-base-100"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_LABELS[option]}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function RecipeFilters({ recipes, initialFilters }: RecipeFiltersProps) {
  const sheetRef = useRef<HTMLDialogElement>(null);

  const allCategories = useMemo(() => getDistinctCategories(recipes), [recipes]);
  const difficultyLevels = useMemo(() => getDistinctDifficulties(recipes), [recipes]);

  // Lowercase key -> display text, e.g. "one-pot" -> "One-pot".
  const labelNames = useMemo(
    () => new Map(allCategories.map((category) => [category.toLowerCase(), formatLabel(category)])),
    [allCategories],
  );

  // The most-used labels (from the quick-filter groups) become one-click chips.
  const topLabels = useMemo(() => {
    const counts = new Map<string, number>();
    for (const recipe of recipes) {
      for (const category of new Set(recipe.categories.map((c) => c.toLowerCase()))) {
        if (!QUICK_FILTER_GROUPS.has(getCategoryGroup(category))) continue;
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_LABEL_COUNT)
      .map(([key]) => key);
  }, [recipes]);

  // Initial values come from the URL and are only read on the first render
  // (lazy initializer). The page gives this component a `key` built from the
  // URL, so a different filter link creates a fresh component. Unknown
  // labels are dropped -- an old link shouldn't silently show 0 recipes.
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...initialFilters,
    labels: initialFilters.labels.filter((label) => labelNames.has(label)),
  }));
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /** Every filter change goes through here, so "Show more" always restarts at 12. */
  const updateFilters = (update: (previous: FilterState) => FilterState) => {
    setFilters(update);
    setVisibleCount(PAGE_SIZE);
  };

  const toggleLabel = (key: string) => updateFilters((f) => ({ ...f, labels: toggle(f.labels, key) }));
  const toggleDifficulty = (level: number) =>
    updateFilters((f) => ({ ...f, difficulties: toggle(f.difficulties, level) }));
  const setMaxTime = (maxTime: number | null) => updateFilters((f) => ({ ...f, maxTime }));
  const setSort = (sort: SortOption) => updateFilters((f) => ({ ...f, sort }));
  const clearAll = () => updateFilters((f) => ({ ...f, labels: [], maxTime: null, difficulties: [] }));

  // Keep the URL in sync, so a reload or a shared link shows the same list.
  // The browser's own history API (instead of router.replace) only changes the
  // address bar: Next.js picks it up, but doesn't re-run the server page and
  // reload every recipe on each click. Syncing with something outside React
  // (the URL) is exactly what useEffect is for.
  useEffect(() => {
    const params = filtersToSearchParams(filters, new URLSearchParams(window.location.search));
    const query = params.toString();
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    if (nextUrl !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [filters]);

  const filtered = useMemo(
    () =>
      filterRecipes(recipes, {
        categories: filters.labels,
        timeRange: { min: 0, max: filters.maxTime ?? Number.POSITIVE_INFINITY },
        difficulties: filters.difficulties,
      }),
    [recipes, filters.labels, filters.maxTime, filters.difficulties],
  );
  const sorted = useMemo(() => sortRecipes(filtered, filters.sort), [filtered, filters.sort]);
  const visible = sorted.slice(0, visibleCount);
  const remaining = sorted.length - visible.length;

  const activeCount = countActiveFilters(filters);

  const pills: FilterPill[] = [
    ...filters.labels.map((key) => ({
      key: `label-${key}`,
      label: labelNames.get(key) ?? formatLabel(key),
      onRemove: () => toggleLabel(key),
    })),
    ...(filters.maxTime === null
      ? []
      : [{ key: "time", label: `Up to ${filters.maxTime} min`, onRemove: () => setMaxTime(null) }]),
    ...filters.difficulties.map((level) => ({
      key: `difficulty-${level}`,
      label: `🍲 ${DIFFICULTY_LABELS[level as DifficultyLevel]}`,
      onRemove: () => toggleDifficulty(level),
    })),
  ];

  // Active labels that aren't in the top 5 are shown in front, so a label
  // selected via a link (e.g. "Breakfast" from Home) is always visible here.
  const chipKeys = [...filters.labels.filter((key) => !topLabels.includes(key)), ...topLabels];

  const labelChips = chipKeys.map((key) => {
    const active = filters.labels.includes(key);
    return (
      <button key={key} type="button" aria-pressed={active} onClick={() => toggleLabel(key)} className={chipClass(active)}>
        {labelNames.get(key) ?? formatLabel(key)}
        {active && <span aria-hidden="true">✓</span>}
      </button>
    );
  });

  const countBadge = (count: number) =>
    count > 0 && (
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-content">
        {count}
      </span>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Desktop filter bar -- sticks under the header while scrolling */}
      <div className="sticky top-20 z-20 hidden flex-col gap-3 rounded-box border border-base-300 bg-base-200 p-4 shadow-sm lg:flex">
        <div className="flex items-center gap-2">
          <FilterDropdown
            label={<>Labels {countBadge(filters.labels.length)}</>}
            active={filters.labels.length > 0}
            width="w-96"
          >
            <LabelsPanel categories={allCategories} selected={filters.labels} onToggle={toggleLabel} />
          </FilterDropdown>
          <FilterDropdown
            label={filters.maxTime === null ? "⏱ Time" : `⏱ Up to ${filters.maxTime} min`}
            active={filters.maxTime !== null}
            width="w-56"
          >
            <TimePanel value={filters.maxTime} onChange={setMaxTime} />
          </FilterDropdown>
          <FilterDropdown
            label={<>🍲 Difficulty {countBadge(filters.difficulties.length)}</>}
            active={filters.difficulties.length > 0}
          >
            <DifficultyPanel levels={difficultyLevels} selected={filters.difficulties} onToggle={toggleDifficulty} />
          </FilterDropdown>

          <span aria-hidden="true" className="mx-1 h-6 w-px bg-base-300" />
          <div className="flex min-w-0 flex-1 gap-2 overflow-hidden">{labelChips}</div>

          <SortSelect value={filters.sort} onChange={setSort} />
        </div>

        <div className="border-t border-base-300 pt-3">
          <ActiveFilterPills pills={pills} onClearAll={clearAll} count={filtered.length} />
        </div>
      </div>

      {/* Mobile: one "Filters" button (opens the bottom sheet) + scrollable chips */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => sheetRef.current?.showModal()}
            className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-base-content px-3.5 text-sm font-semibold text-base-100"
          >
            ⚙︎ Filters {countBadge(activeCount)}
          </button>
          {labelChips}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
          </span>
          <SortSelect value={filters.sort} onChange={setSort} compact />
        </div>
        {pills.length > 0 && <ActiveFilterPills pills={pills} onClearAll={clearAll} />}
      </div>

      {/* Mobile bottom sheet. A native <dialog> + showModal() gives us ESC to
          close, a backdrop and focus trapping without extra code. */}
      <dialog ref={sheetRef} className="modal modal-bottom lg:hidden" aria-labelledby="filter-sheet-title">
        <div className="modal-box flex max-h-[85vh] flex-col gap-0 rounded-t-[2rem] bg-base-200 p-0">
          <div className="flex items-center justify-between border-b border-base-300 px-5 py-4">
            <h2 id="filter-sheet-title" className="text-lg font-bold">
              Filters
            </h2>
            <form method="dialog">
              <button type="submit" className="btn btn-circle btn-ghost btn-sm" aria-label="Close filters">
                ✕
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-6 overflow-y-auto px-5 py-5">
            <section className="flex flex-col gap-2">
              <h3 className="font-semibold">⏱ Cook time</h3>
              <TimePanel value={filters.maxTime} onChange={setMaxTime} />
            </section>
            <section className="flex flex-col gap-2">
              <h3 className="font-semibold">🍲 Difficulty</h3>
              <DifficultyPanel levels={difficultyLevels} selected={filters.difficulties} onToggle={toggleDifficulty} />
            </section>
            <section className="flex flex-col gap-3">
              <h3 className="font-semibold">🏷️ Labels</h3>
              <LabelsPanel categories={allCategories} selected={filters.labels} onToggle={toggleLabel} />
            </section>
          </div>

          <form method="dialog" className="flex gap-3 border-t border-base-300 px-5 py-4">
            <button
              type="button"
              onClick={clearAll}
              disabled={activeCount === 0}
              className="btn btn-ghost h-12 rounded-full"
            >
              Clear all
            </button>
            <button type="submit" className="btn btn-primary h-12 flex-1 rounded-full">
              Show {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-box border-2 border-dashed border-primary/40 bg-base-200 px-6 py-12 text-center">
          <span aria-hidden="true" className="text-4xl">
            🔍
          </span>
          <p className="font-semibold">No recipes match these filters.</p>
          <button type="button" onClick={clearAll} className="btn btn-primary h-11 rounded-full px-6">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                href={`/recipe/${recipe.id}`}
                highlightTags={filters.labels}
              />
            ))}
          </div>

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="btn mx-auto h-12 rounded-full border-primary bg-base-200 px-7 font-semibold"
            >
              Show more recipes ({remaining} left)
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Filter state <-> URL search params. No "use client": the server pages parse
// the URL with these helpers too, so both sides agree on one format:
//   /all-recipes?label=vegetarian&label=dessert&maxTime=30&difficulty=2&sort=newest

export const SORT_OPTIONS = ["likes", "newest", "time", "difficulty", "alphabetical"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  likes: "Most liked",
  newest: "Newest first",
  time: "Quickest first",
  difficulty: "Easiest first",
  alphabetical: "A–Z",
};

export const DEFAULT_SORT: SortOption = "likes";

/** "Up to N min" choices in the Time filter. */
export const TIME_PRESETS = [15, 20, 30, 45, 60] as const;

export type FilterState = {
  /** Lowercase label keys, e.g. "vegetarian". */
  labels: string[];
  /** Upper time limit in minutes, `null` = any time. */
  maxTime: number | null;
  difficulties: number[];
  sort: SortOption;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

const FILTER_KEYS = ["label", "maxTime", "difficulty", "sort"] as const;

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** Turns untrusted URL params into a clean, typed FilterState (invalid values are dropped). */
export function parseFilterParams(params: RawSearchParams): FilterState {
  const labels = [
    ...new Set(
      toArray(params.label)
        .map((label) => label.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  const parsedMaxTime = Number(toArray(params.maxTime)[0]);
  const maxTime = Number.isFinite(parsedMaxTime) && parsedMaxTime > 0 ? Math.round(parsedMaxTime) : null;

  const difficulties = [
    ...new Set(
      toArray(params.difficulty)
        .map(Number)
        .filter((level) => Number.isInteger(level) && level >= 1 && level <= 5),
    ),
  ];

  const rawSort = toArray(params.sort)[0];
  const sort = SORT_OPTIONS.includes(rawSort as SortOption) ? (rawSort as SortOption) : DEFAULT_SORT;

  return { labels, maxTime, difficulties, sort };
}

/**
 * Writes the filters into a copy of `base`, keeping every other param
 * (e.g. `search`). Default values are left out to keep URLs short.
 */
export function filtersToSearchParams(filters: FilterState, base = new URLSearchParams()): URLSearchParams {
  const params = new URLSearchParams(base);
  FILTER_KEYS.forEach((key) => params.delete(key));

  filters.labels.forEach((label) => params.append("label", label));
  if (filters.maxTime !== null) params.set("maxTime", String(filters.maxTime));
  filters.difficulties.forEach((level) => params.append("difficulty", String(level)));
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort);

  return params;
}

/** Stable string for a FilterState -- used as a React `key`. */
export function filtersKey(filters: FilterState): string {
  return filtersToSearchParams(filters).toString();
}

/** How many filters are active (sort doesn't count). */
export function countActiveFilters(filters: FilterState): number {
  return filters.labels.length + (filters.maxTime === null ? 0 : 1) + filters.difficulties.length;
}

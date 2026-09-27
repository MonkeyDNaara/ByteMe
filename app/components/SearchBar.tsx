"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { isOptimizableImageUrl, type Recipe } from "@/lib/recipe";

/** Only what the suggestions need -- keeps the data sent to the browser small. */
export type SearchSuggestion = Pick<Recipe, "id" | "name" | "likes" | "image_url">;

type SearchBarProps = {
  recipes: SearchSuggestion[];
  /** Always expanded (e.g. on Home). Otherwise it grows on hover/focus. */
  defaultOpen?: boolean;
  placeholder?: string;
};

const MAX_SUGGESTIONS = 3;

/** Splits `name` around the first case-insensitive match of `query` and bolds it. */
function HighlightMatch({ name, query }: { name: string; query: string }) {
  const index = name.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1 || !query) return <>{name}</>;

  return (
    <>
      {name.slice(0, index)}
      <strong className="font-bold">{name.slice(index, index + query.length)}</strong>
      {name.slice(index + query.length)}
    </>
  );
}

export default function SearchBar({ recipes, defaultOpen = false, placeholder = "Search recipes…" }: SearchBarProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isHovered || isFocused;
  const isExpanded = defaultOpen || isActive;
  const query = search.trim();

  const suggestions = query
    ? recipes
        .filter((recipe) => recipe.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.likes - a.likes)
        .slice(0, MAX_SUGGESTIONS)
    : [];

  const resultsHref = `/all-recipes?search=${encodeURIComponent(query)}`;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Empty search: pressing "Search" just puts the cursor into the field.
    if (!query) {
      inputRef.current?.focus();
      return;
    }

    router.push(resultsHref);
    setSearch("");
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // React's onFocus/onBlur bubble, so they fire for every element inside
      // (input, buttons, suggestion links). `relatedTarget` is the element
      // that receives focus next: only when it's OUTSIDE this wrapper did the
      // user really leave the search.
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
      className="relative w-full"
    >
      <form
        role="search"
        onSubmit={handleSubmit}
        className={`flex h-12 max-w-full items-center gap-1 rounded-full border bg-base-200 pl-4 pr-1 transition-all duration-800 ease-in-out ${
          defaultOpen ? "w-full" : isExpanded ? "w-full sm:w-[560px]" : "w-[148px]"
        } ${
          isActive ? "border-primary shadow-[0_0_0_4px] shadow-primary/25" : "border-base-300 shadow-sm"
        }`}
      >
        <svg
          className="h-4 w-4 shrink-0 text-base-content/50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <label htmlFor={defaultOpen ? "search-home" : "search-recipes"} className="sr-only">
          Search recipes
        </label>
        <input
          ref={inputRef}
          id={defaultOpen ? "search-home" : "search-recipes"}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={`min-w-0 flex-1 bg-transparent text-[15px] outline-none transition-opacity duration-500 placeholder:text-base-content/50 [&::-webkit-search-cancel-button]:hidden ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Clear button fades in after the width animation (delay) */}
        <button
          type="button"
          onClick={() => {
            setSearch("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          tabIndex={search ? 0 : -1}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base-content/60 transition-opacity hover:bg-base-300 ${
            search && isExpanded ? "opacity-100 delay-300" : "pointer-events-none opacity-0 delay-0"
          }`}
        >
          ✕
        </button>

        <button
          type="submit"
          className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors duration-300 ${
            isActive ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"
          }`}
        >
          Search
        </button>
      </form>

      {/* Suggestions dropdown */}
      {query && isActive && (
        <div
          className={`absolute left-0 z-30 mt-2 w-full ${defaultOpen ? "" : "sm:w-[560px]"} max-w-full overflow-hidden rounded-box border border-base-300 bg-base-200 shadow-lg`}
        >
          {suggestions.length > 0 ? (
            <>
              <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">
                Top matches
              </p>
              <ul>
                {suggestions.map((recipe) => (
                  <li key={recipe.id}>
                    <Link
                      href={`/recipe/${recipe.id}`}
                      className="flex items-center gap-3 px-4 py-2 transition-colors hover:bg-base-300 focus-visible:bg-base-300"
                    >
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-base-300">
                        <Image
                          src={recipe.image_url}
                          alt=""
                          fill
                          sizes="36px"
                          className="object-cover"
                          unoptimized={!isOptimizableImageUrl(recipe.image_url)}
                        />
                      </span>
                      <span className="flex-1 truncate font-normal">
                        <HighlightMatch name={recipe.name} query={query} />
                      </span>
                      <span className="shrink-0 text-sm text-base-content/60">
                        ❤️ {recipe.likes}
                        <span className="sr-only"> likes</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="px-4 py-3 text-sm text-base-content/60">No recipe name matches “{query}” yet.</p>
          )}

          <Link
            href={resultsHref}
            onClick={() => setSearch("")}
            className="block border-t border-base-300 px-4 py-3 text-sm font-semibold text-link transition-colors hover:bg-base-300"
          >
            See all results for “{query}” →
          </Link>
        </div>
      )}
    </div>
  );
}

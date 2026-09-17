"use client";

import { Recipe } from "@/dbQueries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SearchBarProps = {
  recipes: Recipe[];
};

export default function SearchBar({ recipes }: SearchBarProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isOpen = isHovered || isFocused;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    router.push(`/all-recipes?search=${encodeURIComponent(value)}`);

    setSearch("");
  };

  const filteredRecipes = recipes
    .filter((recipe) =>
      recipe.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <form
        onSubmit={handleSubmit}
        className="group flex w-30 focus-within:w-full hover:w-full rounded-2xl border transition-all duration-800 ease-in-out"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search recipe..."
          className="w-0 p-0 rounded-l-2xl group-hover:w-9/10 group-hover:p-2 group-focus-within:w-9/10 group-focus-within:p-2 transition-all duration-800 ease-in-out"
        />

        <button
          type="button"
          onClick={() => setSearch("")}
          className="w-0 px-0 opacity-0 delay-0 group-hover:px-3 group-focus-within:px-3 group-hover:w-auto group-focus-within:w-auto group-focus-within:opacity-100 group-hover:opacity-100 cursor-pointer transition-all duration-800 ease-in-out group-hover:delay-820 group-focus-within:delay-820"
        >
          ✕
        </button>

        <button
          type="submit"
          className="px-4 py-2 w-full bg-base-300 border-l border-transparent rounded-2xl group-focus-within:w-30 group-hover:w-30 group-focus-within:border-white group-hover:border-white group-focus-within:rounded-l-none group-hover:rounded-l-none cursor-pointer transition-all duration-800 ease-in-out"
        >
          Search
        </button>
      </form>
      {search && isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-full rounded-2xl border bg-base-100 shadow-lg overflow-hidden divide-y">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipe/${recipe.id}`}
              className="flex w-full justify-between px-4 py-3 text-left hover:bg-base-200"
            >
              <span>{recipe.name}</span>
              <span>🩷 {recipe.likes}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

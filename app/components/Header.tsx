"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "All Recipes", href: "/all-recipes" },
  { label: "Favorites", href: "/favorites" },
];

const THEME_LIGHT = "bytemepastel";
const THEME_DARK = "bytemepastel-dark";

function applyTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", dark ? THEME_DARK : THEME_LIGHT);
}

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme ? savedTheme === THEME_DARK : prefersDark;

    // DOM-Attribut sofort für CSS setzen
    applyTheme(shouldBeDark);

    // State asynchron im nächsten Frame aktualisieren, um den kaskadierenden Render zu vermeiden
    const frameId = requestAnimationFrame(() => {
      setIsDark(shouldBeDark);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    applyTheme(nextDark);
    localStorage.setItem("theme", nextDark ? THEME_DARK : THEME_LIGHT);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/90 backdrop-blur-md text-base-content">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content text-base font-bold">
            ⚡
          </span>
          <span>
            byte<span className="text-primary font-bold">me</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? "text-primary font-semibold" : "text-base-content/70 hover:text-base-content"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle Button Desktop */}
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle btn-sm text-base-content"
            aria-label="Theme wechseln"
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <Link href="/create-recipe" className="btn btn-primary btn-sm">
            + Create Recipe
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle btn-sm text-base-content"
            aria-label="Theme wechseln"
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="btn btn-ghost btn-square btn-sm"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobiles Menü */}
      {isMobileOpen && (
        <div className="border-b border-base-300 bg-base-100 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-base-200 text-primary font-semibold" : "text-base-content/80 hover:bg-base-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/create-recipe"
              onClick={() => setIsMobileOpen(false)}
              className="btn btn-primary btn-sm mt-2 w-full"
            >
              + Create Recipe
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { signOut } from "@/lib/auth/actions";

type HeaderProps = {
  user: { name: string } | null;
  canCreateRecipes: boolean;
};

const NAV_ITEMS = [
  { label: "Home", href: "/", emoji: "🏠" },
  { label: "All recipes", href: "/all-recipes", emoji: "📖" },
  { label: "Favorites", href: "/favorites", emoji: "💜" },
  { label: "Shopping list", href: "/shopping-list", emoji: "🛒" },
];

// Mobile menu only -- on desktop, Home's "Can't decide?" card covers this.
const SURPRISE_ITEM = { label: "Surprise me", href: "/random", emoji: "🎲" };

const THEME_LIGHT = "bytemepastel";
const THEME_DARK = "bytemepastel-dark";

function applyTheme(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", dark ? THEME_DARK : THEME_LIGHT);
}

/** Home is only active on exactly "/", every other link also on its sub-pages. */
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ThemeIcon({ isDark }: { isDark: boolean }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      {isDark ? (
        // Sun: shown in dark mode ("switch to light")
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      ) : (
        // Moon: shown in light mode ("switch to dark")
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      )}
    </svg>
  );
}

export default function Header({ user, canCreateRecipes }: HeaderProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsMobileOpen(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme ? savedTheme === THEME_DARK : prefersDark;

    // Set the DOM attribute right away so the CSS switches immediately.
    applyTheme(shouldBeDark);

    // Update React state in the next frame to avoid a cascading render
    // (calling setState synchronously inside an effect).
    const frameId = requestAnimationFrame(() => {
      setIsDark(shouldBeDark);
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  // While the mobile menu is open: lock page scrolling and close it on ESC.
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    applyTheme(nextDark);
    localStorage.setItem("theme", nextDark ? THEME_DARK : THEME_LIGHT);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/90 text-base-content backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" onClick={closeMenu} className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Image src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10 object-contain" priority />
            <span>
              byte<span className="text-link">Me</span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-9 items-center rounded-full px-3.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/25 font-semibold text-base-content"
                      : "font-medium text-base-content/70 hover:bg-base-300 hover:text-base-content"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <ThemeIcon isDark={isDark} />
            </button>

            {user ? (
              <>
                <span className="max-w-32 truncate text-sm text-base-content/70">{user.name}</span>
                <form action={signOut}>
                  <button type="submit" className="btn btn-ghost btn-sm rounded-full">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/auth/sign-in" className="btn btn-ghost btn-sm rounded-full">
                Sign in
              </Link>
            )}

            {canCreateRecipes && (
              <Link href="/create-recipe" className="btn btn-primary btn-sm rounded-full">
                + Create recipe
              </Link>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle h-11 w-11"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <ThemeIcon isDark={isDark} />
            </button>

            <button
              type="button"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className="btn btn-ghost btn-square h-11 w-11"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                {isMobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu: full-screen overlay below the header.
          Rendered OUTSIDE <header> on purpose: the header's `backdrop-blur`
          creates a new containing block, which would trap a `position: fixed`
          child inside the 64px-high header instead of the viewport. */}
      {isMobileOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-y-auto bg-base-100 px-4 pb-6 pt-2 text-base-content lg:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {[...NAV_ITEMS, SURPRISE_ITEM].map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-14 items-center gap-4 rounded-box px-4 text-lg transition-colors ${
                    active ? "bg-primary/25 font-semibold" : "font-medium hover:bg-base-300"
                  }`}
                >
                  <span aria-hidden="true" className="text-xl">
                    {item.emoji}
                  </span>
                  {item.label}
                </Link>
              );
            })}

            <label className="flex h-14 cursor-pointer items-center gap-4 rounded-box px-4 text-lg font-medium hover:bg-base-300">
              <span aria-hidden="true" className="text-xl">
                🌙
              </span>
              <span className="flex-1">Dark mode</span>
              <input type="checkbox" className="toggle toggle-primary" checked={isDark} onChange={toggleTheme} />
            </label>
          </nav>

          {/* Account area, pushed to the bottom */}
          <div className="mt-auto flex flex-col gap-3 border-t border-base-300 pt-4">
            {user ? (
              <div className="flex items-center gap-3 px-2">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-content"
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="flex-1 truncate font-medium">{user.name}</span>
                <form action={signOut}>
                  <button type="submit" className="btn btn-ghost h-11 rounded-full">
                    Log out
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/auth/sign-in" onClick={closeMenu} className="btn btn-outline h-11 rounded-full">
                  Sign in
                </Link>
                <Link href="/auth/sign-up" onClick={closeMenu} className="btn btn-ghost h-11 rounded-full">
                  Create account
                </Link>
              </div>
            )}

            {canCreateRecipes && (
              <Link href="/create-recipe" onClick={closeMenu} className="btn btn-primary h-12 w-full rounded-full">
                + Create recipe
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

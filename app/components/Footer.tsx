import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-base-200 bg-base-100 text-base-content">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Spalte 1: App Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-content text-xs font-bold">
                ⚡
              </span>
              <span>byteme</span>
            </div>
            <p className="max-w-xs text-xs text-base-content/60 leading-relaxed">
              Your daily kitchen companion. Discover recipes, cook with step-by-step timers, and keep your favorites
              organized.
            </p>
          </div>

          {/* Spalte 2: Navigation */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40">Navigation</p>
            <ul className="space-y-1.5 text-sm text-base-content/70">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/all-recipes" className="hover:text-primary transition-colors">
                  All Recipes
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-primary transition-colors">
                  Favorites
                </Link>
              </li>
              <li>
                <Link href="/create-recipe" className="hover:text-primary transition-colors">
                  Create Recipe
                </Link>
              </li>
            </ul>
          </div>

          {/* Spalte 3: Meta & Stack */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-base-content/40">Tech Stack</p>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Built with Next.js (App Router), Tailwind CSS, DaisyUI, and Neon PostgreSQL.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-base-200 pt-6 text-center text-xs text-base-content/40">
          © {currentYear} byteme. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

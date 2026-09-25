import Image from "next/image";
import Link from "next/link";

type FooterProps = {
  canCreateRecipes: boolean;
};

export default function Footer({ canCreateRecipes }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-base-200 bg-base-100 text-base-content">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Spalte 1: App Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-lg font-bold">
              <Image src="/logo.svg" alt="byteMe logo" width={40} height={40} className="h-7 w-7 object-contain" />
              <span>byteMe</span>
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
              {canCreateRecipes && (
                <li>
                  <Link href="/create-recipe" className="hover:text-primary transition-colors">
                    Create Recipe
                  </Link>
                </li>
              )}
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
          © {currentYear} byteMe. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

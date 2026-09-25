import Image from "next/image";
import Link from "next/link";

type FooterProps = {
  user: { name: string } | null;
  canCreateRecipes: boolean;
};

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "All recipes", href: "/all-recipes" },
  { label: "Favorites", href: "/favorites" },
  { label: "Shopping list", href: "/shopping-list" },
  { label: "Surprise me 🎲", href: "/recipe/random" },
];

const GITHUB_URL = "https://github.com/MonkeyDNaara/ByteMe";
const LEETCODE_URL = "https://leetcode.com/problemset/";

const linkClass = "transition-colors hover:text-link";
const headingClass =
  "text-xs font-semibold uppercase tracking-wider text-base-content/50";

export default function Footer({ user, canCreateRecipes }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-base-300 bg-base-100 text-base-content">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: brand */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-lg font-bold tracking-tight"
            >
              <Image
                src="/logo.svg"
                alt=""
                width={40}
                height={40}
                className="h-8 w-8 object-contain"
              />
              <span>
                byte<span className="text-link">Me</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-base-content/70">
              Your daily kitchen companion. Discover recipes, cook with
              step-by-step timers, and keep your favorites organized.
            </p>
          </div>

          {/* Column 2: explore */}
          <nav aria-label="Explore" className="space-y-3">
            <p className={headingClass}>Explore</p>
            <ul className="space-y-2 text-sm text-base-content/70">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: account */}
          <nav aria-label="Account" className="space-y-3">
            <p className={headingClass}>Account</p>
            <ul className="space-y-2 text-sm text-base-content/70">
              {user ? (
                <li className="truncate">
                  Signed in as{" "}
                  <span className="font-medium text-base-content">
                    {user.name}
                  </span>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/auth/sign-in" className={linkClass}>
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/sign-up" className={linkClass}>
                      Create account
                    </Link>
                  </li>
                </>
              )}
              {canCreateRecipes && (
                <li>
                  <Link href="/create-recipe" className={linkClass}>
                    Create recipe
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Column 4: project */}
          <div className="space-y-3">
            <p className={headingClass}>Project</p>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  GitHub repository ↗
                </a>
              </li>
              <li>Next.js · Tailwind CSS · daisyUI · Neon Postgres</li>
              <li>Team project · WBS Coding School</li>
            </ul>
            <a
              href={LEETCODE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm h-auto min-h-9 rounded-full py-1.5 text-left font-medium"
            >
              👩‍💻 Cooking for real software devs
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-base-300 pt-6 text-xs text-base-content/50 sm:flex-row">
          <span>© {currentYear} byteMe</span>
          <span>Made by Kevin, Eric &amp; Niko 💜</span>
        </div>
      </div>
    </footer>
  );
}

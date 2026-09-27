import type { ReactNode } from "react";

const PERKS = [
  { emoji: "💜", title: "Save your favorites", text: "All the recipes you love, in one place." },
  { emoji: "🛒", title: "Smart shopping list", text: "Ingredients combined automatically." },
  { emoji: "👩‍🍳", title: "Share your own recipes", text: "Once your account is approved." },
];

type AuthShellProps = {
  /** Headline in the pastel panel, e.g. "Welcome back to YOUR kitchen!" */
  panelTitle: ReactNode;
  children: ReactNode;
};

/** Split card: pastel perk panel on the left, the form on the right. */
export default function AuthShell({ panelTitle, children }: AuthShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-base-300 bg-base-200 shadow-xl md:grid-cols-2">
        <section className="flex flex-col gap-4 bg-primary/25 px-6 py-6 sm:px-10 md:gap-7 md:py-12">
          <span aria-hidden="true" className="text-4xl md:text-5xl">
            🍳
          </span>
          <h2 className="text-2xl font-extrabold leading-tight tracking-tight md:text-[34px]">{panelTitle}</h2>
          {/* Phone: only emoji + headline, the perk list is hidden */}
          <ul className="hidden flex-col gap-5 md:flex">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-base-100/70 text-2xl"
                >
                  {perk.emoji}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">{perk.title}</span>
                  <span className="text-sm text-base-content/70">{perk.text}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col justify-center gap-6 px-6 py-8 sm:px-12 md:py-12">{children}</section>
      </div>
    </div>
  );
}

/** Single card for the forgot / reset password screens. */
export function AuthCard({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <div className="flex flex-col gap-5 rounded-[2rem] border border-base-300 bg-base-200 p-7 shadow-xl sm:p-9">
        <span aria-hidden="true" className="text-4xl">
          {emoji}
        </span>
        {children}
      </div>
    </div>
  );
}

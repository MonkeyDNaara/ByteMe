import Link from "next/link";

type EmptyStateAction = { label: string; href: string };

type EmptyStateProps = {
  emoji: string;
  title: string;
  text: string;
  primary: EmptyStateAction;
  secondary?: EmptyStateAction;
};

/**
 * Friendly placeholder for pages without content yet, e.g. "No favorites yet",
 * "Sign in to unlock this", "Nothing to buy yet" or "Not approved yet".
 * Actions are links, so this stays a Server Component (no onClick needed).
 */
export default function EmptyState({ emoji, title, text, primary, secondary }: EmptyStateProps) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-box border-2 border-dashed border-primary/40 bg-base-200 px-6 py-14 text-center">
      <span aria-hidden="true" className="text-5xl">
        {emoji}
      </span>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="max-w-md text-base-content/70">{text}</p>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href={primary.href} className="btn btn-primary h-11 rounded-full px-6">
          {primary.label}
        </Link>
        {secondary && (
          <Link href={secondary.href} className="btn btn-ghost h-11 rounded-full px-6">
            {secondary.label}
          </Link>
        )}
      </div>
    </section>
  );
}

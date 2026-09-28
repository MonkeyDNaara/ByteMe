import type { ReactNode } from "react";

type SectionCardProps = {
  id: string;
  number: number;
  title: string;
  done: boolean;
  /** Red border + hint after a publish attempt with this section incomplete. */
  showError?: boolean;
  errorText?: string;
  badge?: ReactNode;
  children: ReactNode;
};

/** A numbered form section. The number becomes a green ✓ once it's valid. */
export default function SectionCard({ id, number, title, done, showError, errorText, badge, children }: SectionCardProps) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      // scroll-mt keeps the section below the sticky header when we scroll to it.
      className={`flex scroll-mt-24 flex-col gap-5 rounded-box border bg-base-200 p-5 transition-colors sm:p-7 ${
        showError ? "border-error" : "border-base-300"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold transition-colors ${
            done ? "bg-success text-success-content" : "bg-base-300 text-base-content"
          }`}
        >
          {done ? "✓" : number}
        </span>
        <h2 id={headingId} className="text-xl font-bold">
          {title}
          {done && <span className="sr-only"> (complete)</span>}
        </h2>
        {badge}
      </div>
      {children}
      {showError && errorText && (
        <p role="alert" className="text-sm font-medium text-error">
          ⚠️ {errorText}
        </p>
      )}
    </section>
  );
}

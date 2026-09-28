import type { ReactNode } from "react";

type StatusPageProps = {
  /** An emoji or a small illustration (e.g. <ChefSearching />). */
  visual: ReactNode;
  title: string;
  text: ReactNode;
  /** The buttons/links underneath. */
  actions: ReactNode;
  /** Optional small print below the actions (e.g. an error code). */
  footnote?: ReactNode;
};

/**
 * Shared layout for "something's off" pages: 404s and the error page.
 * No hooks, so it works in Server AND Client Components (error.tsx is a client one).
 */
export default function StatusPage({ visual, title, text, actions, footnote }: StatusPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:py-24">
      {visual}
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
      <p className="max-w-md text-base-content/70">{text}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">{actions}</div>
      {footnote && <p className="mt-2 text-xs text-base-content/70">{footnote}</p>}
    </section>
  );
}

export const statusPrimaryClass = "btn btn-primary h-11 rounded-full px-6";
export const statusSecondaryClass = "btn btn-ghost h-11 rounded-full px-6";

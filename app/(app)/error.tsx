"use client";

import { useEffect } from "react";
import Link from "next/link";

import StatusPage, { statusPrimaryClass, statusSecondaryClass } from "@/app/components/status/StatusPage";

type ErrorPageProps = {
  error: Error & { digest?: string };
  /** Re-renders the failed segment without a full page reload. */
  reset: () => void;
};

// Error boundary for all (app) pages, e.g. when the database can't be reached.
// Must be a Client Component (it gets `reset`, a function, from React).
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      visual={
        <span aria-hidden="true" className="text-7xl">
          🔥
        </span>
      }
      title="Something burned in the kitchen"
      text="An unexpected error happened on our side — not your fault. Give it another try in a moment."
      actions={
        <>
          <button type="button" onClick={reset} className={statusPrimaryClass}>
            Try again
          </button>
          <Link href="/" className={statusSecondaryClass}>
            Back home
          </Link>
        </>
      }
      // The digest is a server-side error id (no details leak to the browser)
      // -- handy to find the matching log line.
      footnote={error.digest ? `Error code: ${error.digest}` : undefined}
    />
  );
}

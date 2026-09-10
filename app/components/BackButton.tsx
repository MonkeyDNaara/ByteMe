"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  /** Destination when there is no browser history to go back to (e.g. the page was opened from a direct link). */
  fallbackHref?: string;
  className?: string;
};

export default function BackButton({
  fallbackHref = "/all-recipes",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn btn-ghost btn-sm w-fit gap-1 ${className}`}
    >
      ← Back
    </button>
  );
}

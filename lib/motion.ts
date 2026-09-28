import { useSyncExternalStore } from "react";

/**
 * "smooth" scrolling, unless the user turned animations off in their system
 * settings (prefers-reduced-motion) -- then jump instantly.
 * CSS `motion-safe:` can't reach `scrollIntoView()`, so JS asks the same question.
 * Call it in event handlers only (it reads `window`).
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Hook version for rendering (e.g. inline animation styles that CSS
 * `motion-safe:` can't override). Updates live if the setting changes.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

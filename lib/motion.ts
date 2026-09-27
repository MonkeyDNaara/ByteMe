/**
 * "smooth" scrolling, unless the user turned animations off in their system
 * settings (prefers-reduced-motion) -- then jump instantly.
 * CSS `motion-safe:` can't reach `scrollIntoView()`, so JS asks the same question.
 * Call it in event handlers only (it reads `window`).
 */
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

// Return-URL handling for sign-in / sign-up ("?next=/recipe/42").
// A plain module (no "use server" / "use client"): used by server actions,
// server pages and client components alike.

// Any origin works here -- it only lets `new URL()` resolve relative paths.
const BASE = "http://byteme.internal";

/**
 * Turns an untrusted `next` value into a safe, same-site path, or "/".
 *
 * `next` comes from the URL, so anyone can put anything in it. Without this
 * check, `/auth/sign-in?next=https://evil.example` would send a freshly
 * signed-in user to a look-alike site (an "open redirect", see OWASP).
 *
 * Allow-rule instead of a block-list: only a relative path starting with ONE
 * "/" is accepted, and it must still point at our own origin after the
 * browser-style URL parsing (which also catches tricks like "/\evil.com" or
 * tabs/newlines that the parser strips). /auth/* pages are rejected so a
 * sign-in can't redirect back to a sign-in page.
 */
export function getSafeNext(value: unknown): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 512) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";

  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return "/";
    if (url.pathname === "/auth" || url.pathname.startsWith("/auth/")) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

/** "/auth/sign-in?next=%2Frecipe%2F42" -- or the plain page if `next` would just be "/". */
export function withNext(page: "/auth/sign-in" | "/auth/sign-up", next: string | null | undefined): string {
  const safe = getSafeNext(next);
  return safe === "/" ? page : `${page}?next=${encodeURIComponent(safe)}`;
}

/** Client-only: the page the user is on right now (path + query). Call it in event handlers. */
export function currentPath(): string {
  return `${window.location.pathname}${window.location.search}`;
}

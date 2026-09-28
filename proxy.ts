import type { NextRequest } from "next/server";

import { auth } from "@/lib/auth/server";

// Optimistic guard only, and only checks "logged in at all" -- it can't know
// who owns a given recipe. The create/update/delete server actions re-check
// both the session and (for update/delete) ownership themselves, since
// server actions can be called without visiting the page.
const neonAuthMiddleware = auth.middleware({ loginUrl: "/auth/sign-in" });

/**
 * Wraps Neon's middleware to add `?next=<requested page>` to its login
 * redirect (it only forwards query params, not the path), so the user comes
 * back to e.g. /recipe/42/edit after signing in. The sign-in action validates
 * `next` again (getSafeNext) before redirecting.
 */
export default async function proxy(request: NextRequest) {
  const response = await neonAuthMiddleware(request);

  const location = response.headers.get("location");
  if (location) {
    const target = new URL(location, request.url);
    if (target.pathname === "/auth/sign-in") {
      target.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
      response.headers.set("location", target.toString());
    }
  }

  return response;
}

export const config = {
  matcher: ["/create-recipe/:path*", "/recipe/:id/edit"],
};

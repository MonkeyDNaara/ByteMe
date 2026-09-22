import { auth } from "@/lib/auth/server";

// Optimistic guard only, and only checks "logged in at all" -- it can't know
// who owns a given recipe. The create/update/delete server actions re-check
// both the session and (for update/delete) ownership themselves, since
// server actions can be called without visiting the page.
export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: ["/create-recipe/:path*", "/recipe/:id/edit"],
};

import { auth } from "@/lib/auth/server";

// Optimistic guard only: the create-recipe server action re-checks the
// session itself, since server actions can be called without visiting the page.
export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: ["/create-recipe/:path*"],
};

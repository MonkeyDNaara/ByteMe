import { notFound } from "next/navigation";

// (Same segment name as app/@modal/[...catchAll] -- Next.js needs both
// catch-alls to be named alike.) Any URL that matches no page lands here and triggers (app)/not-found.tsx,
// so a 404 still shows the normal header and footer. Without this catch-all,
// Next.js would use the root not-found -- and the root layout no longer has
// a header since the route groups split.
export default function CatchAllNotFound() {
  notFound();
}

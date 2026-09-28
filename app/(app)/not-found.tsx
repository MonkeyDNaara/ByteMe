import Link from "next/link";

import ChefSearching from "@/app/components/status/ChefSearching";
import StatusPage, { statusPrimaryClass, statusSecondaryClass } from "@/app/components/status/StatusPage";

// Shown for every unknown URL (via (app)/[...catchAll]) and every notFound()
// in (app) without a closer not-found.tsx -- with the normal header and footer.
export default function NotFound() {
  return (
    <StatusPage
        visual={<ChefSearching />}
        title="Page not found"
        text={
          <>
            We don&apos;t know what you were looking for.
            <br />
            One day, we might have something tasty here!
          </>
        }
        actions={
          <>
            <Link href="/" className={statusPrimaryClass}>
              Back home
            </Link>
            <Link href="/all-recipes" className={statusSecondaryClass}>
              Browse recipes
            </Link>
            <Link href="/random" className={statusSecondaryClass}>
              🎲 Surprise me
            </Link>
          </>
        }
    />
  );
}

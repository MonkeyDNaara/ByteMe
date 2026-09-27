import Link from "next/link";

import ChefSearching from "./ChefSearching";
import StatusPage, { statusPrimaryClass, statusSecondaryClass } from "./StatusPage";

/** "This recipe doesn't exist" -- used by the detail page AND cooking mode. */
export default function RecipeNotFound() {
  return (
    <StatusPage
        visual={<ChefSearching />}
        title="This recipe doesn't exist (anymore) 🥲"
        text="Maybe it was deleted, or the link has a typo. Plenty of other tasty things in the kitchen, though!"
        actions={
          <>
            <Link href="/all-recipes" className={statusPrimaryClass}>
              Browse recipes
            </Link>
            <Link href="/random" className={statusSecondaryClass}>
              🎲 Surprise me
            </Link>
            <Link href="/" className={statusSecondaryClass}>
              Back home
            </Link>
          </>
        }
    />
  );
}

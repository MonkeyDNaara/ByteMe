import { redirect } from "next/navigation";

import EmptyState from "@/app/components/EmptyState";
import { canCreateRecipes } from "@/dbQueries";
import { withNext } from "@/lib/auth/safeNext";
import { auth } from "@/lib/auth/server";

import CreateRecipeForm from "./CreateRecipeForm";

// `proxy.ts` already keeps signed-out visitors off this URL, but only checks
// "logged in at all" -- it can't know about the create-recipe permission.
// This page re-checks both (defense in depth, like the server actions).
export default async function CreateRecipePage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect(withNext("/auth/sign-in", "/create-recipe"));

  const allowed = await canCreateRecipes(session.user.id);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-10 sm:px-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Create a recipe 👩‍🍳</h1>
        {allowed && (
          <p className="text-base-content/70">
            Share your own recipe with the collection — fields with <span className="text-error">*</span> are required.
          </p>
        )}
      </header>

      {allowed ? (
        <CreateRecipeForm />
      ) : (
        <div className="pb-16">
          <EmptyState
            emoji="⏳"
            title="Almost there, chef!"
            text="Your account isn't approved to create recipes yet. Once an admin unlocks it, you can share your own recipes here."
            primary={{ label: "Browse recipes", href: "/all-recipes" }}
          />
        </div>
      )}
    </div>
  );
}

import { redirect } from "next/navigation";

import CreateRecipeForm from "./CreateRecipeForm";
import { auth } from "@/lib/auth/server";
import { canCreateRecipes } from "@/dbQueries";

// `proxy.ts` already keeps signed-out visitors off this URL, but only checks
// "logged in at all" -- it can't know about the create-recipe permission.
// This page re-checks both, the same defense-in-depth reasoning as the
// create/update/delete server actions re-checking session and ownership.
export default async function CreateRecipePage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const allowed = await canCreateRecipes(session.user.id);
  if (!allowed) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create a recipe
        </h1>
        <p className="text-sm text-base-content/70">
          Your account isn&apos;t approved to create recipes yet. Ask an admin
          to enable this for you.
        </p>
      </div>
    );
  }

  return <CreateRecipeForm />;
}

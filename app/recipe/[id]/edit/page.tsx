import { notFound, redirect } from "next/navigation";

import EditRecipeForm from "@/app/recipe/[id]/edit/EditRecipeForm";
import { auth } from "@/lib/auth/server";
import { getRecipeById, isRecipeOwner } from "@/lib/recipe";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: PageProps<"/recipe/[id]/edit">) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  // proxy.ts already redirects a logged-out visit to sign-in, so reaching
  // here means there's a session -- this only needs to check ownership.
  const { data: session } = await auth.getSession();
  if (!isRecipeOwner(recipe, session?.user?.id)) {
    redirect(`/recipe/${id}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Edit recipe
        </h1>
        <p className="text-sm text-base-content/70">
          Update the details below and save your changes.
        </p>
      </header>

      <EditRecipeForm recipe={recipe} />
    </div>
  );
}

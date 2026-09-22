"use client";

import { useRouter } from "next/navigation";

import RecipeForm from "@/app/components/RecipeForm";
import { createRecipe } from "@/dbQueries";

function CreateRecipe() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create a recipe
        </h1>
        <p className="text-sm text-base-content/70">
          Share your own recipe with the collection — fill in the details below.
        </p>
      </header>

      <RecipeForm
        action={createRecipe}
        submitLabel="Send Recipe"
        pendingLabel="Saving…"
        onSuccess={() => router.back()}
      />
    </div>
  );
}

export default CreateRecipe;

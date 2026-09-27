"use client";

import { useRouter } from "next/navigation";

import RecipeForm from "@/app/components/recipe-form/RecipeForm";
import { useToast } from "@/app/components/toast/ToastProvider";
import { createRecipe } from "@/dbQueries";

export default function CreateRecipeForm() {
  const router = useRouter();
  const showToast = useToast();

  return (
    <RecipeForm
      action={createRecipe}
      submitLabel="Publish recipe"
      pendingLabel="Publishing…"
      onSuccess={() => {
        showToast({ message: "🎉 Recipe published!" });
        // Newest first, so the new recipe is the first card.
        router.push("/all-recipes?sort=newest");
      }}
    />
  );
}

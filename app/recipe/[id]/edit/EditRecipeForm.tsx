"use client";

import { useRouter } from "next/navigation";

import RecipeForm from "@/app/components/RecipeForm";
import { updateRecipe } from "@/dbQueries";
import type { Recipe } from "@/lib/recipe";

type EditRecipeFormProps = {
  recipe: Recipe;
};

export default function EditRecipeForm({ recipe }: EditRecipeFormProps) {
  const router = useRouter();

  return (
    <RecipeForm
      action={updateRecipe.bind(null, Number(recipe.id))}
      defaultValues={{
        name: recipe.name,
        description: recipe.description,
        snippet: recipe.snippet,
        time: recipe.time,
        ingredients: recipe.ingredients,
        categories: recipe.categories,
        image_url: recipe.image_url,
        difficulty: recipe.difficulty,
      }}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      onSuccess={() => router.push(`/recipe/${recipe.id}`)}
    />
  );
}

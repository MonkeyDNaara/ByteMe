"use client";

import RecipeForm from "@/app/components/recipe-form/RecipeForm";
import { updateRecipe } from "@/dbQueries";
import type { Recipe } from "@/lib/recipe";

type EditRecipeFormProps = {
  recipe: Recipe;
};

export default function EditRecipeForm({ recipe }: EditRecipeFormProps) {
  return (
    <RecipeForm
      action={updateRecipe.bind(null, Number(recipe.id))}
      defaultValues={{
        name: recipe.name,
        description: recipe.description,
        snippet: recipe.snippet,
        time: recipe.time,
        ingredients: recipe.ingredientDetails,
        steps: recipe.steps,
        categories: recipe.categories,
        image_url: recipe.image_url,
        difficulty: recipe.difficulty,
      }}
      submitLabel="Save changes"
      pendingLabel="Saving…"
      draftScope={`edit:${recipe.id}`}
      deleteRecipeId={Number(recipe.id)}
      // Hard navigation on purpose: a soft one to /recipe/[id] would be
      // intercepted and open the recipe as a modal over this form.
      onSuccess={() => {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate, see above
        window.location.assign(`/recipe/${recipe.id}`);
      }}
    />
  );
}

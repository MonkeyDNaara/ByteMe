import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import CookingMode from "@/app/recipe/[id]/cook/CookingMode";
import { getRecipeById } from "@/lib/recipe";

export default async function CookRecipePage({
  params,
}: PageProps<"/recipe/[id]/cook">) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  // Guards a direct visit to this URL for a recipe with no steps -- the
  // "Start cooking" button itself is only ever shown when steps exist.
  if (recipe.steps.length === 0) {
    redirect(`/recipe/${id}`);
  }

  return <CookingMode recipe={recipe} />;
}

export const metadata: Metadata = {
  title: "Cooking",
};

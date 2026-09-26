import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getRecipeById } from "@/lib/recipe";

import CookingMode from "./CookingMode";

export async function generateMetadata({ params }: PageProps<"/recipe/[id]/cook">): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  return { title: recipe ? `Cooking: ${recipe.name}` : "Cooking" };
}

export default async function CookRecipePage({ params }: PageProps<"/recipe/[id]/cook">) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) notFound();

  // Guards a direct visit to this URL for a recipe with no steps -- the
  // "Start cooking" button itself is only ever shown when steps exist.
  if (recipe.steps.length === 0) redirect(`/recipe/${id}`);

  return <CookingMode recipe={recipe} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { loadRecipeDetails } from "@/app/components/recipe-details/loadRecipeDetails";
import RecipeDetails from "@/app/components/recipe-details/RecipeDetails";

export const dynamic = "force-dynamic";

// Tab title = recipe name. loadRecipeDetails is wrapped in React's cache(),
// so this and the page share ONE database query per request.
export async function generateMetadata({ params }: PageProps<"/recipe/[id]">): Promise<Metadata> {
  const { id } = await params;
  const data = await loadRecipeDetails(id);
  return { title: data?.recipe.name ?? "Recipe not found" };
}

export default async function RecipeDetailPage({ params }: PageProps<"/recipe/[id]">) {
  const { id } = await params;
  const data = await loadRecipeDetails(id);
  if (!data) notFound();

  return <RecipeDetails variant="page" {...data} />;
}

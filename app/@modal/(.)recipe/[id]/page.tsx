import { notFound } from "next/navigation";

import { loadRecipeDetails } from "@/app/components/recipe-details/loadRecipeDetails";
import RecipeDetails from "@/app/components/recipe-details/RecipeDetails";

// Intercepting route: "(.)recipe" catches soft navigations to /recipe/[id]
// from inside the app and renders them here, in the @modal slot, on top of
// the current page. A reload or shared link skips this and renders
// app/recipe/[id]/page.tsx instead.
export default async function RecipeModalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await loadRecipeDetails(id);
  if (!data) notFound();

  return <RecipeDetails variant="modal" {...data} />;
}

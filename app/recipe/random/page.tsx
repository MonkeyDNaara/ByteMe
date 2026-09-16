import { redirect } from "next/navigation";

import { getAllRecipes } from "@/lib/recipe";

// Must be picked fresh on every request, not baked into a static build --
// otherwise every click would land on the same recipe chosen once at build
// time. (Next.js resolves this static "/recipe/random" segment ahead of the
// dynamic "/recipe/[id]" segment, so it doesn't collide with a real recipe id.)
export const dynamic = "force-dynamic";

export default async function RandomRecipePage() {
  const recipes = await getAllRecipes();

  if (recipes.length === 0) {
    redirect("/all-recipes");
  }

  const recipe = recipes[Math.floor(Math.random() * recipes.length)];
  redirect(`/recipe/${recipe.id}`);
}

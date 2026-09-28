import RecipeNotFound from "@/app/components/status/RecipeNotFound";

// Cooking mode (/recipe/[id]/cook) for a recipe that does not exist. Without
// this file Next.js would fall back to its built-in unstyled 404, because
// (focus) has no not-found of its own. No header here, like the rest of (focus).
export default RecipeNotFound;

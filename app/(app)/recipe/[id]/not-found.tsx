import RecipeNotFound from "@/app/components/status/RecipeNotFound";

// Closer than (app)/not-found.tsx, so a missing /recipe/[id] (or its /edit)
// gets this recipe-specific message instead of the generic one.
export default RecipeNotFound;

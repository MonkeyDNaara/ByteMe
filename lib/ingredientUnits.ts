// Fixed unit list (rather than free text) so two recipes' amounts can
// actually be summed on the shopping list: "tbsp" from one recipe and
// "tablespoon" from another would otherwise never be recognized as the same
// unit. Its own plain module (no "use server"/"use client") since it's
// imported both by dbQueries.ts -- a "use server" file, which may only
// export async functions, not this constant -- and by lib/recipe.ts.
export const INGREDIENT_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "tsp",
  "tbsp",
  "cup",
  "clove",
  "slice",
  "pinch",
  "can",
  "package",
  "handful",
] as const;

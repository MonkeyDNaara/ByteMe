import type { MealType } from "@/lib/recipe";

// Theme-aware badge colour per meal: green / yellow / red.
// A plain module (no "use client"), so Server AND Client Components can import it.
export const mealBadge: Record<MealType, string> = {
  Breakfast: "badge-success",
  Lunch: "badge-warning",
  Dinner: "badge-error",
};

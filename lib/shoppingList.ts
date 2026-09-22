"use server";

import {
  addToShoppingList,
  getCheckedShoppingListItems,
  getShoppingListIngredients,
  getShoppingListRecipeIds,
  removeFromShoppingList,
  setShoppingListItemChecked,
  type ShoppingListIngredient,
} from "@/dbQueries";
import { auth } from "@/lib/auth/server";

/** The signed-in user's shopping-list recipe ids, or `[]` if there's no session. */
export async function getMyShoppingListRecipeIds(): Promise<string[]> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return [];

  const ids = await getShoppingListRecipeIds(session.user.id);
  return ids.map(String);
}

/** Adds or removes a recipe from the signed-in user's shopping list. Best-effort, like setFavorite. */
export async function setOnShoppingList(
  recipeId: string,
  onList: boolean,
): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return;

  const numericId = Number(recipeId);
  if (!Number.isFinite(numericId)) return;

  try {
    if (onList) {
      await addToShoppingList(session.user.id, numericId);
    } else {
      await removeFromShoppingList(session.user.id, numericId);
    }
  } catch (error) {
    console.error(`Failed to update shopping list for recipe ${recipeId}:`, error);
  }
}

export type ShoppingListSummaryItem = ShoppingListIngredient & {
  checked: boolean;
};

/** The aggregated, checkable ingredient list for the signed-in user, or `[]` if there's no session. */
export async function getMyShoppingListItems(): Promise<
  ShoppingListSummaryItem[]
> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return [];

  const [ingredients, checked] = await Promise.all([
    getShoppingListIngredients(session.user.id),
    getCheckedShoppingListItems(session.user.id),
  ]);

  const checkedKeys = new Set(
    checked.map((item) => `${item.name}\u0000${item.unit}`),
  );

  return ingredients.map((item) => ({
    ...item,
    checked: checkedKeys.has(`${item.name}\u0000${item.unit}`),
  }));
}

export async function setShoppingListItemCheckedAction(
  name: string,
  unit: string,
  checked: boolean,
): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return;

  try {
    await setShoppingListItemChecked(session.user.id, name, unit, checked);
  } catch (error) {
    console.error(`Failed to update checked state for ${name}:`, error);
  }
}

"use server";

import { z } from "zod";

import {
  addCustomShoppingListItem,
  addToShoppingList,
  getHaveItems,
  getCheckedShoppingListItems,
  getCustomShoppingListItems,
  getShoppingListIngredients,
  getShoppingListRecipeIds,
  removeCustomShoppingListItem,
  removeFromShoppingList,
  saveRecipeToShoppingList,
  setCustomShoppingListItemChecked,
  setShoppingListItemChecked,
  type CheckedItemKey,
  type CustomShoppingListItem,
  type ShoppingListIngredient,
} from "@/dbQueries";
import { auth } from "@/lib/auth/server";
import { INGREDIENT_UNITS } from "@/lib/ingredientUnits";

// Type-only re-export: erased at compile time, so it doesn't run into the
// "use server" restriction that every runtime export here must be an async
// function (see INGREDIENT_UNITS's own move out of dbQueries.ts for the same
// reason).
export type { CheckedItemKey, CustomShoppingListItem };

const customItemSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().positive().nullable(),
  unit: z.enum(["", ...INGREDIENT_UNITS]),
});

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

const haveItemsSchema = z
  .array(z.object({ name: z.string().min(1), unit: z.string() }))
  .max(200);

/** Ingredients the signed-in user already has for this recipe (ticked on the detail page), or `[]`. */
export async function getMyHaveItems(recipeId: string): Promise<CheckedItemKey[]> {
  const { data: session } = await auth.getSession();
  const numericId = Number(recipeId);
  if (!session?.user || !Number.isFinite(numericId)) return [];

  try {
    return await getHaveItems(session.user.id, numericId);
  } catch (error) {
    // Don't break the recipe page if this optional data can't load
    // (e.g. before the 001 migration has been run).
    console.error(`Failed to load have-items for recipe ${recipeId}:`, error);
    return [];
  }
}

/**
 * "Add missing to shopping list": puts the recipe on the list and stores
 * which of its ingredients the user already has. Returns `false` on failure
 * so the UI can show an error instead of a success toast.
 */
export async function saveMyRecipeToShoppingList(
  recipeId: string,
  have: CheckedItemKey[],
): Promise<boolean> {
  const { data: session } = await auth.getSession();
  const numericId = Number(recipeId);
  const parsed = haveItemsSchema.safeParse(have);
  if (!session?.user || !Number.isFinite(numericId) || !parsed.success) return false;

  try {
    await saveRecipeToShoppingList(session.user.id, numericId, parsed.data);
    return true;
  } catch (error) {
    console.error(`Failed to save recipe ${recipeId} to the shopping list:`, error);
    return false;
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

/** The signed-in user's own (not recipe-derived) shopping-list items, or `[]` if there's no session. */
export async function getMyCustomShoppingListItems(): Promise<
  CustomShoppingListItem[]
> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return [];

  return getCustomShoppingListItems(session.user.id);
}

/** Adds a custom item and returns the created row (with its new id), or `null` if there's no session or the input is invalid. */
export async function addMyCustomShoppingListItem(
  name: string,
  amount: number | null,
  unit: string,
): Promise<CustomShoppingListItem | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;

  const parsed = customItemSchema.safeParse({ name, amount, unit });
  if (!parsed.success) return null;

  try {
    return await addCustomShoppingListItem(
      session.user.id,
      parsed.data.name,
      parsed.data.amount,
      parsed.data.unit,
    );
  } catch (error) {
    console.error(`Failed to add custom shopping list item ${name}:`, error);
    return null;
  }
}

export async function removeMyCustomShoppingListItem(
  itemId: number,
): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return;

  try {
    await removeCustomShoppingListItem(session.user.id, itemId);
  } catch (error) {
    console.error(`Failed to remove custom shopping list item ${itemId}:`, error);
  }
}

export async function setMyCustomShoppingListItemChecked(
  itemId: number,
  checked: boolean,
): Promise<void> {
  const { data: session } = await auth.getSession();
  if (!session?.user) return;

  try {
    await setCustomShoppingListItemChecked(session.user.id, itemId, checked);
  } catch (error) {
    console.error(`Failed to update checked state for item ${itemId}:`, error);
  }
}

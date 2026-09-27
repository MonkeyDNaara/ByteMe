-- 001 · shopping_list_have_items
-- Backlog 1: "tick off what you have" on the recipe detail page.
--
-- One row = "for recipe X on my shopping list, I already have ingredient Y".
-- getShoppingListIngredients (dbQueries.ts) skips these rows with a
-- NOT EXISTS anti-join, so the list only shows what's still missing.
--
-- The composite FOREIGN KEY ties every row to its (user, recipe) entry in
-- shopping_list_recipes: removing the recipe from the list deletes its
-- "have" rows automatically (ON DELETE CASCADE) -- no cleanup code needed.
--
-- Run once in the Neon SQL editor. Before that, check that the column types
-- match shopping_list_recipes (the FK fails if they don't):
--   SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'shopping_list_recipes';

CREATE TABLE IF NOT EXISTS shopping_list_have_items (
  user_id   UUID    NOT NULL,
  recipe_id INTEGER NOT NULL,
  name      TEXT    NOT NULL,
  unit      TEXT    NOT NULL DEFAULT '',
  added_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id, name, unit),
  FOREIGN KEY (user_id, recipe_id)
    REFERENCES shopping_list_recipes (user_id, recipe_id)
    ON DELETE CASCADE
);

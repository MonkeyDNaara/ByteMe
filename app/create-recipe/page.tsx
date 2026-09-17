"use client";

import { createRecipe, RecipeState } from "@/dbQueries";
import {
  CATEGORY_GROUPS,
  getCategoryGroup,
  REQUIRED_CATEGORY_GROUP,
} from "@/lib/recipe";
import {
  type SyntheticEvent,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

function CreateRecipe() {
  const router = useRouter();
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const handleCreateRecipe = async (
    prevState: RecipeState,
    formData: FormData,
  ): Promise<RecipeState> => {
    return await createRecipe(prevState, formData);
  };

  const [state, formAction, isPending] = useActionState(
    handleCreateRecipe,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.back();
    }
  }, [state, router]);

  const addIngredient = () => {
    if (!ingredient.trim()) return;
    setIngredients([...ingredients, ingredient.trim()]);
    setIngredient("");
    setIngredientsError(null);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    // Native `required` covers the plain text/number fields. Ingredients and
    // categories are both submitted as repeated fields (hidden inputs /
    // checkboxes sharing a name), which `required` can't express as "at
    // least one of these" -- so that's checked here instead.
    if (ingredients.length === 0) {
      event.preventDefault();
      setIngredientsError("Add at least one ingredient.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const selectedCategories = formData.getAll("categories").map(String);
    const hasRequiredGroup = selectedCategories.some(
      (category) => getCategoryGroup(category) === REQUIRED_CATEGORY_GROUP,
    );
    if (!hasRequiredGroup) {
      event.preventDefault();
      setCategoryError("Select at least one meal or course type.");
      return;
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create a recipe
        </h1>
        <p className="text-sm text-base-content/70">
          Share your own recipe with the collection — fill in the details below.
        </p>
      </header>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="card flex flex-col gap-5 bg-base-200 p-6 shadow-md sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-semibold">
            Recipe name<span className="ml-1 text-error">*</span>
          </label>{" "}
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your recipe name"
            required
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-semibold">
            Description<span className="ml-1 text-error">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe your recipe here"
            rows={4}
            required
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="snippet" className="text-sm font-semibold">
            Short description<span className="ml-1 text-error">*</span>
          </label>
          <input
            id="snippet"
            name="snippet"
            type="text"
            placeholder="Give a short recipe description"
            required
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="time" className="text-sm font-semibold">
            Prep / cook time (minutes)<span className="ml-1 text-error">*</span>
          </label>
          <input
            id="time"
            name="time"
            type="number"
            placeholder="45"
            required
            className="input input-bordered w-full sm:w-40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ingredient" className="text-sm font-semibold">
            Ingredients<span className="ml-1 text-error">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="ingredient"
              type="text"
              value={ingredient}
              onChange={(event) => setIngredient(event.target.value)}
              placeholder="Tomato"
              className="input input-bordered w-full"
            />
            <button
              type="button"
              onClick={addIngredient}
              className="btn btn-primary btn-sm shrink-0"
            >
              Add
            </button>
          </div>

          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ingredients.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="badge badge-outline gap-2"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    aria-label={`Remove ${item}`}
                    className="text-base-content/60 hover:text-error"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {ingredients.map((item, index) => (
            <input
              key={`hidden-${item}-${index}`}
              type="hidden"
              name="ingredients"
              value={item}
            />
          ))}

          {ingredientsError && (
            <p className="text-sm text-error">{ingredientsError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="image" className="text-sm font-semibold">
            Image URL<span className="ml-1 text-error">*</span>
          </label>
          <input
            id="image"
            name="image_url"
            type="text"
            placeholder="Image URL"
            required
            className="input input-bordered w-full"
          />
        </div>

        <div
          onChange={() => setCategoryError(null)}
          className="flex flex-col gap-4"
        >
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.name} className="flex flex-col gap-2">
              <p className="text-sm font-semibold">
                {group.name}
                {group.name === REQUIRED_CATEGORY_GROUP && (
                  <span className="ml-1 text-error">*</span>
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                {group.options.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="categories"
                      value={value}
                      className="checkbox checkbox-sm"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          ))}
          {categoryError && (
            <p className="text-sm text-error">{categoryError}</p>
          )}
        </div>

        {state && !state.success && state.message && (
          <div role="alert" className="alert alert-error">
            <span>{state.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary w-full"
        >
          {isPending ? "Saving…" : "Send Recipe"}
        </button>
      </form>
    </div>
  );
}

export default CreateRecipe;
